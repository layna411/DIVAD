import { HardwareStatus, SensorEvent, SensorEventType } from '../types';

export type SensorEventCallback = (event: SensorEvent) => void;
export type HardwareStatusCallback = (status: HardwareStatus) => void;

/**
 * Common TypeScript interface for DIVAD hardware communication.
 * Implemented by:
 * 1. SimulatedHardwareManager
 * 2. BluetoothHardwareManager
 * 3. WebSocketHardwareManager
 */
export interface HardwareManager {
  readonly type: 'simulation' | 'ble' | 'websocket';

  /**
   * Check if this communication method is supported on the current device/browser
   */
  isSupported(): boolean;

  /**
   * Connect to the hardware (or activate simulation session)
   */
  connect(): Promise<boolean>;

  /**
   * Disconnect from hardware
   */
  disconnect(): Promise<void>;

  /**
   * Get current hardware connection and battery/firmware status
   */
  getStatus(): HardwareStatus;

  /**
   * Subscribe to incoming sensor events (fastened, unfastened, zipped, etc.)
   * Returns an unsubscribe function.
   */
  onEvent(callback: SensorEventCallback): () => void;

  /**
   * Subscribe to connection status changes
   * Returns an unsubscribe function.
   */
  onStatusChange(callback: HardwareStatusCallback): () => void;

  /**
   * Send command to ESP32 (e.g. trigger buzzer, LED pattern, reset)
   */
  sendCommand(command: number | string | Uint8Array): Promise<boolean>;

  /**
   * Retrieve list of recently recorded events (for history / inspection)
   */
  getEventHistory(): SensorEvent[];

  /**
   * Clear event history
   */
  clearEventHistory(): void;

  /**
   * For testing/simulation: manually trigger a sensor event
   */
  emitSimulatedEvent(event: SensorEventType, payload?: Record<string, any>): void;
}

