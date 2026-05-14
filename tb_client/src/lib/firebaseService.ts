import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query,
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Sample data for fallback when Firebase is not accessible
const getSampleVideos = () => [
  {
    id: 'sample-1',
    title: 'Foundation Overview - Our Mission',
    description: 'Learn about T.B. Lulla Foundation\'s mission to serve the community through various initiatives.',
    videoUrl: 'https://www.youtube.com/watch?v=6stlCkUDG_s',
    thumbnailUrl: 'https://img.youtube.com/vi/6stlCkUDG_s/maxresdefault.jpg',
    category: 'Foundation Overview',
    status: 'active',
    platform: 'youtube',
    uploadDate: '2024-01-15',
    views: 1250
  },
  {
    id: 'sample-2',
    title: 'Community Health Program',
    description: 'Discover how we\'re making healthcare accessible to underserved communities.',
    videoUrl: 'https://www.youtube.com/watch?v=QH2-TGUlwu4',
    thumbnailUrl: 'https://img.youtube.com/vi/QH2-TGUlwu4/maxresdefault.jpg',
    category: 'Healthcare Initiatives',
    status: 'active',
    platform: 'youtube',
    uploadDate: '2024-01-10',
    views: 890
  },
  {
    id: 'sample-3',
    title: 'Educational Support Initiative',
    description: 'Supporting education for children in rural areas through our scholarship programs.',
    videoUrl: 'https://www.youtube.com/watch?v=nfWlot6h_JM',
    thumbnailUrl: 'https://img.youtube.com/vi/nfWlot6h_JM/maxresdefault.jpg',
    category: 'Educational Programs',
    status: 'active',
    platform: 'youtube',
    uploadDate: '2024-01-05',
    views: 1456
  }
];

// Generic function to get all documents from a collection
export const getDocuments = async (collectionName: string, orderByField = 'createdAt') => {
  try {
    if (!db) {
      console.error('Firestore database not initialized');
      throw new Error('Database not available');
    }
    
    const q = query(collection(db, collectionName), orderBy(orderByField, 'desc'));
    const querySnapshot = await getDocs(q);
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (error) {
    console.error(`Error getting ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to get a single document
export const getDocument = async (collectionName: string, id: string) => {
  try {
    if (!db) {
      console.error('Firestore database not initialized');
      throw new Error('Database not available');
    }
    
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

// Get published documents only
export const getPublishedDocuments = async (collectionName: string, orderByField = 'createdAt') => {
  try {
    if (!db) {
      console.error('Firestore database not initialized');
      throw new Error('Database not available');
    }
    
    const q = query(
      collection(db, collectionName), 
      where('status', '==', 'published'),
      orderBy(orderByField, 'desc')
    );
    const querySnapshot = await getDocs(q);
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (error) {
    console.error(`Error getting published ${collectionName}:`, error);
    throw error;
  }
};

// Get limited number of documents
export const getLimitedDocuments = async (collectionName: string, limitCount: number, orderByField = 'createdAt') => {
  try {
    if (!db) {
      console.error('Firestore database not initialized');
      throw new Error('Database not available');
    }
    
    const q = query(
      collection(db, collectionName), 
      orderBy(orderByField, 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (error) {
    console.error(`Error getting limited ${collectionName}:`, error);
    throw error;
  }
};

// Specific service functions for different collections
export const eventService = {
  getAll: () => getDocuments('events'),
  getPublished: () => getPublishedDocuments('events', 'date'),
  getUpcoming: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'events'),
        where('status', '==', 'upcoming'),
        where('date', '>=', today),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const events: any[] = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      return events;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  },
  getById: (id: string) => getDocument('events', id)
};

export const projectService = {
  getAll: () => getDocuments('projects'),
  getActive: async () => {
    try {
      const q = query(
        collection(db, 'projects'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const projects: any[] = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      return projects;
    } catch (error) {
      console.error('Error getting active projects:', error);
      throw error;
    }
  },
  getByCategory: async (category: string) => {
    try {
      const q = query(
        collection(db, 'projects'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const projects: any[] = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      return projects;
    } catch (error) {
      console.error(`Error getting projects by category ${category}:`, error);
      throw error;
    }
  },
  getById: (id: string) => getDocument('projects', id)
};

export const blogService = {
  getAll: async () => {
    try {
      return await getDocuments('blogs', 'createdAt');
    } catch (error) {
      console.error('Error getting all blogs:', error);
      // Try without ordering if createdAt field doesn't exist
      try {
        const q = query(collection(db, 'blogs'));
        const querySnapshot = await getDocs(q);
        const documents: any[] = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        return documents;
      } catch (fallbackError) {
        console.error('Error getting blogs without ordering:', fallbackError);
        throw fallbackError;
      }
    }
  },
  getPublished: async () => {
    try {
      console.log('blogService.getPublished: Starting to fetch published blogs...');
      
      // Try multiple approaches to get blogs
      let blogs = [];
      
      try {
        // First try: Get published blogs with ordering
        const q = query(
          collection(db, 'blogs'), 
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          blogs.push({ id: doc.id, ...doc.data() });
        });
        console.log('blogService.getPublished: Found', blogs.length, 'published blogs with ordering');
      } catch (orderError) {
        console.warn('blogService.getPublished: Ordering failed, trying without ordering:', orderError);
        
        // Fallback: Get published blogs without ordering
        const q = query(
          collection(db, 'blogs'), 
          where('status', '==', 'published')
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          blogs.push({ id: doc.id, ...doc.data() });
        });
        console.log('blogService.getPublished: Found', blogs.length, 'published blogs without ordering');
      }
      
      // If no published blogs found, try getting all blogs and filter client-side
      if (blogs.length === 0) {
        console.log('blogService.getPublished: No published blogs found, trying all blogs...');
        const allBlogsQuery = query(collection(db, 'blogs'));
        const allSnapshot = await getDocs(allBlogsQuery);
        allSnapshot.forEach((doc) => {
          const data = doc.data();
          // Include blogs that are published or have no status (default to published)
          if (!data.status || data.status === 'published') {
            blogs.push({ id: doc.id, ...data });
          }
        });
        console.log('blogService.getPublished: Found', blogs.length, 'blogs after client-side filtering');
      }
      
      // Log each blog's image data for debugging
      blogs.forEach((blog, index) => {
        console.log(`blogService.getPublished: Blog ${index + 1} "${blog.title}":`, {
          id: blog.id,
          hasImage: !!(blog.image || blog.imageUrl),
          image: blog.image,
          imageUrl: blog.imageUrl,
          status: blog.status
        });
      });
      
      return blogs;
    } catch (error) {
      console.error('blogService.getPublished: All methods failed:', error);
      throw error;
    }
  },
  getRecent: (count: number = 5) => getLimitedDocuments('blogs', count, 'createdAt'),
  getByCategory: async (category: string) => {
    try {
      const q = query(
        collection(db, 'blogs'),
        where('category', '==', category),
        where('status', '==', 'published'),
        orderBy('publishDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const blogs: any[] = [];
      querySnapshot.forEach((doc) => {
        blogs.push({ id: doc.id, ...doc.data() });
      });
      return blogs;
    } catch (error) {
      console.error(`Error getting blogs by category ${category}:`, error);
      throw error;
    }
  },
  getById: (id: string) => getDocument('blogs', id)
};

export const videoService = {
  getAll: async () => {
    try {
      return await getDocuments('videos');
    } catch (error) {
      console.error('Error getting all videos:', error);
      return getSampleVideos();
    }
  },
  getActive: async () => {
    try {
      if (!db) {
        console.warn('Client: Database not initialized, using sample videos');
        return getSampleVideos();
      }

      console.log('Client: Attempting to fetch active videos from Firestore...');
      
      // First try to get all videos without filters to test basic access
      let q;
      try {
        q = query(collection(db, 'videos'), orderBy('uploadDate', 'desc'));
        console.log('Client: Trying to fetch all videos first...');
      } catch (orderError) {
        console.log('Client: OrderBy failed, trying simple collection query...');
        q = query(collection(db, 'videos'));
      }
      
      const querySnapshot = await getDocs(q);
      const allVideos: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Record<string, any>;
        allVideos.push({ id: doc.id, ...data });
      });
      
      console.log(`Client: Successfully fetched ${allVideos.length} total videos from Firestore`);
      
      // Filter for active videos
      const activeVideos = allVideos.filter(video => video.status === 'active');
      console.log(`Client: Found ${activeVideos.length} active videos`);
      
      // If no active videos found, return sample videos
      if (activeVideos.length === 0) {
        console.log('Client: No active videos found in database, using sample videos');
        return getSampleVideos();
      }
      
      return activeVideos;
    } catch (error) {
      console.error('Client: Error getting active videos:', error);
      console.log('Client: Falling back to sample videos due to error');
      // Return sample videos as fallback
      return getSampleVideos();
    }
  },
  getByCategory: async (category: string) => {
    try {
      const q = query(
        collection(db, 'videos'),
        where('category', '==', category),
        where('status', '==', 'active'),
        orderBy('uploadDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const videos: any[] = [];
      querySnapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() });
      });
      return videos;
    } catch (error) {
      console.error(`Error getting videos by category ${category}:`, error);
      // Return filtered sample videos by category
      return getSampleVideos().filter(video => video.category === category);
    }
  },
  getById: async (id: string) => {
    try {
      return await getDocument('videos', id);
    } catch (error) {
      console.error(`Error getting video by id ${id}:`, error);
      // Return sample video if id matches
      const sampleVideo = getSampleVideos().find(video => video.id === id);
      if (sampleVideo) {
        return sampleVideo;
      }
      throw error;
    }
  }
};

export const reportService = {
  getAll: () => getDocuments('reports'),
  getPublished: () => getPublishedDocuments('reports', 'publishDate'),
  getById: (id: string) => getDocument('reports', id)
};

export const ngoService = {
  getAll: () => getDocuments('ngos'),
  getActive: async () => {
    try {
      const q = query(
        collection(db, 'ngos'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const ngos: any[] = [];
      querySnapshot.forEach((doc) => {
        ngos.push({ id: doc.id, ...doc.data() });
      });
      return ngos;
    } catch (error) {
      console.error('Error getting active NGOs:', error);
      throw error;
    }
  },
  getById: (id: string) => getDocument('ngos', id)
};

export const rotaryGrantService = {
  getAll: () => getDocuments('rotaryGrants'),
  getActive: async () => {
    try {
      const q = query(
        collection(db, 'rotaryGrants'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const grants: any[] = [];
      querySnapshot.forEach((doc) => {
        grants.push({ id: doc.id, ...doc.data() });
      });
      return grants;
    } catch (error) {
      console.error('Error getting active rotary grants:', error);
      throw error;
    }
  },
  getById: (id: string) => getDocument('rotaryGrants', id)
};

export const testimonialService = {
  getAll: async () => {
    try {
      console.log('testimonialService.getAll: Starting to fetch testimonials...');
      return await getDocuments('testimonials', 'createdAt');
    } catch (error) {
      console.error('testimonialService.getAll: Error getting testimonials:', error);
      // Try without ordering if createdAt field doesn't exist
      try {
        console.log('testimonialService.getAll: Trying without ordering...');
        const q = query(collection(db, 'testimonials'));
        const querySnapshot = await getDocs(q);
        const documents: any[] = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        console.log('testimonialService.getAll: Found', documents.length, 'testimonials');
        return documents;
      } catch (fallbackError) {
        console.error('testimonialService.getAll: Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },
  getActive: async () => {
    try {
      const q = query(
        collection(db, 'testimonials'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const testimonials: any[] = [];
      querySnapshot.forEach((doc) => {
        testimonials.push({ id: doc.id, ...doc.data() });
      });
      return testimonials;
    } catch (error) {
      console.error('Error getting active testimonials:', error);
      // Fallback to all testimonials
      return await testimonialService.getAll();
    }
  },
  getById: (id: string) => getDocument('testimonials', id)
};
