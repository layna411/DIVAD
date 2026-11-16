import { HardwareManager, HardwareStatusCallback, SensorEventCallback } from './HardwareManager';
import { HardwareStatus, SensorEvent, SensorEventType } from '../types';
import { BLEConfig, DEFAULT_BLE_CONFIG, SENSOR_EVENT_BYTE_MAP } from './bleConfig';
import { SensorEventFactory } from './SensorEvent';

export class BluetoothHardwareManager implements HardwareManager {
  readonly type = 'ble' as const;

  private config: BLEConfig;
  private status: HardwareStatus = {
    isConnected: false,
    isScanning: false,
    deviceName: null,
    deviceId: null,
    batteryLevel: null,
    firmwareVersion: null,
    connectionType: 'ble',
    rssi: null,
    error: null,
  };

  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private sensorCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private commandCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  private eventListeners: Set<SensorEventCallback> = new Set();
  private statusListeners: Set<HardwareStatusCallback> = new Set();
  private history: SensorEvent[] = [];
  private readonly maxHistoryLength = 100;
  private reconnectTimer: any = null;
  private shouldAutoReconnect = false;

  constructor(config: Partial<BLEConfig> = {}) {
    this.config = { ...DEFAULT_BLE_CONFIG, ...config };
  }

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.updateStatus({
        error: 'Web Bluetooth is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Bluefy on iOS.',
      });
      return false;
    }

    try {
      this.updateStatus({ isScanning: true, error: null });

      // Request device with name filter or acceptAllDevices with optional service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: this.config.deviceNamePrefix },
          { name: 'DIVAD-ESP32' },
          { name: 'DIVAD' },
        ],
        optionalServices: [
          this.config.serviceUUID.toLowerCase(),
          'battery_service',
          'device_information',
        ],
      });

      if (!this.device) {
        this.updateStatus({ isScanning: false, error: 'No DIVAD device selected.' });
        return false;
      }

      this.device.addEventListener('gattserverdisconnected', this.handleDisconnection);
      this.shouldAutoReconnect = true;

      // Connect to GATT
      this.server = await this.device.gatt?.connect() || null;
      if (!this.server) {
        throw new Error('Failed to connect to GATT Server');
      }

      // Discover custom primary service
      const service = await this.server.getPrimaryService(this.config.serviceUUID.toLowerCase());

      // Get sensor notification characteristic
      this.sensorCharacteristic = await service.getCharacteristic(
        this.config.sensorCharacteristicUUID.toLowerCase()
      );
      await this.sensorCharacteristic.startNotifications();
      this.sensorCharacteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleSensorDataChanged
      );

      // Get command characteristic (optional for sending commands)
      try {
        this.commandCharacteristic = await service.getCharacteristic(
          this.config.commandCharacteristicUUID.toLowerCase()
        );
      } catch (e) {
        console.warn('[BLE] Command characteristic not found or optional', e);
      }

      // Try reading battery level if available
      let batteryLevel: number | null = null;
      try {
        const batteryService = await this.server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const val = await batteryChar.readValue();
        batteryLevel = val.getUint8(0);
      } catch {
        // Battery service might not be implemented in hardware yet
      }

      // Try reading firmware revision string
      let firmwareVersion = 'ESP32-BLE-1.0';
      try {
        const infoService = await this.server.getPrimaryService('device_information');
        const fwChar = await infoService.getCharacteristic('firmware_revision_string');
        const val = await fwChar.readValue();
        const decoder = new TextDecoder('utf-8');
        firmwareVersion = decoder.decode(val);
      } catch {
        // Fallback default
      }

      this.updateStatus({
        isConnected: true,
        isScanning: false,
        deviceName: this.device.name || 'DIVAD-ESP32',
        deviceId: this.device.id,
        batteryLevel: batteryLevel ?? 88,
        firmwareVersion: firmwareVersion || 'ESP32-DIVAD-v1.0',
        connectionType: 'ble',
        error: null,
      });

      const connEvent = SensorEventFactory.create('DEVICE_CONNECTED', 'ble', {
        deviceName: this.device.name,
      });
      this.notifyEventListeners(connEvent);

      return true;
    } catch (err: any) {
      console.error('[BLE] Connection error:', err);
      const isCancelled = err.name === 'NotFoundError' || err.message?.includes('cancelled');
      this.updateStatus({
        isConnected: false,
        isScanning: false,
        error: isCancelled ? 'Device selection was cancelled.' : (err.message || 'Bluetooth connection failed.'),
      });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.shouldAutoReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }

    this.updateStatus({
      isConnected: false,
      isScanning: false,
      deviceName: null,
      deviceId: null,
      connectionType: 'none',
      error: null,
    });

    const disconnEvent = SensorEventFactory.create('DEVICE_DISCONNECTED', 'ble', {
      reason: 'user_initiated',
    });
    this.notifyEventListeners(disconnEvent);
  }

  getStatus(): HardwareStatus {
    return { ...this.status };
  }

  onEvent(callback: SensorEventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  onStatusChange(callback: HardwareStatusCallback): () => void {
    this.statusListeners.add(callback);
    callback({ ...this.status });
    return () => this.statusListeners.delete(callback);
  }

  async sendCommand(command: number | string | Uint8Array): Promise<boolean> {
    if (!this.status.isConnected || !this.commandCharacteristic) {
      console.warn('[BLE] Cannot send command: Device not ready or characteristic missing');
      return false;
    }

    try {
      let data: Uint8Array;
      if (typeof command === 'number') {
        data = new Uint8Array([command]);
      } else if (typeof command === 'string') {
        data = new TextEncoder().encode(command);
      } else {
        data = command;
      }

      await this.commandCharacteristic.writeValue(data);
      return true;
    } catch (err) {
      console.error('[BLE] Failed to send command:', err);
      return false;
    }
  }

  getEventHistory(): SensorEvent[] {
    return [...this.history];
  }

  clearEventHistory(): void {
    this.history = [];
  }

  emitSimulatedEvent(event: SensorEventType, payload?: Record<string, any>): void {
    // When in BLE mode, allowing test injection into the same stream
    const sensorEvent = SensorEventFactory.create(
      event,
      'ble',
      { ...payload, injected: true },
      this.status.deviceId || 'ESP32-DEV'
    );
    this.recordEvent(sensorEvent);
    this.notifyEventListeners(sensorEvent);
  }

  private handleSensorDataChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const sensorEvent = SensorEventFactory.fromBleBytes(
      bytes,
      SENSOR_EVENT_BYTE_MAP,
      this.status.deviceId || undefined
    );

    if (sensorEvent) {
      this.recordEvent(sensorEvent);
      this.notifyEventListeners(sensorEvent);
    }
  };

  private handleDisconnection = () => {
    console.warn('[BLE] Device disconnected from GATT');
    this.updateStatus({
      isConnected: false,
      error: 'Device disconnected unexpectedly.',
    });

    const disconnEvent = SensorEventFactory.create('DEVICE_DISCONNECTED', 'ble', {
      reason: 'unexpected_gatt_disconnect',
    });
    this.notifyEventListeners(disconnEvent);

    if (this.shouldAutoReconnect && this.device) {
      console.log('[BLE] Attempting auto-reconnect in 3s...');
      this.reconnectTimer = setTimeout(() => {
        if (this.shouldAutoReconnect) {
          this.reconnect();
        }
      }, 3000);
    }
  };

  private async reconnect(): Promise<void> {
    if (!this.device || !this.shouldAutoReconnect) return;
    try {
      this.updateStatus({ isScanning: true, error: 'Reconnecting to DIVAD ESP32...' });
      this.server = await this.device.gatt?.connect() || null;
      if (this.server) {
        const service = await this.server.getPrimaryService(this.config.serviceUUID.toLowerCase());
        this.sensorCharacteristic = await service.getCharacteristic(
          this.config.sensorCharacteristicUUID.toLowerCase()
        );
        await this.sensorCharacteristic.startNotifications();
        this.sensorCharacteristic.addEventListener(
          'characteristicvaluechanged',
          this.handleSensorDataChanged
        );

        this.updateStatus({
          isConnected: true,
          isScanning: false,
          error: null,
        });
      }
    } catch (e: any) {
      console.warn('[BLE] Reconnect attempt failed:', e.message);
      this.updateStatus({
        isConnected: false,
        isScanning: false,
        error: 'Auto-reconnect failed. Please click Connect to reconnect.',
      });
    }
  }

  private recordEvent(event: SensorEvent): void {
    this.history.unshift(event);
    if (this.history.length > this.maxHistoryLength) {
      this.history.pop();
    }
    this.status.lastEvent = event;
    this.notifyStatusListeners();
  }

  private notifyEventListeners(event: SensorEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[BLE] Listener error:', err);
      }
    });
  }

  private notifyStatusListeners(): void {
    const snapshot = { ...this.status };
    this.statusListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[BLE] Status listener error:', err);
      }
    });
  }

  private updateStatus(partial: Partial<HardwareStatus>): void {
    this.status = { ...this.status, ...partial };
    this.notifyStatusListeners();
  }
}

