import { ChildProfile, ActivitySession } from '../../types';
import { apiClient } from '../api/apiClient';

export type Unsubscribe = () => void;

const STORAGE_KEYS = {
  CHILDREN: 'divad_children',
  SESSIONS: 'divad_sessions',
};

export class DataService {
  /**
   * Real-time subscription to children collection in Python/MySQL backend.
   * Loads local cache instantly, fetches from MySQL, and periodically syncs updates.
   */
  static subscribeChildren(callback: (children: ChildProfile[]) => void): Unsubscribe {
    // 1. Emit cached children immediately for instant render
    const cached = this.getCachedChildren();
    if (cached.length > 0) {
      callback(cached);
    }

    let isSubscribed = true;

    const fetchLatest = async () => {
      try {
        const children = await apiClient.getChildren();
        if (isSubscribed && children) {
          localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
          callback(children);
        }
      } catch (err) {
        // Backend unavailable; local persistence stays active
      }
    };

    // Initial fetch
    fetchLatest();

    // Periodic live sync every 4 seconds
    const intervalId = setInterval(fetchLatest, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }

  /**
   * Real-time subscription to activity sessions in Python/MySQL backend.
   */
  static subscribeSessions(callback: (sessions: ActivitySession[]) => void): Unsubscribe {
    const cached = this.getCachedSessions();
    if (cached.length > 0) {
      callback(cached);
    }

    let isSubscribed = true;

    const fetchLatest = async () => {
      try {
        const sessions = await apiClient.getSessions();
        if (isSubscribed && sessions) {
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
          callback(sessions);
        }
      } catch (err) {
        // Backend unavailable; local persistence active
      }
    };

    fetchLatest();
    const intervalId = setInterval(fetchLatest, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }

  /**
   * Save (create or update) a child profile in Python + MySQL Backend
   */
  static async saveChild(
    child: Omit<ChildProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<ChildProfile> {
    const now = Date.now();
    const id = child.id || `child_${Date.now()}`;

    const childDoc: ChildProfile = {
      ...child,
      id,
      createdAt: (child as any).createdAt || now,
      updatedAt: now,
      active: child.active ?? true,
    };

    // Update local cache immediately for instant UI responsiveness
    const cached = this.getCachedChildren();
    const existingIndex = cached.findIndex((c) => c.id === id);
    if (existingIndex >= 0) {
      cached[existingIndex] = childDoc;
    } else {
      cached.unshift(childDoc);
    }
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(cached));

    // Save to Python + MySQL Backend
    try {
      const saved = await apiClient.saveChild(childDoc);
      console.log(`[DataService] Child document ${id} saved to MySQL successfully.`);
      return saved;
    } catch (err) {
      console.warn('[DataService] Notice: Child saved locally. MySQL sync error:', err);
      return childDoc;
    }
  }

  /**
   * Delete a child profile from Python + MySQL Backend
   */
  static async deleteChild(id: string): Promise<boolean> {
    // Update local cache immediately
    const cached = this.getCachedChildren().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(cached));

    try {
      await apiClient.deleteChild(id);
      console.log(`[DataService] Child document ${id} deleted from MySQL.`);
    } catch (err) {
      console.warn('[DataService] Notice: Child deleted locally. MySQL sync error:', err);
    }

    return true;
  }

  /**
   * Save an activity session in Python + MySQL Backend
   */
  static async saveSession(session: ActivitySession): Promise<void> {
    // Update local cache immediately
    const cached = this.getCachedSessions();
    const idx = cached.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      cached[idx] = session;
    } else {
      cached.unshift(session);
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(cached));

    // Save to Python + MySQL Backend
    try {
      await apiClient.saveSession(session);
      console.log(`[DataService] Session document ${session.id} saved to MySQL.`);
    } catch (err) {
      console.warn('[DataService] Notice: Session saved locally. MySQL sync error:', err);
    }
  }

  // Local Storage Cache Helpers
  static getCachedChildren(): ChildProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static getCachedSessions(): ActivitySession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}
