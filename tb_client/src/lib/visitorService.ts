import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

const VISITOR_DOC_ID = 'siteVisitors';
const VISITOR_COLLECTION = 'analytics';

// Fallback to localStorage for visitor count if Firebase fails
const STORAGE_KEY = 'tb_visitor_count';
const LAST_UPDATE_KEY = 'tb_visitor_last_update';

// Get visitor count from localStorage
function getLocalVisitorCount(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 1000; // Start with 1000 as base count
  } catch {
    return 1000;
  }
}

// Set visitor count in localStorage
function setLocalVisitorCount(count: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, count.toString());
    localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to save visitor count to localStorage:', error);
  }
}

// Increment local visitor count
function incrementLocalVisitorCount(): number {
  const current = getLocalVisitorCount();
  const newCount = current + 1;
  setLocalVisitorCount(newCount);
  return newCount;
}

/**
 * Increment the visitor count by 1
 */
export async function incrementVisitorCount(): Promise<void> {
  // Always increment local count first
  const localCount = incrementLocalVisitorCount();
  console.log('VisitorService: Incremented local visitor count to:', localCount);

  if (!db) {
    console.warn('VisitorService: Firestore not initialized, using localStorage only');
    return;
  }

  try {
    console.log('VisitorService: Attempting to increment Firebase visitor count...');
    const visitorDocRef = doc(db, VISITOR_COLLECTION, VISITOR_DOC_ID);
    
    // Check if document exists
    const docSnap = await getDoc(visitorDocRef);
    
    if (docSnap.exists()) {
      // Document exists, increment the count
      console.log('VisitorService: Document exists, incrementing count from:', docSnap.data().count);
      await updateDoc(visitorDocRef, {
        count: increment(1),
        lastVisit: new Date().toISOString()
      });
      console.log('VisitorService: Successfully incremented Firebase visitor count');
    } else {
      // Document doesn't exist, create it with initial count
      console.log('VisitorService: Document does not exist, creating with initial count');
      await setDoc(visitorDocRef, {
        count: localCount, // Use local count as starting point
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      console.log('VisitorService: Successfully created visitor count document');
    }
  } catch (error: any) {
    console.error('VisitorService: Firebase error, falling back to localStorage:', error);
    console.error('VisitorService: Error details:', {
      code: error.code,
      message: error.message
    });
    
    // Don't throw error, just log it and continue with localStorage
    if (error.code === 'permission-denied') {
      console.warn('VisitorService: Firebase permissions denied, using localStorage fallback');
    }
  }
}

/**
 * Get the current visitor count
 */
export async function getVisitorCount(): Promise<number> {
  // Try Firebase first, fallback to localStorage
  if (!db) {
    console.warn('VisitorService: Firestore not initialized, using localStorage');
    return getLocalVisitorCount();
  }

  try {
    console.log('VisitorService: Getting visitor count from Firebase...');
    const visitorDocRef = doc(db, VISITOR_COLLECTION, VISITOR_DOC_ID);
    const docSnap = await getDoc(visitorDocRef);
    
    if (docSnap.exists()) {
      const count = docSnap.data().count || 0;
      console.log('VisitorService: Retrieved Firebase visitor count:', count);
      
      // Update localStorage with Firebase count
      if (count > 0) {
        setLocalVisitorCount(count);
      }
      
      return count;
    } else {
      console.log('VisitorService: Firebase document does not exist, using localStorage');
      return getLocalVisitorCount();
    }
  } catch (error: any) {
    console.error('VisitorService: Firebase error, using localStorage fallback:', error);
    console.error('VisitorService: Error details:', {
      code: error.code,
      message: error.message
    });
    
    if (error.code === 'permission-denied') {
      console.warn('VisitorService: Firebase permissions denied, using localStorage');
    }
    
    return getLocalVisitorCount();
  }
}

/**
 * Subscribe to real-time visitor count updates
 */
export function subscribeToVisitorCount(callback: (count: number) => void): () => void {
  // First, provide the current localStorage count immediately
  const localCount = getLocalVisitorCount();
  callback(localCount);

  if (!db) {
    console.warn('VisitorService: Firestore not initialized, using localStorage only');
    // Set up a simple interval to check localStorage changes
    const interval = setInterval(() => {
      const currentCount = getLocalVisitorCount();
      callback(currentCount);
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }

  try {
    console.log('VisitorService: Setting up real-time visitor count subscription...');
    const visitorDocRef = doc(db, VISITOR_COLLECTION, VISITOR_DOC_ID);
    
    const unsubscribe = onSnapshot(visitorDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const count = docSnap.data().count || 0;
        console.log('VisitorService: Real-time Firebase update - visitor count:', count);
        
        // Update localStorage with Firebase count
        if (count > 0) {
          setLocalVisitorCount(count);
        }
        
        callback(count);
      } else {
        console.log('VisitorService: Real-time update - Firebase document does not exist, using localStorage');
        callback(getLocalVisitorCount());
      }
    }, (error: any) => {
      console.error('VisitorService: Firebase subscription error, using localStorage:', error);
      console.error('VisitorService: Subscription error details:', {
        code: error.code,
        message: error.message
      });
      
      if (error.code === 'permission-denied') {
        console.warn('VisitorService: Firebase permissions denied, using localStorage fallback');
      }
      
      // Fallback to localStorage
      callback(getLocalVisitorCount());
      
      // Set up localStorage polling as fallback
      const interval = setInterval(() => {
        callback(getLocalVisitorCount());
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(interval);
    });
    
    console.log('VisitorService: Real-time subscription set up successfully');
    return unsubscribe;
  } catch (error: any) {
    console.error('VisitorService: Error setting up visitor count subscription:', error);
    console.error('VisitorService: Setup error details:', {
      code: error.code,
      message: error.message
    });
    
    // Fallback to localStorage polling
    const interval = setInterval(() => {
      callback(getLocalVisitorCount());
    }, 10000);
    
    return () => clearInterval(interval);
  }
}
