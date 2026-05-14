// Import the functions you need from the SDKs you need
import { initializeApp, setLogLevel } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
  appId: "1:857439076158:web:eec713b22a29446beab66f",
  measurementId: "G-99JMM2QPF8"
};


// Guard against missing configuration to avoid runtime crashes
const hasConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId;

// Initialize Firebase
console.log('ADMIN: Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  appId: firebaseConfig.appId ? '***' : 'MISSING'
});

let auth = null;
let db = null;
let storage = null;
let analytics = null;

try {
  if (hasConfig) {
    console.log('ADMIN: Firebase config is valid, initializing app...');
    const app = initializeApp(firebaseConfig);
    console.log('ADMIN: Firebase app initialized successfully');
    
    if (process.env.NODE_ENV !== 'production') {
      try { setLogLevel('debug'); } catch (_) { /* noop */ }
    }
    
    console.log('ADMIN: Initializing Firebase services...');
    
    // Initialize Auth
    try {
      auth = getAuth(app);
      console.log('ADMIN: Auth initialized:', !!auth, typeof auth);
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log('ADMIN: Auth persistence set to LOCAL');
        })
        .catch((pErr) => {
          console.warn('ADMIN: Failed to set auth persistence (continuing):', pErr?.message);
        });
    } catch (authError) {
      console.error('ADMIN: Auth initialization failed:', authError);
    }
    
    // Initialize Firestore
    try {
      db = getFirestore(app);
      console.log('ADMIN: Firestore initialized:', !!db, typeof db);
    } catch (firestoreError) {
      console.error('ADMIN: Firestore initialization failed:', firestoreError);
    }
    
    // Initialize Storage
    try {
      storage = getStorage(app);
      console.log('ADMIN: Storage initialized:', !!storage, typeof storage);
    } catch (storageError) {
      console.error('ADMIN: Storage initialization failed:', storageError);
    }
    
    // Initialize Analytics (optional)
    try {
      analytics = getAnalytics(app);
      console.log('ADMIN: Analytics initialized:', !!analytics);
    } catch (analyticsError) {
      console.warn('ADMIN: Analytics initialization failed (OK for localhost):', analyticsError.message);
    }
    
    console.log('ADMIN: Firebase initialization complete. Services:', {
      auth: !!auth,
      db: !!db,
      storage: !!storage,
      analytics: !!analytics
    });
  } else {
    console.error('ADMIN: Firebase config is missing required fields:', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain,
      hasProjectId: !!firebaseConfig.projectId,
      hasAppId: !!firebaseConfig.appId
    });
  }
} catch (e) {
  console.error('ADMIN: Failed to initialize Firebase:', e);
  console.error('ADMIN: Error details:', {
    message: e.message,
    code: e.code,
    stack: e.stack
  });
}

export { auth, db, storage, analytics };
