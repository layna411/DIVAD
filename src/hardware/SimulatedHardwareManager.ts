import { HardwareManager, HardwareStatusCallback, SensorEventCallback } from './HardwareManager';
import { HardwareStatus, SensorEvent, SensorEventType } from '../types';
import { SensorEventFactory } from './SensorEvent';

export class SimulatedHardwareManager implements HardwareManager {
  readonly type = 'simulation' as const;

  private status: HardwareStatus = {
    isConnected: true,
    isScanning: false,
    deviceName: 'DIVAD-SIM-ESP32-V1',
    deviceId: 'SIM-AA:BB:CC:11:22:33',
    batteryLevel: 94,
    firmwareVersion: 'ESP32-DIVAD-v1.4.2-SIM',
    connectionType: 'simulation',
    rssi: -58,
    error: null,
  };

  private eventListeners: Set<SensorEventCallback> = new Set();
  private statusListeners: Set<HardwareStatusCallback> = new Set();
  private history: SensorEvent[] = [];
  private readonly maxHistoryLength = 100;

  constructor(autoConnect: boolean = true) {
    if (!autoConnect) {
      this.status = {
        ...this.status,
        isConnected: false,
        deviceName: null,
        deviceId: null,
        connectionType: 'none',
      };
    }
  }

  isSupported(): boolean {
    return true; // Simulation runs in any environment
  }

  async connect(): Promise<boolean> {
    this.updateStatus({ isScanning: true, error: null });

    // Simulate short BLE discovery handshake delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    this.updateStatus({
      isConnected: true,
      isScanning: false,
      deviceName: 'DIVAD-SIM-ESP32-V1',
      deviceId: 'SIM-AA:BB:CC:11:22:33',
      batteryLevel: 94,
      firmwareVersion: 'ESP32-DIVAD-v1.4.2-SIM',
      connectionType: 'simulation',
      rssi: -55,
      error: null,
    });

    const connEvent = SensorEventFactory.create('DEVICE_CONNECTED', 'simulation', {
      deviceName: this.status.deviceName,
      batteryLevel: this.status.batteryLevel,
    });
    this.notifyEventListeners(connEvent);

    return true;
  }

  async disconnect(): Promise<void> {
    const disconnEvent = SensorEventFactory.create('DEVICE_DISCONNECTED', 'simulation', {
      reason: 'manual_disconnect',
    });
    this.notifyEventListeners(disconnEvent);

    this.updateStatus({
      isConnected: false,
      isScanning: false,
      connectionType: 'none',
      error: null,
    });
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
    // Send immediate snapshot
    callback({ ...this.status });
    return () => this.statusListeners.delete(callback);
  }

  async sendCommand(command: number | string | Uint8Array): Promise<boolean> {
    if (!this.status.isConnected) {
      console.warn('[SimulatedHardware] Cannot send command: Device disconnected');
      return false;
    }

    console.log('[SimulatedHardware] Received command from app:', command);
    return true;
  }

  getEventHistory(): SensorEvent[] {
    return [...this.history];
  }

  clearEventHistory(): void {
    this.history = [];
  }

  emitSimulatedEvent(event: SensorEventType, payload?: Record<string, any>): void {
    if (!this.status.isConnected) {
      console.warn(`[SimulatedHardware] Ignored event ${event} - hardware is disconnected`);
      return;
    }

    const sensorEvent = SensorEventFactory.create(
      event,
      'simulation',
      payload,
      this.status.deviceId || 'SIM-DEVICE'
    );

    this.recordEvent(sensorEvent);
    this.notifyEventListeners(sensorEvent);
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
        console.error('[SimulatedHardware] Listener error:', err);
      }
    });
  }

  private notifyStatusListeners(): void {
    const snapshot = { ...this.status };
    this.statusListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[SimulatedHardware] Status listener error:', err);
      }
    });
  }

  private updateStatus(partial: Partial<HardwareStatus>): void {
    this.status = { ...this.status, ...partial };
    this.notifyStatusListeners();
  }
}

