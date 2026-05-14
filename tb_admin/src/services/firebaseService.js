import { db, storage } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Generic CRUD operations
// Helper function to process video URLs
const processVideoUrl = (url, platform) => {
  if (!url || !platform) return url;
  
  switch (platform) {
    case 'youtube':
    case 'youtube-shorts':
      // Convert various YouTube URL formats to embed format
      const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=)([^?&]+)/,
        /(?:youtu\.be\/)([^?&]+)/,
        /(?:youtube\.com\/shorts\/)([^?&]+)/,
        /(?:youtube\.com\/v\/)([^?&]+)/,
        /(?:youtube\.com\/embed\/)([^?&]+)/
      ];
      
      for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      }
      return url;
      
    default:
      return url;
  }
};

export const createDocument = async (collectionName, data) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    // Avoid writing explicit nulls for common optional fields like images
    const cleaned = { ...data };
    ['image', 'imageUrl'].forEach((k) => {
      if (cleaned[k] == null || cleaned[k] === '') delete cleaned[k];
    });

    // Process video URL if this is a testimonial
    if (collectionName === 'testimonials' && cleaned.videoUrl && cleaned.platform) {
      cleaned.videoUrl = processVideoUrl(cleaned.videoUrl, cleaned.platform);
    }

    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...cleaned,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    const docRef = doc(db, collectionName, id);
    const cleaned = { ...data };
    ['image', 'imageUrl'].forEach((k) => {
      if (cleaned[k] == null || cleaned[k] === '') delete cleaned[k];
    });

    // Process video URL if this is a testimonial
    if (collectionName === 'testimonials' && cleaned.videoUrl && cleaned.platform) {
      cleaned.videoUrl = processVideoUrl(cleaned.videoUrl, cleaned.platform);
    }

    await updateDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp()
    });
    return { id, ...data };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const getDocuments = async (collectionName, orderByField = 'createdAt') => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    const q = query(collection(db, collectionName), orderBy(orderByField, 'desc'));
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return documents;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

export const getDocument = async (collectionName, id) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

// Test storage access
export const testStorageAccess = async () => {
  try {
    if (!storage) {
      throw new Error('Firebase storage not initialized');
    }
    
    // Try to create a reference to test access
    const testRef = ref(storage, 'test/access-test.txt');
    console.log('Storage access test: Reference created successfully');
    return true;
  } catch (error) {
    console.error('Storage access test failed:', error);
    return false;
  }
};

// File upload operations
export const uploadFile = async (file, path) => {
  try {
    console.log('uploadFile: Starting upload process...');
    console.log('uploadFile: File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    console.log('uploadFile: Upload path:', path);
    
    if (!storage) {
      console.error('uploadFile: Firebase storage not initialized');
      throw new Error('Firebase storage not initialized');
    }
    
    console.log('uploadFile: Storage instance available:', !!storage);
    
    const storageRef = ref(storage, path);
    console.log('uploadFile: Storage reference created:', path);
    
    console.log('uploadFile: Starting file upload...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('uploadFile: Upload completed, getting download URL...');
    console.log('uploadFile: Upload snapshot:', {
      bytesTransferred: snapshot.bytesTransferred,
      totalBytes: snapshot.totalBytes
    });
    
    const downloadURL = await getDownloadURL(storageRef);
    console.log('uploadFile: Download URL obtained:', downloadURL);
    
    // Test if the URL is accessible
    try {
      const testResponse = await fetch(downloadURL, { method: 'HEAD' });
      console.log('uploadFile: URL accessibility test:', {
        status: testResponse.status,
        accessible: testResponse.ok
      });
    } catch (testError) {
      console.warn('uploadFile: URL accessibility test failed:', testError.message);
    }
    
    if (!downloadURL || typeof downloadURL !== 'string') {
      throw new Error('Invalid download URL received');
    }
    
    return downloadURL;
  } catch (error) {
    console.error('uploadFile: Error uploading file:', error);
    console.error('uploadFile: Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

export const deleteFile = async (path) => {
  try {
    if (!storage) {
      throw new Error('Firebase storage not initialized');
    }
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Specific service functions for different collections
export const eventService = {
  create: (data) => createDocument('events', data),
  update: (id, data) => updateDocument('events', id, data),
  delete: (id) => deleteDocument('events', id),
  getAll: () => getDocuments('events'),
  getById: (id) => getDocument('events', id)
};

export const projectService = {
  create: (data) => createDocument('projects', data),
  update: (id, data) => updateDocument('projects', id, data),
  delete: (id) => deleteDocument('projects', id),
  getAll: () => getDocuments('projects'),
  getById: (id) => getDocument('projects', id)
};

export const blogService = {
  create: (data) => createDocument('blogs', data),
  update: (id, data) => updateDocument('blogs', id, data),
  delete: (id) => deleteDocument('blogs', id),
  getAll: () => getDocuments('blogs'),
  getById: (id) => getDocument('blogs', id)
};

export const videoService = {
  create: (data) => createDocument('videos', data),
  update: (id, data) => updateDocument('videos', id, data),
  delete: (id) => deleteDocument('videos', id),
  getAll: () => getDocuments('videos'),
  getById: (id) => getDocument('videos', id)
};

export const reportService = {
  create: (data) => createDocument('annualReports', data),
  update: (id, data) => updateDocument('annualReports', id, data),
  delete: (id) => deleteDocument('annualReports', id),
  getAll: () => getDocuments('annualReports'),
  getById: (id) => getDocument('annualReports', id)
};

export const ngoService = {
  create: (data) => createDocument('ngos', data),
  update: (id, data) => updateDocument('ngos', id, data),
  delete: (id) => deleteDocument('ngos', id),
  getAll: () => getDocuments('ngos'),
  getById: (id) => getDocument('ngos', id)
};

export const rotaryGrantService = {
  create: (data) => createDocument('globalGrants', data),
  update: (id, data) => updateDocument('globalGrants', id, data),
  delete: (id) => deleteDocument('globalGrants', id),
  getAll: () => getDocuments('globalGrants'),
  getById: (id) => getDocument('globalGrants', id)
};

export const contactService = {
  create: (data) => createDocument('contacts', data),
  update: (id, data) => updateDocument('contacts', id, data),
  delete: (id) => deleteDocument('contacts', id),
  getAll: () => getDocuments('contacts'),
  getById: (id) => getDocument('contacts', id)
};

export const testimonialService = {
  create: (data) => createDocument('testimonials', data),
  update: (id, data) => updateDocument('testimonials', id, data),
  delete: (id) => deleteDocument('testimonials', id),
  getAll: () => getDocuments('testimonials'),
  getById: (id) => getDocument('testimonials', id)
};
