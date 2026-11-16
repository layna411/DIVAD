# DIVAD ESP32 BLE Hardware Communication Protocol Specification

**Document Version:** 1.0.0  
**Device:** DIVAD Physical Dressing-Training Board (ESP32 Controller)  
**Target Firmware:** ESP-IDF / Arduino ESP32 BLE  

---

## 1. Device Identification & Advertising

- **Advertising Device Name:** `DIVAD-ESP32-XXXX` (where `XXXX` is the last 4 characters of the MAC address)
- **Advertising Name Filter Prefix:** `DIVAD-`
- **Primary Service Advertised:** `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
- **TX Power:** +4 dBm
- **Advertising Interval:** 100 ms (Fast connect mode)

---

## 2. GATT Services & Characteristics Architecture

### 2.1 Primary DIVAD Service (`0x4fafc201-1fb5-459e-8fcc-c5c9c331914b`)

| Characteristic Name | UUID | Permissions | Description |
|---|---|---|---|
| **Sensor Events** | `beb5483e-36e1-4688-b7f5-ea07361b26a8` | `NOTIFY`, `READ` | Sensor triggering events sent from ESP32 to Web App |
| **Command / Feedback** | `6e400002-b5a3-f393-e0a9-e50e24dcca9e` | `WRITE`, `WRITE_NO_RESP` | LED patterns, buzzer cues, reset sent from Web App to ESP32 |

### 2.2 Standard Bluetooth SIG Services

| Service Name | UUID | Characteristic | UUID | Properties |
|---|---|---|---|---|
| **Battery Service** | `0x180F` | Battery Level | `0x2A19` | `READ`, `NOTIFY` (0 - 100%) |
| **Device Information** | `0x180A` | Firmware Revision | `0x2A26` | `READ` (UTF-8 string: e.g. "ESP32-DIVAD-v1.0") |

---

## 3. Sensor Event Packet Format (ESP32 -> Web App)

Each notification sent across `beb5483e-36e1-4688-b7f5-ea07361b26a8` contains a binary payload:

```
[ Byte 0: OpCode ] [ Byte 1: Section ID ] [ Byte 2: Sensor State ] [ Byte 3: Checksum / CRC ]
```

### 3.1 OpCode & Event Mapping Table

| OpCode (Hex) | Sensor Event Identifier | Physical Section | Description |
|---|---|---|---|
| `0x01` | `BUTTON_FASTENED` | Section 2 (Brown) | Button pushed through slot / magnetic reed contact closed |
| `0x02` | `BUTTON_UNFASTENED` | Section 2 (Brown) | Button pulled open |
| `0x11` | `ZIPPER_CLOSED` | Section 1 (Yellow) | Zipper slider reached top limit switch / conductive track |
| `0x12` | `ZIPPER_OPENED` | Section 1 (Yellow) | Zipper slider returned to bottom |
| `0x21` | `VELCRO_ATTACHED` | Section 5 (Green) | Conductive fabric patch velcro connection made |
| `0x22` | `VELCRO_DETACHED` | Section 5 (Green) | Velcro pulled apart |
| `0x31` | `SNAP_CONNECTED` | Section 4 (Pink) | Metal snap stud firmly seated into socket |
| `0x32` | `SNAP_DISCONNECTED` | Section 4 (Pink) | Snap separated |
| `0x41` | `BUCKLE_LOCKED` | Section 3 (Blue) | Buckle prong engaged into clasp switch |
| `0x42` | `BUCKLE_UNLOCKED` | Section 3 (Blue) | Buckle released |
| `0x51` | `RED_FASTENER_COMPLETED` | Section 6 (Red) | Additional configurable fastening completed |

---

## 4. Command Packet Format (Web App -> ESP32)

Commands sent from the web app across `6e400002-b5a3-f393-e0a9-e50e24dcca9e`:

| Command Code (Hex) | Action on Physical Board | Expected Behavior |
|---|---|---|
| `0xA1` | `BUZZER_SUCCESS` | Friendly 2-tone melodic chime (523 Hz -> 659 Hz) |
| `0xA2` | `BUZZER_TRY_AGAIN` | Gentle single low-pitch prompt tone (330 Hz, 150ms) |
| `0xB1` | `LED_YELLOW_SECTION` | Pulse Yellow Section LEDs (guide child to Zipper) |
| `0xB2` | `LED_BROWN_SECTION` | Pulse Brown Section LEDs (guide child to Buttons) |
| `0xB3` | `LED_BLUE_SECTION` | Pulse Blue Section LEDs (guide child to Buckle) |
| `0xB4` | `LED_PINK_SECTION` | Pulse Pink Section LEDs (guide child to Snaps) |
| `0xB5` | `LED_GREEN_SECTION` | Pulse Green Section LEDs (guide child to Velcro) |
| `0xBF` | `LED_ALL_ON` | Rainbow celebration animation |
| `0xB0` | `LED_ALL_OFF` | Turn off all section indicator LEDs |
| `0xFF` | `DEVICE_RESET` | Soft reboot sensors and calibrate baselines |

---

## 5. Web Bluetooth Compatibility & Fallback

- **Google Chrome / Chromium / Edge / Opera on Android, macOS, Windows, ChromeOS:** Native Web Bluetooth supported over HTTPS or `http://localhost`.
- **Unsupported Browsers (Firefox, Safari on iOS):** The web app automatically offers the `SimulatedHardwareManager` or an optional local WebSocket bridge client (`WebSocketHardwareManager` on `ws://127.0.0.1:8765`).

---

## 6. Example ESP32 Arduino Implementation Snippet

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define SENSOR_CHAR_UUID       "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define CMD_CHAR_UUID          "6e400002-b5a3-f393-e0a9-e50e24dcca9e"

BLECharacteristic *pSensorCharacteristic;

void notifySensorEvent(uint8_t opcode) {
  uint8_t payload[2] = { opcode, 0x00 };
  pSensorCharacteristic->setValue(payload, 2);
  pSensorCharacteristic->notify();
}

// In loop:
// When zipper contact closed: notifySensorEvent(0x11);
// When button contact closed: notifySensorEvent(0x01);
```

