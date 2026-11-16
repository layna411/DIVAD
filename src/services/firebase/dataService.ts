import { ChildProfile, ActivitySession, ActivityAttempt, TherapistUser, AssistanceLevel } from '../../types';
import { firestore } from './firebaseConfig';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  CHILDREN: 'divad_children',
  SESSIONS: 'divad_sessions',
  THERAPIST: 'divad_therapist_user',
  SETTINGS: 'divad_app_settings',
};

const SAMPLE_CHILDREN: ChildProfile[] = [
  {
    id: 'child_1',
    name: 'Aarav Kumar',
    age: 6,
    gender: 'male',
    avatar: 'lion',
    therapistId: 'therapist_dr_sarah',
    baselineAssistanceLevel: 2,
    preferredLanguage: 'en',
    favoriteColor: '#EAB308',
    notes: 'Responsive to verbal cues. Practicing zipping and large buttons.',
    active: true,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'child_2',
    name: 'Ananya Ramesh',
    age: 5,
    gender: 'female',
    avatar: 'rabbit',
    therapistId: 'therapist_dr_sarah',
    baselineAssistanceLevel: 1,
    preferredLanguage: 'ta',
    favoriteColor: '#DB2777',
    notes: 'High fine-motor skills. Responds enthusiastically to Tamil audio.',
    active: true,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'child_3',
    name: 'Kavin Selvan',
    age: 7,
    gender: 'male',
    avatar: 'bear',
    therapistId: 'therapist_dr_sarah',
    baselineAssistanceLevel: 3,
    preferredLanguage: 'en',
    favoriteColor: '#0284C7',
    notes: 'Benefits from visual highlighting. Working on buckle tension.',
    active: true,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'child_4',
    name: 'Priya Sundaram',
    age: 6,
    gender: 'female',
    avatar: 'fox',
    therapistId: 'therapist_dr_sarah',
    baselineAssistanceLevel: 2,
    preferredLanguage: 'ta',
    favoriteColor: '#16A34A',
    notes: 'Velcro mastered; currently focusing on three buttons sequence.',
    active: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 4,
  },
];

const SAMPLE_SESSIONS: ActivitySession[] = [
  {
    id: 'sess_101',
    childId: 'child_1',
    therapistId: 'therapist_dr_sarah',
    startTime: Date.now() - 86400000 * 2 - 3600000,
    endTime: Date.now() - 86400000 * 2 - 2400000,
    status: 'completed',
    selectedActivities: ['zipper', 'button'],
    currentActivityIndex: 1,
    currentStepIndex: 3,
    totalStars: 6,
    badgesEarned: ['Zipper Hero', 'Button Master'],
    language: 'en',
    notes: 'Excellent coordination with zipper base. Needed 1 verbal prompt for button tilt.',
    attempts: [
      {
        id: 'att_1',
        sessionId: 'sess_101',
        childId: 'child_1',
        activityId: 'zipper',
        stepNumber: 5,
        timestamp: Date.now() - 86400000 * 2 - 3200000,
        isCorrect: true,
        assistanceLevel: 2,
        durationMs: 8400,
        sensorEvent: 'ZIPPER_CLOSED',
      },
      {
        id: 'att_2',
        sessionId: 'sess_101',
        childId: 'child_1',
        activityId: 'button',
        stepNumber: 4,
        timestamp: Date.now() - 86400000 * 2 - 2700000,
        isCorrect: true,
        assistanceLevel: 2,
        durationMs: 12500,
        sensorEvent: 'BUTTON_FASTENED',
      },
    ],
  },
  {
    id: 'sess_102',
    childId: 'child_2',
    therapistId: 'therapist_dr_sarah',
    startTime: Date.now() - 86400000 * 1 - 7200000,
    endTime: Date.now() - 86400000 * 1 - 5800000,
    status: 'completed',
    selectedActivities: ['snap', 'velcro'],
    currentActivityIndex: 1,
    currentStepIndex: 2,
    totalStars: 8,
    badgesEarned: ['Snap Champion', 'Velcro Star'],
    language: 'ta',
    notes: 'Independent snap fastening on first attempt.',
    attempts: [
      {
        id: 'att_3',
        sessionId: 'sess_102',
        childId: 'child_2',
        activityId: 'snap',
        stepNumber: 3,
        timestamp: Date.now() - 86400000 * 1 - 6500000,
        isCorrect: true,
        assistanceLevel: 1,
        durationMs: 5200,
        sensorEvent: 'SNAP_CONNECTED',
      },
      {
        id: 'att_4',
        sessionId: 'sess_102',
        childId: 'child_2',
        activityId: 'velcro',
        stepNumber: 3,
        timestamp: Date.now() - 86400000 * 1 - 6000000,
        isCorrect: true,
        assistanceLevel: 1,
        durationMs: 4100,
        sensorEvent: 'VELCRO_ATTACHED',
      },
    ],
  },
];

export class DataService {
  // Children Profile Management
  static getChildren(): ChildProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(SAMPLE_CHILDREN));
      return SAMPLE_CHILDREN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SAMPLE_CHILDREN;
    }
  }

  static getChildById(id: string): ChildProfile | undefined {
    return this.getChildren().find((c) => c.id === id);
  }

  static saveChild(child: Omit<ChildProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ChildProfile {
    const children = this.getChildren();
    const now = Date.now();
    let savedChild: ChildProfile;

    if (child.id) {
      // Update
      const index = children.findIndex((c) => c.id === child.id);
      if (index >= 0) {
        savedChild = {
          ...children[index],
          ...child,
          updatedAt: now,
        };
        children[index] = savedChild;
      } else {
        savedChild = {
          ...child,
          id: child.id,
          createdAt: now,
          updatedAt: now,
          active: child.active ?? true,
        };
        children.unshift(savedChild);
      }
    } else {
      // Create
      savedChild = {
        ...child,
        id: `child_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        active: child.active ?? true,
      };
      children.unshift(savedChild);
    }

    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));

    // Asynchronously synchronize with Firestore
    if (firestore) {
      setDoc(doc(firestore, 'children', savedChild.id), savedChild)
        .then(() => console.log(`[Firestore] Child ${savedChild.id} synced.`))
        .catch((err) => console.warn('[Firestore] Child sync warning:', err));
    }

    return savedChild;
  }

  static deleteChild(id: string): boolean {
    const children = this.getChildren().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));

    // Asynchronously delete from Firestore
    if (firestore) {
      deleteDoc(doc(firestore, 'children', id))
        .then(() => console.log(`[Firestore] Child ${id} deleted.`))
        .catch((err) => console.warn('[Firestore] Child deletion warning:', err));
    }

    return true;
  }

  // Session Management
  static getSessions(): ActivitySession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(SAMPLE_SESSIONS));
      return SAMPLE_SESSIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SAMPLE_SESSIONS;
    }
  }

  static getSessionsForChild(childId: string): ActivitySession[] {
    return this.getSessions().filter((s) => s.childId === childId);
  }

  static saveSession(session: ActivitySession): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Asynchronously synchronize with Firestore
    if (firestore) {
      setDoc(doc(firestore, 'sessions', session.id), session)
        .then(() => console.log(`[Firestore] Session ${session.id} synced.`))
        .catch((err) => console.warn('[Firestore] Session sync warning:', err));
    }
  }

  // Initial pull from Firestore on app startup
  static async syncFromFirestore(): Promise<void> {
    if (!firestore) return;
    try {
      const childrenSnapshot = await getDocs(collection(firestore, 'children'));
      if (!childrenSnapshot.empty) {
        const remoteChildren: ChildProfile[] = [];
        childrenSnapshot.forEach((doc) => {
          remoteChildren.push(doc.data() as ChildProfile);
        });
        if (remoteChildren.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(remoteChildren));
        }
      }

      const sessionsSnapshot = await getDocs(collection(firestore, 'sessions'));
      if (!sessionsSnapshot.empty) {
        const remoteSessions: ActivitySession[] = [];
        sessionsSnapshot.forEach((doc) => {
          remoteSessions.push(doc.data() as ActivitySession);
        });
        if (remoteSessions.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(remoteSessions));
        }
      }
    } catch (err) {
      console.warn('[Firestore] Background sync notice (using local offline cache):', err);
    }
  }

  // Therapist User
  static getTherapistUser(): TherapistUser {
    const raw = localStorage.getItem(STORAGE_KEYS.THERAPIST);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    const defaultTherapist: TherapistUser = {
      uid: 'therapist_dr_sarah',
      email: 'sarah.therapist@divad.simats.edu',
      displayName: 'Dr. Sarah Mitchell, OTR/L',
      role: 'therapist',
      organization: 'SIMATS Pediatric Occupational Therapy Center',
    };
    localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(defaultTherapist));
    return defaultTherapist;
  }

  static updateTherapistUser(user: Partial<TherapistUser>): TherapistUser {
    const current = this.getTherapistUser();
    const updated = { ...current, ...user };
    localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(updated));

    if (firestore) {
      setDoc(doc(firestore, 'therapists', updated.uid), updated)
        .then(() => console.log('[Firestore] Therapist synced.'))
        .catch((err) => console.warn('[Firestore] Therapist sync warning:', err));
    }

    return updated;
  }
}
