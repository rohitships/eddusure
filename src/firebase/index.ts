'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (getApps().length === 0) {
    let app: FirebaseApp;
    if (isProduction) {
      // In production, initialize from environment variables provided by App Hosting
      try {
        app = initializeApp();
      } catch (e) {
        console.warn('Automatic Firebase initialization failed, falling back to config object.', e);
        app = initializeApp(firebaseConfig);
      }
    } else {
      // In development, always initialize with the config object
      app = initializeApp(firebaseConfig);
    }
    return getSdks(app);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  
  if (process.env.NODE_ENV === 'development') {
    // To view emulated data, open the Emulator UI in a separate tab
    // and point your browser to http://127.0.0.1:4000
    console.log('Connecting to Firebase Emulators');
    connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  }

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