import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DebugFirestore: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirestore = async () => {
      console.log('DEBUG: Starting Firestore check...');
      
      if (!db) {
        setDebugInfo({ error: 'Firebase DB not initialized' });
        setLoading(false);
        return;
      }

      try {
        // Check photos collection
        console.log('DEBUG: Checking photos collection...');
        const photosQuery = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
        const photosSnapshot = await getDocs(photosQuery);
        
        const photos = photosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('DEBUG: Found photos:', photos);

        setDebugInfo({
          success: true,
          photosCount: photos.length,
          photos: photos,
          rawDocs: photosSnapshot.docs.length
        });
      } catch (error: any) {
        console.error('DEBUG: Error checking Firestore:', error);
        setDebugInfo({
          error: error.message,
          code: error.code
        });
      }
      
      setLoading(false);
    };

    checkFirestore();
  }, []);

  if (loading) {
    return <div className="p-4 bg-blue-100 rounded">🔍 Checking Firestore...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg mt-4">
      <h3 className="font-bold mb-2">🐛 Firestore Debug Info</h3>
      <pre className="text-sm overflow-auto bg-white p-2 rounded">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default DebugFirestore;
