import { ChildProfile, ActivitySession, TherapistUser } from '../../types';
import { firestore } from './firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  CHILDREN: 'divad_children',
  SESSIONS: 'divad_sessions',
};

export class DataService {
  /**
   * Real-time subscription to children collection in Firestore.
   * Emits whenever a child is added, edited, or removed.
   */
  static subscribeChildren(callback: (children: ChildProfile[]) => void): Unsubscribe {
    // Check local cache first for instant initial render
    const cached = this.getCachedChildren();
    if (cached.length > 0) {
      callback(cached);
    }

    if (!firestore) {
      callback(cached);
      return () => {};
    }

    let isTerminated = false;
    let unsub: Unsubscribe | null = null;

    try {
      const childrenCol = collection(firestore, 'children');
      const q = query(childrenCol, orderBy('createdAt', 'desc'));

      unsub = onSnapshot(
        q,
        (snapshot) => {
          const children: ChildProfile[] = [];
          snapshot.forEach((docSnap) => {
            children.push(docSnap.data() as ChildProfile);
          });

          // Update local cache
          localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
          callback(children);
        },
        (error) => {
          isTerminated = true;
          if (error.code === 'permission-denied') {
            console.info('[Firestore] Permission notice: Waiting for Firestore rules or authentication in Firebase Console. Local clinical persistence active.');
          } else {
            console.warn('[Firestore] Realtime children listener notice:', error);
          }
          // Fallback to local persistence
          callback(this.getCachedChildren());
        }
      );
    } catch (err) {
      console.warn('[Firestore] Error subscribing to children:', err);
      callback(cached);
      return () => {};
    }

    return () => {
      if (unsub && !isTerminated) {
        try {
          unsub();
        } catch {
          // Suppress any internal Firestore SDK watch stream assertion failures on unmount
        }
      }
    };
  }

  /**
   * Real-time subscription to sessions collection in Firestore.
   */
  static subscribeSessions(callback: (sessions: ActivitySession[]) => void): Unsubscribe {
    const cached = this.getCachedSessions();
    if (cached.length > 0) {
      callback(cached);
    }

    if (!firestore) {
      callback(cached);
      return () => {};
    }

    let isTerminated = false;
    let unsub: Unsubscribe | null = null;

    try {
      const sessionsCol = collection(firestore, 'sessions');
      const q = query(sessionsCol, orderBy('startTime', 'desc'));

      unsub = onSnapshot(
        q,
        (snapshot) => {
          const sessions: ActivitySession[] = [];
          snapshot.forEach((docSnap) => {
            sessions.push(docSnap.data() as ActivitySession);
          });

          // Update local cache
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
          callback(sessions);
        },
        (error) => {
          isTerminated = true;
          if (error.code === 'permission-denied') {
            console.info('[Firestore] Permission notice: Waiting for Firestore rules. Local session persistence active.');
          } else {
            console.warn('[Firestore] Realtime sessions listener notice:', error);
          }
          callback(this.getCachedSessions());
        }
      );
    } catch (err) {
      console.warn('[Firestore] Error subscribing to sessions:', err);
      callback(cached);
      return () => {};
    }

    return () => {
      if (unsub && !isTerminated) {
        try {
          unsub();
        } catch {
          // Suppress any internal Firestore SDK watch stream assertion failures on unmount
        }
      }
    };
  }

  /**
   * Save (create or update) a child profile directly in Firestore
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

    // Update local cache immediately
    const cached = this.getCachedChildren();
    const existingIndex = cached.findIndex((c) => c.id === id);
    if (existingIndex >= 0) {
      cached[existingIndex] = childDoc;
    } else {
      cached.unshift(childDoc);
    }
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(cached));

    // Save to Firestore
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'children', id), childDoc);
        console.log(`[Firestore] Child document ${id} saved successfully.`);
      } catch (err) {
        console.warn('[Firestore] Notice: Child document saved locally. Firestore sync pending permissions:', err);
      }
    }

    return childDoc;
  }

  /**
   * Delete a child profile from Firestore
   */
  static async deleteChild(id: string): Promise<boolean> {
    // Update local cache immediately
    const cached = this.getCachedChildren().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(cached));

    // Delete from Firestore
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'children', id));
        console.log(`[Firestore] Child document ${id} deleted.`);
      } catch (err) {
        console.warn('[Firestore] Notice: Child deleted locally. Firestore sync pending permissions:', err);
      }
    }

    return true;
  }

  /**
   * Save an activity session in Firestore
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

    // Save to Firestore
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'sessions', session.id), session);
        console.log(`[Firestore] Session document ${session.id} saved.`);
      } catch (err) {
        console.warn('[Firestore] Notice: Session saved locally. Firestore sync pending permissions:', err);
      }
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
