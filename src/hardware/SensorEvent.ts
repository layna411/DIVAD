import { SensorEvent, SensorEventType } from '../types';
import { SENSOR_EVENT_STRING_MAP } from './bleConfig';

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

    // 1. Check if first byte matches binary opcode table
    const opcode = bytes[0];
    const eventNameFromOpcode = byteMap[opcode] as SensorEventType;
    if (eventNameFromOpcode) {
      const payload: Record<string, any> = {
        opcode,
        extraData: bytes.length > 1 ? Array.from(bytes.slice(1)) : [],
      };
      return this.create(eventNameFromOpcode, 'ble', payload, deviceId, bytes);
    }

    // 2. Check if bytes represent UTF-8 string or JSON (common in Arduino/ESP32 text outputs)
    try {
      const text = new TextDecoder('utf-8').decode(bytes).trim();
      
      // Try JSON format (e.g. {"event":"BUTTON_FASTENED"})
      if (text.startsWith('{') && text.endsWith('}')) {
        const obj = JSON.parse(text);
        const eventName = (obj.event || obj.name || obj.type || '') as string;
        const normalized = SENSOR_EVENT_STRING_MAP[eventName.toUpperCase()];
        if (normalized) {
          return this.create(normalized as SensorEventType, 'ble', obj, deviceId, bytes);
        }
      }

      // Try Plain String format (e.g. "BUTTON_FASTENED" or "BUTTON:1")
      const cleanUpper = text.toUpperCase().replace(/[\r\n]/g, '');
      const mapped = SENSOR_EVENT_STRING_MAP[cleanUpper];
      if (mapped) {
        return this.create(mapped as SensorEventType, 'ble', { rawText: text }, deviceId, bytes);
      }
    } catch {
      // Ignore text decoding failure
    }

    console.warn(`[SensorEventFactory] Unrecognized BLE packet: byte 0x${opcode.toString(16)} (length ${bytes.length})`);
    return null;
  }
}
