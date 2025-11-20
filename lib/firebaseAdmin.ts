// lib/firebaseAdmin.ts
import { initializeApp, cert, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

function initAdmin() {
  if (adminApp && adminAuth) return { adminApp, adminAuth };

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
  }

  let serviceAccount: any;
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON');
  }

  const app = !getApps().length
    ? initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
      })
    : getApp();

  const auth = getAuth(app);

  adminApp = app;
  adminAuth = auth;

  return { adminApp, adminAuth };
}

export function getAdminApp(): App {
  const { adminApp } = initAdmin();
  return adminApp!;
}

export function getAdminAuth(): Auth {
  const { adminAuth } = initAdmin();
  return adminAuth!;
}
