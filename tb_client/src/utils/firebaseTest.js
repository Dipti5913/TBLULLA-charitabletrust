import { auth, db, storage } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

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
      console.log('✅ Client Firebase Auth: Connected');
    } else {
      results.errors.push('Firebase Auth not initialized');
      console.log('❌ Client Firebase Auth: Not initialized');
    }
  } catch (error) {
    results.errors.push(`Auth error: ${error.message}`);
    console.log('❌ Client Firebase Auth: Error -', error.message);
  }

  // Test Firestore
  try {
    if (db) {
      // Try to read from a test collection
      const q = query(collection(db, '_test'), limit(1));
      const testDoc = await getDocs(q);
      results.firestore = true;
      console.log('✅ Client Firebase Firestore: Connected');
    } else {
      results.errors.push('Firebase Firestore not initialized');
      console.log('❌ Client Firebase Firestore: Not initialized');
    }
  } catch (error) {
    results.errors.push(`Firestore error: ${error.message}`);
    console.log('❌ Client Firebase Firestore: Error -', error.message);
  }

  // Test Storage
  try {
    if (storage) {
      results.storage = true;
      console.log('✅ Client Firebase Storage: Connected');
    } else {
      results.errors.push('Firebase Storage not initialized');
      console.log('❌ Client Firebase Storage: Not initialized');
    }
  } catch (error) {
    results.errors.push(`Storage error: ${error.message}`);
    console.log('❌ Client Firebase Storage: Error -', error.message);
  }

  return results;
};

export const testVideoService = async () => {
  try {
    const { videoService } = await import('../lib/firebaseService');
    const videos = await videoService.getActive();
    console.log('✅ Client Video Service: Working -', videos.length, 'videos found');
    return { success: true, count: videos.length };
  } catch (error) {
    console.log('❌ Client Video Service: Error -', error.message);
    return { success: false, error: error.message };
  }
};
