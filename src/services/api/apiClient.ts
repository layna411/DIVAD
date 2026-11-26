import { ChildProfile, ActivitySession, TherapistUser } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('divad_token');
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // ---------------- AUTH API ----------------
  async login(email: string, pass: string): Promise<{ user: TherapistUser; token: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Login failed. Check your email or password.');
      }

      const data = await res.json();
      localStorage.setItem('divad_token', data.token);
      return data;
    } catch (err: any) {
      if (err.name === 'TypeError' && (err.message === 'Failed to fetch' || err.message?.includes('fetch'))) {
        throw new Error('Unable to connect to backend server. Running in local clinical mode.');
      }
      throw err;
    }
  }

  async register(
    email: string,
    pass: string,
    displayName: string,
    organization: string = 'SIMATS OT Center'
  ): Promise<{ user: TherapistUser; token: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: pass,
          displayName,
          organization,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Registration failed.');
      }

      const data = await res.json();
      localStorage.setItem('divad_token', data.token);
      return data;
    } catch (err: any) {
      if (err.name === 'TypeError' && (err.message === 'Failed to fetch' || err.message?.includes('fetch'))) {
        throw new Error('Unable to connect to backend server. Running in local clinical mode.');
      }
      throw err;
    }
  }

  async demoLogin(): Promise<{ user: TherapistUser; token: string }> {
    const res = await fetch(`${this.baseUrl}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error('Demo login failed on backend');
    }

    const data = await res.json();
    localStorage.setItem('divad_token', data.token);
    return data;
  }

  async getMe(): Promise<TherapistUser | null> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/me`, {
        headers: this.getHeaders(),
      });
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  }

  // ---------------- CHILDREN API ----------------
  async getChildren(): Promise<ChildProfile[]> {
    const res = await fetch(`${this.baseUrl}/children`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch children from MySQL backend');
    return await res.json();
  }

  async saveChild(child: Partial<ChildProfile>): Promise<ChildProfile> {
    const res = await fetch(`${this.baseUrl}/children`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(child),
    });
    if (!res.ok) throw new Error('Failed to save child in MySQL backend');
    return await res.json();
  }

  async deleteChild(childId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/children/${childId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.ok;
  }

  // ---------------- SESSIONS API ----------------
  async getSessions(childId?: string): Promise<ActivitySession[]> {
    const url = childId ? `${this.baseUrl}/sessions?childId=${encodeURIComponent(childId)}` : `${this.baseUrl}/sessions`;
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch sessions from MySQL backend');
    return await res.json();
  }

  async saveSession(session: ActivitySession): Promise<ActivitySession> {
    const res = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(session),
    });
    if (!res.ok) throw new Error('Failed to save session in MySQL backend');
    return await res.json();
  }

  async logAttempt(attempt: {
    sessionId: string;
    activityId: string;
    stepNumber: number;
    timestamp: number;
    isCorrect: boolean;
    assistanceLevel: number;
    sensorEventType?: string;
    durationSeconds?: number;
    feedbackGiven?: string;
  }): Promise<void> {
    await fetch(`${this.baseUrl}/sessions/attempt`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(attempt),
    }).catch(() => {});
  }

  async resetPassword(email: string): Promise<void> {
    await fetch(`${this.baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  }

  // ---------------- HARDWARE SENSOR TELEMETRY ----------------
  async logSensorEvent(event: {
    sessionId?: string;
    eventType: string;
    source: string;
    deviceId?: string;
    opcode?: number;
    rawData?: string;
    timestamp?: number;
  }): Promise<void> {
    await fetch(`${this.baseUrl}/hardware/log`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(event),
    }).catch(() => {});
  }
}

export const apiClient = new ApiClient();
