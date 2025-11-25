// lib/firebaseClient.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function initFirebase() {
  if (firebaseApp && firebaseAuth) return { firebaseApp, firebaseAuth };

  const configString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

  if (!configString) {
    throw new Error('NEXT_PUBLIC_FIREBASE_CONFIG is not set');
  }

  let firebaseConfig: Record<string, any>;
  try {
    firebaseConfig = JSON.parse(configString);
  } catch (error) {
    console.error('Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG:', error);
    throw new Error('Invalid NEXT_PUBLIC_FIREBASE_CONFIG JSON');
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);

  firebaseApp = app;
  firebaseAuth = auth;

  return { firebaseApp, firebaseAuth };
}

export function getFirebaseApp(): FirebaseApp {
  const { firebaseApp } = initFirebase();
  return firebaseApp!;
}

export function getFirebaseAuth(): Auth {
  const { firebaseAuth } = initFirebase();
  return firebaseAuth!;
}
