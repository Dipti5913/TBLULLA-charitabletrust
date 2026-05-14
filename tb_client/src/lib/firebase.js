// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlf3PQtQhF3hGP0cDANMFvrP9GNSWthrE",
  authDomain: "admin-a6f7e.firebaseapp.com",
  databaseURL: "https://admin-a6f7e-default-rtdb.firebaseio.com",
  projectId: "admin-a6f7e",
  storageBucket: "admin-a6f7e.firebasestorage.app",
  messagingSenderId: "857439076158",
  appId: "1:857439076158:web:91ea05de04d8206beab66f",
  measurementId: "G-LXFKQ1YGXK"
};

// Guard against missing configuration to avoid runtime crashes
const hasConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId;

// Initialize Firebase
let auth = null;
let db = null;
let storage = null;
let analytics = null;

console.log('Client: Initializing Firebase with config:', firebaseConfig);

try {
  if (hasConfig) {
    console.log('Client: Firebase config is valid, initializing app...');
    const app = initializeApp(firebaseConfig);
    console.log('Client: Firebase app initialized successfully');
    
    console.log('Client: Initializing Firebase services...');
    auth = getAuth(app);
    console.log('Client: Auth initialized:', !!auth);
    
    db = getFirestore(app);
    console.log('Client: Firestore initialized:', !!db);
    
    storage = getStorage(app);
    console.log('Client: Storage initialized:', !!storage);
    
    try {
      analytics = getAnalytics(app);
      console.log('Client: Analytics initialized:', !!analytics);
    } catch (analyticsError) {
      console.warn('Client: Analytics initialization failed (this is OK for localhost):', analyticsError.message);
    }
  } else {
    console.error('Client: Firebase config is missing required fields');
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Client: Firebase not initialized: missing environment variables. Fill .env.local based on .env.example.'
      );
    }
  }
} catch (e) {
  console.error('Client: Failed to initialize Firebase:', e);
  console.error('Client: Error details:', e.message, e.code);
}

export { auth, db, storage, analytics };
