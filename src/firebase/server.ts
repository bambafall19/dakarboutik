import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let firestore: Firestore;

if (typeof window === 'undefined') {
  // Server-side initialization
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  firestore = getFirestore(firebaseApp);
}

// This function can be called on the server to get the instances
export function initializeFirebase() {
  // This check is to ensure we don't re-initialize on the client-side
  // if this file by chance gets imported there.
  if (typeof window !== 'undefined') {
    throw new Error('initializeFirebase (server) should not be called on the client');
  }

  return { firebaseApp, firestore };
}
