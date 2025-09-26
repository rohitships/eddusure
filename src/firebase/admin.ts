// src/firebase/admin.ts
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

// Prevent re-initialization in a hot-reload environment
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export const firebaseAdmin = admin;

// A helper function to ensure the admin app is initialized before use.
export function initializeFirebaseAdmin() {
    // The logic inside the if block already ensures this.
    // This function simply acts as an explicit entry point for initialization
    // in server-side files.
    return;
}
