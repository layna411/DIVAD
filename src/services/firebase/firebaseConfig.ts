import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// DIVAD Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCxOo9km3jhmdTCNx16FP7dU6I3IYze1HM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "divadhardware.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "divadhardware",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "divadhardware.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "509894186433",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:509894186433:web:e0e5ac5617e3d6441bcb40",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XGFYCRK5XQ",
};

export const isRealFirebaseConfigured = true;

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
firestore = getFirestore(app);
storage = getStorage(app);

// Safe initialization of Analytics in browser environment
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('[Firebase] Analytics not supported in current environment:', err);
  });
}

export { app, auth, firestore, storage, analytics };
