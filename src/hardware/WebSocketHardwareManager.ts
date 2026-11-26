import { HardwareManager, HardwareStatusCallback, SensorEventCallback } from './HardwareManager';
import { HardwareStatus, SensorEvent, SensorEventType } from '../types';
import { SensorEventFactory } from './SensorEvent';

const DEFAULT_WS_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WS_URL)
  || 'ws://localhost:8000/api/hardware/ws';

export class WebSocketHardwareManager implements HardwareManager {
  readonly type = 'websocket' as const;

  private wsUrl: string;
  private ws: WebSocket | null = null;
  private status: HardwareStatus = {
    isConnected: false,
    isScanning: false,
    deviceName: null,
    deviceId: null,
    batteryLevel: null,
    firmwareVersion: null,
    connectionType: 'websocket',
    rssi: null,
    error: null,
  };

  private eventListeners: Set<SensorEventCallback> = new Set();
  private statusListeners: Set<HardwareStatusCallback> = new Set();
  private history: SensorEvent[] = [];
  private readonly maxHistoryLength = 100;
  private reconnectTimer: any = null;

  constructor(wsUrl: string = DEFAULT_WS_URL) {
    this.wsUrl = wsUrl;
  }

  isSupported(): boolean {
    return typeof WebSocket !== 'undefined';
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.updateStatus({ isScanning: true, error: null });

      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          this.updateStatus({
            isConnected: true,
            isScanning: false,
            deviceName: 'DIVAD-WS-Bridge-ESP32',
            deviceId: 'WS-BRIDGE-LOCAL',
            batteryLevel: 90,
            firmwareVersion: 'ESP32-WS-v1.0',
            error: null,
          });

          const connEvent = SensorEventFactory.create('DEVICE_CONNECTED', 'websocket', {
            bridge: this.wsUrl,
          });
          this.notifyEventListeners(connEvent);
          resolve(true);
        };

        this.ws.onmessage = (message) => {
          try {
            const data = JSON.parse(message.data);
            if (data.event) {
              const sensorEvent = SensorEventFactory.create(
                data.event as SensorEventType,
                'websocket',
                data.payload,
                data.deviceId || 'WS-ESP32'
              );
              this.recordEvent(sensorEvent);
              this.notifyEventListeners(sensorEvent);
            }
          } catch (e) {
            console.error('[WebSocketHardware] Bad JSON message:', message.data);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('[WebSocketHardware] Connection error:', err);
          this.updateStatus({
            isConnected: false,
            isScanning: false,
            error: `Could not connect to WebSocket bridge at ${this.wsUrl}. Make sure the local hardware bridge is running.`,
          });
          resolve(false);
        };

        this.ws.onclose = () => {
          this.updateStatus({
            isConnected: false,
            isScanning: false,
            error: 'WebSocket bridge disconnected.',
          });
        };
      } catch (err: any) {
        this.updateStatus({
          isConnected: false,
          isScanning: false,
          error: err.message || 'WebSocket initialization failed',
        });
        resolve(false);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
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
    callback({ ...this.status });
    return () => this.statusListeners.delete(callback);
  }

  async sendCommand(command: number | string | Uint8Array): Promise<boolean> {
    if (!this.status.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      this.ws.send(JSON.stringify({ command, timestamp: Date.now() }));
      return true;
    } catch {
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
    const sensorEvent = SensorEventFactory.create(
      event,
      'websocket',
      payload,
      this.status.deviceId || 'WS-DEVICE'
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
        console.error('[WebSocketHardware] Listener error:', err);
      }
    });
  }

  private notifyStatusListeners(): void {
    const snapshot = { ...this.status };
    this.statusListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[WebSocketHardware] Status listener error:', err);
      }
    });
  }

  private updateStatus(partial: Partial<HardwareStatus>): void {
    this.status = { ...this.status, ...partial };
    this.notifyStatusListeners();
  }
}

