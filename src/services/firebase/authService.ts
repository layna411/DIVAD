import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from './firebaseConfig';
import { TherapistUser } from '../../types';

export class AuthService {
  /**
   * Listen to Firebase Auth state changes and fetch/create therapist profile in Firestore
   */
  static subscribeAuthState(callback: (therapist: TherapistUser | null) => void): () => void {
    if (!auth) {
      const offline = localStorage.getItem('divad_offline_therapist');
      callback(offline ? JSON.parse(offline) : null);
      return () => {};
    }

    // Check if offline therapist was saved
    const offlineRaw = localStorage.getItem('divad_offline_therapist');
    if (offlineRaw) {
      try {
        callback(JSON.parse(offlineRaw));
      } catch {}
    }

    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        const offline = localStorage.getItem('divad_offline_therapist');
        callback(offline ? JSON.parse(offline) : null);
        return;
      }

      // If user is authenticated in Firebase, clear offline temporary session
      localStorage.removeItem('divad_offline_therapist');

      try {
        let therapistProfile: TherapistUser | null = null;
        if (firestore) {
          try {
            const docRef = doc(firestore, 'therapists', firebaseUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              therapistProfile = docSnap.data() as TherapistUser;
            } else {
              therapistProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'Therapist',
                role: 'therapist',
                organization: 'SIMATS Pediatric Occupational Therapy Center',
              };
              await setDoc(docRef, therapistProfile);
            }
          } catch (e) {
            console.warn('[AuthService] Firestore profile access notice:', e);
          }
        }

        if (!therapistProfile) {
          therapistProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Therapist',
            role: 'therapist',
            organization: 'SIMATS Pediatric Occupational Therapy Center',
          };
        }

        callback(therapistProfile);
      } catch (err) {
        console.warn('[AuthService] Error fetching therapist profile:', err);
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Therapist',
          role: 'therapist',
          organization: 'SIMATS Pediatric Occupational Therapy Center',
        });
      }
    });
  }

  /**
   * Log in with Email and Password via Firebase Authentication
   */
  static async login(email: string, pass: string): Promise<TherapistUser> {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const firebaseUser = userCredential.user;

      let profile: TherapistUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        displayName: firebaseUser.displayName || 'Therapist',
        role: 'therapist',
        organization: 'SIMATS Pediatric Occupational Therapy Center',
      };

      if (firestore) {
        try {
          const docRef = doc(firestore, 'therapists', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            profile = docSnap.data() as TherapistUser;
          } else {
            await setDoc(docRef, profile);
          }
        } catch (e) {
          console.warn('[AuthService] Could not access therapists collection:', e);
        }
      }

      return profile;
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        const error = new Error('CONFIG_NOT_FOUND: Email/Password provider is not enabled in Firebase Console (divadhardware).');
        (error as any).code = 'auth/configuration-not-found';
        throw error;
      }
      throw err;
    }
  }

  /**
   * Register a new therapist account in Firebase Auth and Firestore
   */
  static async register(
    email: string,
    pass: string,
    displayName: string,
    organization: string = 'SIMATS Center'
  ): Promise<TherapistUser> {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const firebaseUser = userCredential.user;

      try {
        await updateFirebaseProfile(firebaseUser, { displayName });
      } catch {}

      const profile: TherapistUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        displayName: displayName.trim(),
        role: 'therapist',
        organization: organization.trim(),
      };

      if (firestore) {
        try {
          await setDoc(doc(firestore, 'therapists', firebaseUser.uid), profile);
        } catch (e) {
          console.warn('[AuthService] Could not save to therapists collection:', e);
        }
      }

      return profile;
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        const error = new Error('CONFIG_NOT_FOUND: Email/Password provider is not enabled in Firebase Console (divadhardware).');
        (error as any).code = 'auth/configuration-not-found';
        throw error;
      }
      throw err;
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<void> {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await sendPasswordResetEmail(auth, email.trim());
  }

  /**
   * Log out
   */
  static async logout(): Promise<void> {
    localStorage.removeItem('divad_offline_therapist');
    if (auth && auth.currentUser) {
      await signOut(auth);
    }
  }
}
