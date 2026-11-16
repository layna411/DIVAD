# DIVAD – Dressing Independence with Visual and Auditory Device

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC.svg)](https://tailwindcss.com/)
[![Web Bluetooth](https://img.shields.io/badge/Web%20Bluetooth-ESP32%20Ready-green.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)

A production-ready, responsive, tablet-first web application designed for pediatric occupational therapy to train children in independent dressing skills through visual step-by-step guidance, animated demonstrations, English & Tamil audio instructions, real-time board sensor feedback, and therapist progress monitoring.

---

## 🎨 Physical DIVAD Board Representation

The application interface matches the physical fabric DIVAD board:
1. **Yellow Section** – Two Zippers (`#EAB308`)
2. **Brown Section** – Three Buttons (`#8D6E63`)
3. **Blue Section** – Buckle Fastening (`#0284C7`)
4. **Pink Section** – Snap Fastening (`#DB2777`)
5. **Green Section** – Velcro Fastening (`#16A34A`)
6. **Red Section** – Additional Fastening Practice (`#DC2626`)

---

## 🚀 Key Features

- **Child Mode**:
  - Touch-friendly, high-contrast, colorful design.
  - Friendly mascot ("Divo").
  - Animated visual demonstrations of zipping, buttoning, buckling, snapping, and velcro smoothing.
  - Real-time action area highlights.
  - Multi-language voice narration: **English** and **Tamil** (தமிழ்).
  - Positive reinforcement: Stars, badges, congratulatory fanfare, and confetti celebrations.

- **Therapist Portal**:
  - Secure Firebase Authentication login, registration, and password reset (`/therapist/login`).
  - Child profile management with real-time Firestore persistence (Add, Edit, Delete, Select).
  - Assistance level configuration & tracking:
    - Level 1: Independent
    - Level 2: Verbal Cue
    - Level 3: Visual Cue
    - Level 4: Physical Assistance
  - Clinical reports export in **PDF** (formatted OT clinical report with tables and signature block) and **CSV** format.
  - Live Firestore session history and activity performance metrics streaming.

- **Dual Hardware Communication Architecture**:
  - `HardwareManager` common TypeScript interface.
  - `SimulatedHardwareManager`: Realistic simulation of ESP32 connection, battery status, and sensor events.
  - `BluetoothHardwareManager`: Native Web Bluetooth Low Energy (BLE) integration with ESP32 GATT server.
  - `WebSocketHardwareManager`: Fallback bridge client for browsers without Web Bluetooth.
  - **Dedicated Hardware Testing Floating Panel**: Test board sensor events manually with one click (`BUTTON_FASTENED`, `ZIPPER_CLOSED`, `BUCKLE_LOCKED`, `SNAP_CONNECTED`, `VELCRO_ATTACHED`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, React Router DOM.
- **Audio**: Web Speech API (`en-US`, `ta-IN`), Web Audio API tone and chime synthesizer.
- **Reports**: jsPDF, jsPDF-AutoTable.
- **Celebration**: Canvas-Confetti.
- **Backend / Data**: Real-time Firebase Authentication, Firestore, and Storage (`divadhardware` project) with integrated local offline fallback storage.

---

## 📂 Project Architecture

```
DIVAD/
├── BLE_HARDWARE_PROTOCOL.md         # ESP32 BLE specification & opcode mappings
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── assets/                      # SVG icons & branding
│   ├── components/
│   │   ├── common/
│   │   │   └── HardwareTestPanel.tsx # Floating ESP32 simulation & BLE control panel
│   │   └── instructions/
│   │       └── InstructionVisualizer.tsx # Animated SVG demonstrations
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Therapist authentication state
│   │   ├── HardwareContext.tsx       # BLE and Simulated hardware manager state
│   │   └── SessionContext.tsx        # Activity session, timer, steps, audio, assistance levels
│   ├── data/
│   │   └── activitiesData.ts         # Multi-step instructions in English & Tamil
│   ├── hardware/
│   │   ├── HardwareManager.ts        # Common hardware communication interface
│   │   ├── SimulatedHardwareManager.ts # Realistic ESP32 hardware simulation
│   │   ├── BluetoothHardwareManager.ts # Web Bluetooth BLE GATT client
│   │   ├── WebSocketHardwareManager.ts # Local WebSocket bridge client
│   │   ├── SensorEvent.ts            # Sensor event parser & factory
│   │   └── bleConfig.ts              # Configurable BLE UUIDs & opcodes
│   ├── pages/
│   │   ├── WelcomePage.tsx           # Mascot intro & quick child launch
│   │   ├── ActivitySelectionPage.tsx # Board-matched activity cards
│   │   ├── SessionPage.tsx           # Visual step-by-step instruction stage
│   │   └── TherapistDashboardPage.tsx# Child profile CRUD & clinical reports
│   ├── services/
│   │   ├── audio/
│   │   │   ├── AudioService.ts       # Speech synthesis (English & Tamil)
│   │   │   └── SoundEffects.ts       # Web Audio API chime synthesizer
│   │   ├── firebase/
│   │   │   ├── firebaseConfig.ts     # Firebase initialization
│   │   │   └── dataService.ts        # Child profiles, session logs, persistence
│   │   ├── reports/
│   │   │   └── ReportService.ts      # Clinical PDF & CSV export
│   │   └── validation/
│   │       └── SensorValidationEngine.ts # Sensor event step-sequence validator
│   ├── types/
│   │   ├── index.ts                  # Shared TypeScript interfaces
│   │   └── web-bluetooth.d.ts        # Web Bluetooth types
│   ├── App.tsx
│   └── main.tsx
```

---

## 🏃 Running the Application

### 1. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in Google Chrome or Microsoft Edge.

### 2. Production Build
```bash
npm run build
```

---

## 📡 Testing Hardware Without Physical Board

1. In the bottom-right corner of any screen, click the **"Simulated Hardware: Connected"** floating badge.
2. Select **Simulation** provider.
3. Click any sensor button (e.g. `ZIPPER_CLOSED`, `BUTTON_FASTENED`, `BUCKLE_LOCKED`).
4. The event is validated by `SensorValidationEngine` and triggers sound effects, feedback, and step progression.

---

## 🔌 Connecting Physical ESP32 Hardware

1. Open the floating **ESP32 Hardware Panel** in the bottom right corner.
2. Switch provider to **BLE (ESP32)**.
3. Click **Connect Hardware**.
4. Select your advertising `DIVAD-ESP32-XXXX` device from the browser popup.
5. Refer to [BLE_HARDWARE_PROTOCOL.md](./BLE_HARDWARE_PROTOCOL.md) for firmware implementation details.

