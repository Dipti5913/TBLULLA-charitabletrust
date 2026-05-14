import { auth, db, storage } from '../firebase';
import { collection, limit, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  const results = {
    auth: false,
    firestore: false,
    storage: false,
    errors: []
  };

  // Test Auth
  try {
    if (auth) {
      results.auth = true;
      console.log('✅ Firebase Auth: Connected');
    } else {
      results.errors.push('Firebase Auth not initialized');
      console.log('❌ Firebase Auth: Not initialized');
    }
  } catch (error) {
    results.errors.push(`Auth error: ${error.message}`);
    console.log('❌ Firebase Auth: Error -', error.message);
  }

  // Test Firestore
  try {
    if (db) {
      // Try to read from a test collection
      const qs = await getDocs(limit(collection(db, '_test'), 1));
      results.firestore = true;
      console.log('✅ Firebase Firestore: Connected');
    } else {
      results.errors.push('Firebase Firestore not initialized');
      console.log('❌ Firebase Firestore: Not initialized');
    }
  } catch (error) {
    results.errors.push(`Firestore error: ${error.message}`);
    console.log('❌ Firebase Firestore: Error -', error.message);
  }

  // Test Storage
  try {
    if (storage) {
      results.storage = true;
      console.log('✅ Firebase Storage: Connected');
    } else {
      results.errors.push('Firebase Storage not initialized');
      console.log('❌ Firebase Storage: Not initialized');
    }
  } catch (error) {
    results.errors.push(`Storage error: ${error.message}`);
    console.log('❌ Firebase Storage: Error -', error.message);
  }

  return results;
};

export const testVideoService = async () => {
  try {
    const { videoService } = await import('../services/firebaseService');
    const videos = await videoService.getAll();
    console.log('✅ Video Service: Working -', videos.length, 'videos found');
    return { success: true, count: videos.length };
  } catch (error) {
    console.log('❌ Video Service: Error -', error.message);
    return { success: false, error: error.message };
  }
};
