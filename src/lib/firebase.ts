import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Firebase configuration from firebase-applet-config.json with optional env overrides
const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId || undefined
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
const databaseId = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

export const db: Firestore = databaseId 
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Ensure anonymous authentication for seamless cloud sync
let currentUser: User | null = null;
let authInitPromise: Promise<User | null> | null = null;

export async function ensureFirebaseAuth(): Promise<User | null> {
  if (currentUser) return currentUser;

  if (!authInitPromise) {
    authInitPromise = new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUser = user;
          resolve(user);
        } else {
          try {
            const userCred = await signInAnonymously(auth);
            currentUser = userCred.user;
            resolve(userCred.user);
          } catch (err) {
            console.warn('Anonymous Firebase sign-in notice (offline mode available):', err);
            resolve(null);
          }
        }
      });
    });
  }

  return authInitPromise;
}

// Initial trigger on load
ensureFirebaseAuth().catch(() => {
  // Graceful fallback to offline local mode
});

export default app;
