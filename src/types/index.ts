export type Language = 'en' | 'ta';

export type UserRole = 'child' | 'therapist';

export type AssistanceLevel = 1 | 2 | 3 | 4;

export const ASSISTANCE_LEVELS: Record<AssistanceLevel, { label: string; labelTamil: string; description: string; color: string }> = {
  1: {
    label: 'Independent',
    labelTamil: 'சுயாதீனம் (தானாக)',
    description: 'Child completed the step without cues or assistance.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  2: {
    label: 'Verbal Cue',
    labelTamil: 'வாய்மொழி வழிகாட்டல்',
    description: 'Spoken hint or verbal encouragement provided.',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  3: {
    label: 'Visual Cue',
    labelTamil: 'காட்சி வழிகாட்டல்',
    description: 'Pointing, gesturing, or highlighting the visual demonstration.',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  4: {
    label: 'Physical Assistance',
    labelTamil: 'உடல் உதவி (கைப்பிடித்து)',
    description: 'Hand-over-hand or partial physical guidance required.',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  }
};

export type ActivityType = 'zipper' | 'button' | 'buckle' | 'snap' | 'velcro' | 'red_fastener';

export type SensorEventType =
  | 'BUTTON_FASTENED'
  | 'BUTTON_UNFASTENED'
  | 'ZIPPER_CLOSED'
  | 'ZIPPER_OPENED'
  | 'VELCRO_ATTACHED'
  | 'VELCRO_DETACHED'
  | 'SNAP_CONNECTED'
  | 'SNAP_DISCONNECTED'
  | 'BUCKLE_LOCKED'
  | 'BUCKLE_UNLOCKED'
  | 'RED_FASTENER_COMPLETED'
  | 'DEVICE_CONNECTED'
  | 'DEVICE_DISCONNECTED'
  | 'BATTERY_LEVEL';

export interface SensorEvent {
  event: SensorEventType;
  timestamp: number;
  source: 'simulation' | 'ble' | 'websocket';
  deviceId?: string;
  payload?: Record<string, any>;
  rawBytes?: Uint8Array;
}

export interface InstructionStep {
  stepNumber: number;
  title: string;
  titleTamil: string;
  description: string;
  descriptionTamil: string;
  hint: string;
  hintTamil: string;
  expectedEvent?: SensorEventType;
  actionAreaPrompt: string;
  actionAreaPromptTamil: string;
  demoGraphic: string; // identifier for rich animated SVG/demonstration
}

export interface ActivityConfig {
  id: ActivityType;
  title: string;
  titleTamil: string;
  sectionNumber: number;
  colorName: 'yellow' | 'brown' | 'blue' | 'pink' | 'green' | 'red';
  hexColor: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
  descriptionTamil: string;
  hardwareSection: string;
  hardwareSectionTamil: string;
  targetSensorEvents: SensorEventType[];
  steps: InstructionStep[];
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  avatar: string;
  notes?: string;
  therapistId: string;
  baselineAssistanceLevel: AssistanceLevel;
  preferredLanguage: Language;
  createdAt: number;
  updatedAt: number;
  favoriteColor?: string;
  active: boolean;
}

export interface ActivityAttempt {
  id: string;
  sessionId: string;
  childId: string;
  activityId: ActivityType;
  stepNumber: number;
  timestamp: number;
  isCorrect: boolean;
  assistanceLevel: AssistanceLevel;
  durationMs: number;
  sensorEvent?: SensorEventType;
  feedbackMessage?: string;
}

export interface ActivitySession {
  id: string;
  childId: string;
  therapistId: string;
  startTime: number;
  endTime?: number;
  status: 'in-progress' | 'paused' | 'completed' | 'abandoned';
  selectedActivities: ActivityType[];
  currentActivityIndex: number;
  currentStepIndex: number;
  attempts: ActivityAttempt[];
  totalStars: number;
  badgesEarned: string[];
  notes?: string;
  language: Language;
}

export interface TherapistUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'therapist';
  organization?: string;
  photoURL?: string;
}

export interface HardwareStatus {
  isConnected: boolean;
  isScanning: boolean;
  deviceName: string | null;
  deviceId: string | null;
  batteryLevel: number | null; // 0 - 100
  firmwareVersion: string | null;
  connectionType: 'simulation' | 'ble' | 'websocket' | 'none';
  lastEvent?: SensorEvent;
  rssi?: number | null;
  error?: string | null;
}

