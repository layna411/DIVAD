/**
 * Bluetooth Low Energy (BLE) Configuration for ESP32 DIVAD Hardware
 * 
 * Supports:
 * 1. Native Custom DIVAD Primary Service
 * 2. Nordic UART Service (NUS) fallback widely used in Arduino/ESP-IDF BLE
 * 3. Standard SIG Battery & Device Information services
 */

export interface BLEConfig {
  deviceNamePrefix: string;
  serviceUUID: string;
  sensorCharacteristicUUID: string;
  commandCharacteristicUUID: string;
  batteryCharacteristicUUID: string;
  firmwareCharacteristicUUID: string;
  fallbackServiceUUIDs: string[];
}

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

export const DEFAULT_BLE_CONFIG: BLEConfig = {
  // ESP32 advertising name prefix from .env
  deviceNamePrefix: metaEnv.VITE_BLE_DEVICE_PREFIX || 'DIVAD',
  
  // Custom 128-bit Primary Service UUID for DIVAD dressing board from .env
  serviceUUID: metaEnv.VITE_BLE_SERVICE_UUID || '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
  
  // Characteristic for sensor notifications (ESP32 -> Web App)
  sensorCharacteristicUUID: metaEnv.VITE_BLE_SENSOR_CHAR_UUID || 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
  
  // Characteristic for commands and feedback signals (Web App -> ESP32)
  commandCharacteristicUUID: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  
  // Standard Battery Service Characteristic (UUID 0x2A19)
  batteryCharacteristicUUID: '00002a19-0000-1000-8000-00805f9b34fb',
  
  // Standard Firmware Revision String (UUID 0x2A26)
  firmwareCharacteristicUUID: '00002a26-0000-1000-8000-00805f9b34fb',

  // Fallback service UUIDs (e.g. Nordic UART Service)
  fallbackServiceUUIDs: [
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
  ],
};

export const SENSOR_EVENT_BYTE_MAP: Record<number, string> = {
  0x01: 'BUTTON_FASTENED',
  0x02: 'BUTTON_UNFASTENED',
  0x11: 'ZIPPER_CLOSED',
  0x12: 'ZIPPER_OPENED',
  0x21: 'VELCRO_ATTACHED',
  0x22: 'VELCRO_DETACHED',
  0x31: 'SNAP_CONNECTED',
  0x32: 'SNAP_DISCONNECTED',
  0x41: 'BUCKLE_LOCKED',
  0x42: 'BUCKLE_UNLOCKED',
  0x51: 'RED_FASTENER_COMPLETED',
};

// String to Event Type matching for ASCII BLE packets
export const SENSOR_EVENT_STRING_MAP: Record<string, string> = {
  'BUTTON_FASTENED': 'BUTTON_FASTENED',
  'BUTTON_CLOSED': 'BUTTON_FASTENED',
  'BUTTON_1': 'BUTTON_FASTENED',
  'BTN_FASTENED': 'BUTTON_FASTENED',
  'BUTTON_UNFASTENED': 'BUTTON_UNFASTENED',
  'BUTTON_OPENED': 'BUTTON_UNFASTENED',
  'BUTTON_0': 'BUTTON_UNFASTENED',

  'ZIPPER_CLOSED': 'ZIPPER_CLOSED',
  'ZIP_CLOSED': 'ZIPPER_CLOSED',
  'ZIPPER_1': 'ZIPPER_CLOSED',
  'ZIP_1': 'ZIPPER_CLOSED',
  'ZIPPER_OPENED': 'ZIPPER_OPENED',
  'ZIP_OPENED': 'ZIPPER_OPENED',
  'ZIPPER_0': 'ZIPPER_OPENED',

  'VELCRO_ATTACHED': 'VELCRO_ATTACHED',
  'VELCRO_CLOSED': 'VELCRO_ATTACHED',
  'VELCRO_1': 'VELCRO_ATTACHED',
  'VELCRO_DETACHED': 'VELCRO_DETACHED',
  'VELCRO_0': 'VELCRO_DETACHED',

  'SNAP_CONNECTED': 'SNAP_CONNECTED',
  'SNAP_CLOSED': 'SNAP_CONNECTED',
  'SNAP_1': 'SNAP_CONNECTED',
  'SNAP_DISCONNECTED': 'SNAP_DISCONNECTED',
  'SNAP_0': 'SNAP_DISCONNECTED',

  'BUCKLE_LOCKED': 'BUCKLE_LOCKED',
  'BUCKLE_CLOSED': 'BUCKLE_LOCKED',
  'BUCKLE_1': 'BUCKLE_LOCKED',
  'BUCKLE_UNLOCKED': 'BUCKLE_UNLOCKED',
  'BUCKLE_0': 'BUCKLE_UNLOCKED',

  'RED_FASTENER_COMPLETED': 'RED_FASTENER_COMPLETED',
  'RED_1': 'RED_FASTENER_COMPLETED',
};

export const COMMAND_CODE_MAP = {
  BUZZER_SUCCESS: 0xA1,
  BUZZER_TRY_AGAIN: 0xA2,
  LED_YELLOW_SECTION: 0xB1,
  LED_BROWN_SECTION: 0xB2,
  LED_BLUE_SECTION: 0xB3,
  LED_PINK_SECTION: 0xB4,
  LED_GREEN_SECTION: 0xB5,
  LED_ALL_ON: 0xBF,
  LED_ALL_OFF: 0xB0,
  DEVICE_RESET: 0xFF,
};
