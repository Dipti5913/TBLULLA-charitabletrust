// Import the functions you need from the SDKs you need
import { initializeApp, setLogLevel } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

console.log('Client: Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? '***' : 'MISSING'
});

try {
  if (hasConfig) {
    console.log('Client: Firebase config is valid, initializing app...');
    const app = initializeApp(firebaseConfig);
    console.log('Client: Firebase app initialized successfully');
    
    // Don't set debug logs in production
    if (import.meta.env.DEV) {
      try { setLogLevel('debug'); } catch (_) { /* noop */ }
    }
    
    console.log('Client: Initializing Firebase services...');
    
    // Initialize Auth
    try {
      auth = getAuth(app);
      console.log('Client: Auth initialized:', !!auth);
    } catch (authError) {
      console.error('Client: Auth initialization failed:', authError);
    }
    
    // Initialize Firestore
    try {
      db = getFirestore(app);
      console.log('Client: Firestore initialized:', !!db);
    } catch (firestoreError) {
      console.error('Client: Firestore initialization failed:', firestoreError);
    }
    
    // Initialize Storage
    try {
      storage = getStorage(app);
      console.log('Client: Storage initialized:', !!storage);
    } catch (storageError) {
      console.error('Client: Storage initialization failed:', storageError);
    }
    
    // Initialize Analytics (optional)
    try {
      analytics = getAnalytics(app);
      console.log('Client: Analytics initialized:', !!analytics);
    } catch (analyticsError) {
      console.warn('Client: Analytics initialization failed (this is OK for localhost):', analyticsError.message);
    }
    
    console.log('Client: Firebase initialization complete');
  } else {
    console.error('Client: Firebase config is missing required fields:', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain,
      hasProjectId: !!firebaseConfig.projectId,
      hasAppId: !!firebaseConfig.appId
    });
  }
} catch (e: any) {
  console.error('Client: Failed to initialize Firebase:', e);
  console.error('Client: Error details:', {
    message: e.message,
    code: e.code,
    stack: e.stack
  });
}

export { auth, db, storage, analytics };
