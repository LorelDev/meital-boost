import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

export const isFirebaseConfigured =
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDUMMY-FirebaseConfigForBuildOnly',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-meital.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-meital',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-meital.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use experimentalForceLongPolling to avoid gRPC connection issues in some environments
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
  db = getFirestore(app);
}

export { db };
export default app;
