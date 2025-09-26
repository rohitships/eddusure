'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    return getSdks(app);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  // NOTE: Emulator connections have been removed to ensure direct connection to live Firebase services.
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('Connecting to Firebase Emulators');
  //   connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  //   connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  // }

  return {
    firebaseApp,
    auth,
    firestore,
  };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';