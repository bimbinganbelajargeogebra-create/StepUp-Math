import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Firebase configuration from firebase-applet-config.json with optional env overrides
const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env || {};

export const firebaseConfig = {
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
// In Firebase, standard projects use '(default)'. If databaseId matches projectId or is '(default)', use default getFirestore(app)
const customDbId = (firebaseConfigJson.firestoreDatabaseId && 
  firebaseConfigJson.firestoreDatabaseId !== '(default)' && 
  firebaseConfigJson.firestoreDatabaseId !== firebaseConfig.projectId)
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

export const db: Firestore = customDbId 
  ? getFirestore(app, customDbId)
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
            console.warn('Anonymous Firebase sign-in notice (unauthenticated rules active):', err);
            resolve(null);
          }
        }
      });
    });
  }

  return authInitPromise;
}

/**
 * Diagnostic tool to check real-time connection to Firebase Firestore
 */
export async function testFirebaseConnection(): Promise<{
  connected: boolean;
  message: string;
  projectId: string;
  database: string;
  latencyMs: number;
}> {
  const startTime = Date.now();
  try {
    // 1. Try to ensure auth
    await ensureFirebaseAuth();
    
    // 2. Perform write/read ping on _connection_test collection
    const testDocRef = doc(db, '_connection_test', 'status_ping');
    await setDoc(testDocRef, {
      lastPing: serverTimestamp(),
      clientTimestamp: Date.now(),
      appName: 'AlgoriMath',
      platform: 'web'
    }, { merge: true });

    const snap = await getDoc(testDocRef);
    const latencyMs = Date.now() - startTime;

    if (snap.exists()) {
      return {
        connected: true,
        message: `Terhubung ke Firebase Firestore (${latencyMs}ms)`,
        projectId: firebaseConfig.projectId,
        database: customDbId || '(default)',
        latencyMs
      };
    } else {
      return {
        connected: false,
        message: 'Gagal memverifikasi dokumen Firestore',
        projectId: firebaseConfig.projectId,
        database: customDbId || '(default)',
        latencyMs
      };
    }
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    console.error('Firebase connection test error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Koneksi Firestore gagal';
    return {
      connected: false,
      message: `Gagal terhubung ke Firebase: ${errorMsg}`,
      projectId: firebaseConfig.projectId,
      database: customDbId || '(default)',
      latencyMs
    };
  }
}

// Initial trigger on load
ensureFirebaseAuth().catch(() => {
  // Graceful fallback to offline local mode
});

export default app;

