import { SensorEvent, SensorEventType } from '../types';

export class SensorEventFactory {
  static create(
    event: SensorEventType,
    source: 'simulation' | 'ble' | 'websocket',
    payload?: Record<string, any>,
    deviceId?: string,
    rawBytes?: Uint8Array
  ): SensorEvent {
    return {
      event,
      timestamp: Date.now(),
      source,
      deviceId,
      payload,
      rawBytes,
    };
  }

  static fromBleBytes(bytes: Uint8Array, byteMap: Record<number, string>, deviceId?: string): SensorEvent | null {
    if (!bytes || bytes.length === 0) return null;
    const opcode = bytes[0];
    const eventName = byteMap[opcode] as SensorEventType;
    if (!eventName) {
      console.warn(`[SensorEventFactory] Unknown BLE opcode received: 0x${opcode.toString(16)}`);
      return null;
    }

    const payload: Record<string, any> = {
      opcode,
      extraData: bytes.length > 1 ? Array.from(bytes.slice(1)) : [],
    };

    return this.create(eventName, 'ble', payload, deviceId, bytes);
  }
}

