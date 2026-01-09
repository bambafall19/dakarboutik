import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let firestore: Firestore;

// This check ensures we only initialize on the server
if (typeof window === 'undefined') {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  firestore = getFirestore(firebaseApp);
}

// This function can be called on the server to get the instances
export function initializeFirebase() {
  // The check for 'window' is now implicitly handled by where this function is called from (server-only files)
  // and the top-level check in this file. We can safely return the instances.
  return { firebaseApp, firestore };
}
