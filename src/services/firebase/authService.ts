import { TherapistUser } from '../../types';
import { apiClient } from '../api/apiClient';

const STORAGE_KEYS = {
  THERAPIST: 'divad_offline_therapist',
  TOKEN: 'divad_token',
};

type AuthCallback = (therapist: TherapistUser | null) => void;
const subscribers = new Set<AuthCallback>();

function notifySubscribers(user: TherapistUser | null) {
  subscribers.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error('[AuthService] Subscriber error:', e);
    }
  });
}

export class AuthService {
  /**
   * Listen to Auth state changes (Python/MySQL backend + cached local profile)
   */
  static subscribeAuthState(callback: AuthCallback): () => void {
    subscribers.add(callback);

    // 1. Immediately emit cached therapist for instant render
    const cached = this.getCachedTherapist();
    callback(cached);

    // 2. Validate token against Python backend asynchronously
    apiClient.getMe().then((serverUser) => {
      if (serverUser) {
        localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(serverUser));
        notifySubscribers(serverUser);
      }
    }).catch(() => {
      // Backend may be offline; cached profile remains active
    });

    return () => {
      subscribers.delete(callback);
    };
  }

  /**
   * Log in with Email and Password via Python + MySQL Backend
   */
  static async login(email: string, pass: string): Promise<TherapistUser> {
    try {
      const { user } = await apiClient.login(email, pass);
      localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(user));
      notifySubscribers(user);
      return user;
    } catch (err: any) {
      console.warn('[AuthService] Backend login attempt notice:', err);
      if (err.message?.includes('Unable to connect') || err.message?.includes('Failed to fetch')) {
        const localUser: TherapistUser = {
          uid: `th_local_${Date.now()}`,
          email,
          displayName: email.split('@')[0] || 'Occupational Therapist',
          role: 'therapist',
          organization: 'SIMATS Pediatric Occupational Therapy Center',
        };
        localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(localUser));
        notifySubscribers(localUser);
        return localUser;
      }
      throw err;
    }
  }

  /**
   * Register a new therapist account in Python + MySQL Backend
   */
  static async register(
    email: string,
    pass: string,
    displayName: string,
    organization: string = 'SIMATS Pediatric Occupational Therapy Center'
  ): Promise<TherapistUser> {
    try {
      const { user } = await apiClient.register(email, pass, displayName, organization);
      localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(user));
      notifySubscribers(user);
      return user;
    } catch (err: any) {
      console.warn('[AuthService] Backend register attempt notice:', err);
      if (err.message?.includes('Unable to connect') || err.message?.includes('Failed to fetch')) {
        const localUser: TherapistUser = {
          uid: `th_local_${Date.now()}`,
          email,
          displayName: displayName || 'Occupational Therapist',
          role: 'therapist',
          organization,
        };
        localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(localUser));
        notifySubscribers(localUser);
        return localUser;
      }
      throw err;
    }
  }

  /**
   * One-Click Instant Demo Login via Python Backend
   */
  static async loginAsDemo(): Promise<TherapistUser> {
    try {
      const { user } = await apiClient.demoLogin();
      localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(user));
      notifySubscribers(user);
      return user;
    } catch {
      // Fallback local demo profile
      const offlineUser: TherapistUser = {
        uid: 'th_demo_mitchell',
        email: 'therapist@simats.edu',
        displayName: 'Dr. Sarah Mitchell, OTR/L',
        role: 'therapist',
        organization: 'SIMATS Pediatric Occupational Therapy Center',
      };
      localStorage.setItem(STORAGE_KEYS.THERAPIST, JSON.stringify(offlineUser));
      notifySubscribers(offlineUser);
      return offlineUser;
    }
  }

  /**
   * Send password reset request
   */
  static async resetPassword(email: string): Promise<void> {
    await fetch('http://localhost:8000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  }

  /**
   * Log out
   */
  static async logout(): Promise<void> {
    const user = this.getCachedTherapist();
    if (user?.uid) {
      localStorage.removeItem(`divad_children_${user.uid}`);
      localStorage.removeItem(`divad_sessions_${user.uid}`);
    }
    localStorage.removeItem(STORAGE_KEYS.THERAPIST);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem('divad_children');
    localStorage.removeItem('divad_sessions');
    localStorage.removeItem('divad_offline_therapist');
    notifySubscribers(null);
  }

  static getCachedTherapist(): TherapistUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.THERAPIST);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
