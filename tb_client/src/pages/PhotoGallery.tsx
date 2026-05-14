import React, { useCallback, useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { collection, onSnapshot, orderBy, query, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase.js";

type PhotoItem = {
  id: string;
  src: string;
  alt: string;
  title?: string;
  category?: string;
  createdAt?: any;
};

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch photos from Firebase
  useEffect(() => {
    console.log('PhotoGallery: Starting to fetch photos, db:', !!db);
    
    if (!db) {
      console.error('PhotoGallery: Firebase Firestore not initialized');
      setError('Firebase connection failed. Please check your internet connection and try again.');
      setLoading(false);
      return;
    }

    try {
      console.log('PhotoGallery: Testing Firestore connection first...');
      
      // First, try a simple read to test permissions
      const testQuery = query(collection(db, 'photos'));
      getDocs(testQuery)
        .then((snapshot) => {
          console.log('PhotoGallery: Test query successful, found', snapshot.docs.length, 'documents');
          
          // If test successful, set up real-time listener
          const q = query(collection(db, 'photos'));
          
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              console.log('PhotoGallery: Received snapshot with', snapshot.docs.length, 'photos');
              
              const fetchedPhotos: PhotoItem[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                console.log('PhotoGallery: Processing photo:', doc.id, data);
                return {
                  id: doc.id,
                  src: data.url,
                  alt: data.title || 'Gallery photo',
                  title: data.title,
                  category: data.category,
                  createdAt: data.createdAt,
                };
              });
              
              // Sort by createdAt on client side (newest first)
              const sortedPhotos = fetchedPhotos.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.seconds - a.createdAt.seconds;
              });
              
              setPhotos(sortedPhotos);
              setLoading(false);
              setError(null);
              console.log('PhotoGallery: Successfully loaded', fetchedPhotos.length, 'photos');
            },
            (err) => {
              console.error('PhotoGallery: Error in onSnapshot:', err);
              handleFirestoreError(err);
            }
          );

          return () => {
            console.log('PhotoGallery: Cleaning up Firestore listener');
            unsubscribe();
          };
        })
        .catch((err) => {
          console.error('PhotoGallery: Test query failed:', err);
          handleFirestoreError(err);
        });
      
      const handleFirestoreError = (err: any) => {
        console.error('PhotoGallery: Firestore error details:', {
          code: err.code,
          message: err.message,
          stack: err.stack
        });
        
        let errorMessage = 'Failed to load photos';
        if (err.code === 'permission-denied') {
          errorMessage = 'Access denied. Firestore security rules are blocking access. Please configure security rules to allow read access to the photos collection.';
        } else if (err.code === 'unavailable') {
          errorMessage = 'Firestore service unavailable. Please check your internet connection.';
        } else if (err.code === 'not-found') {
          errorMessage = 'Photos collection not found. Please add some photos through the admin panel first.';
        } else if (err.message) {
          errorMessage = `Firestore error: ${err.message}`;
        }
        
        setError(errorMessage);
        setLoading(false);
      };
    } catch (err: any) {
      console.error('PhotoGallery: Error setting up photo listener:', err);
      setError(`Failed to initialize photo gallery: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, []);

  // Group photos by category
  const groupedPhotos = photos.reduce((acc, photo) => {
    const category = photo.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(photo);
    return acc;
  }, {} as Record<string, PhotoItem[]>);

  // Get unique categories
  const categories = Object.keys(groupedPhotos).sort();

  // Get filtered photos based on selected category
  const filteredPhotos = selectedCategory 
    ? groupedPhotos[selectedCategory] || []
    : photos;

  const close = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () =>
      setLightboxIndex((idx) =>
        idx === null ? idx : (idx - 1 + filteredPhotos.length) % filteredPhotos.length
      ),
    [filteredPhotos.length]
  );
  const showNext = useCallback(
    () =>
      setLightboxIndex((idx) =>
        idx === null ? idx : (idx + 1) % filteredPhotos.length
      ),
    [filteredPhotos.length]
  );

  // Keyboard navigation for accessibility
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, close, showNext, showPrev]);

  return (
    <Layout>
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Visual Stories
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Photo Gallery
              <span className="block text-blue-600">Moments of Impact</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A curated collection of moments from our initiatives and events, showcasing the 
              transformative power of community service and social impact.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-4 text-lg text-gray-600">Loading photos...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Error Loading Photos</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && photos.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <span className="text-2xl">📷</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">No Photos Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">Photos will appear here once they are uploaded through the admin panel.</p>
            </div>
          )}

          {/* Category Filter */}
          {!loading && !error && photos.length > 0 && categories.length > 1 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse by Category</h2>
                <p className="text-gray-600">Filter photos by different categories and events</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  All Photos ({photos.length})
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {category} ({groupedPhotos[category]?.length || 0})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Category Display */}
          {!loading && !error && photos.length > 0 && selectedCategory && (
            <div className="mb-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCategory}</h2>
                <p className="text-gray-600">
                  {groupedPhotos[selectedCategory]?.length || 0} photo{(groupedPhotos[selectedCategory]?.length || 0) !== 1 ? 's' : ''} in this category
                </p>
              </div>
            </div>
          )}

          {/* Photo Grid */}
          {!loading && !error && photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={`Open ${photo.alt}`}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                >
                  {/* Card Border Glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10"></div>
                  
                  {/* Top accent border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      console.error('Failed to load image:', photo.src);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  {photo.category && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full opacity-90">
                      {photo.category}
                    </div>
                  )}

                  {/* Title Overlay */}
                  {photo.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm font-medium truncate">{photo.title}</p>
                    </div>
                  )}

                  {/* Hover Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <div
            className="relative max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredPhotos[lightboxIndex].src}
              alt={filteredPhotos[lightboxIndex].alt}
              className="w-full max-h-[80vh] object-contain rounded-md shadow-xl"
            />

            {/* Controls */}
            <button
              type="button"
              aria-label="Previous image"
              onClick={showPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={showNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow"
            >
              ›
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute top-2 right-2 px-3 py-1.5 rounded-md bg-white/90 hover:bg-white text-gray-900 shadow"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PhotoGallery;
