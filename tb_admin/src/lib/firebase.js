// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';

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

console.log('Initializing Firebase with config:', firebaseConfig);
console.log('Firebase apps length:', firebase.apps?.length || 'firebase not loaded');

try {
  if (hasConfig) {
    console.log('Firebase config is valid, initializing app...');
    
    // Initialize Firebase only if it hasn't been initialized already
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    console.log('Firebase app initialized successfully');
    
    console.log('Initializing Firebase services...');
    auth = firebase.auth();
    
    // Configure auth to use local persistence to maintain login across page refreshes
    if (auth) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          console.log('Auth persistence set to LOCAL - login will persist across page refreshes');
        })
        .catch((error) => {
          console.warn('Failed to set auth persistence:', error);
          // Don't fail completely if persistence setting fails
        });
    }
    
    console.log('Auth initialized:', !!auth);
    
    db = firebase.firestore();
    console.log('Firestore initialized:', !!db);
    
    storage = firebase.storage();
    console.log('Storage initialized:', !!storage);
    
    try {
      analytics = firebase.analytics();
      console.log('Analytics initialized:', !!analytics);
    } catch (analyticsError) {
      console.warn('Analytics initialization failed (this is OK for localhost):', analyticsError.message);
    }
  } else {
    console.error('Firebase config is missing required fields');
    console.warn('App will continue without Firebase - some features may not work');
  }
} catch (e) {
  console.error('Failed to initialize Firebase:', e);
  console.error('Error details:', e.message, e.code);
  console.warn('App will continue without Firebase - some features may not work');
  // Don't throw the error, let the app continue
}

export { auth, db, storage, analytics };
