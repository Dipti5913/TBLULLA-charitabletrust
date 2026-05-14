import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const Events: React.FC = () => {
  const [firebaseEvents, setFirebaseEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpenFor, setGalleryOpenFor] = useState<number | null>(null);

  const [lightbox, setLightbox] = useState<{ eventIndex: number; imageIndex: number } | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch events from Firebase
  useEffect(() => {
    console.log('Events: Starting to fetch events, db:', !!db);
    
    if (!db) {
      console.error('Events: Firebase Firestore not initialized');
      setError('Firebase connection failed');
      setLoading(false);
      return;
    }

    try {
      console.log('Events: Setting up Firestore listener for events collection');
      
      // Try to order by createdAt first, fallback to no ordering if it fails
      let q;
      try {
        q = query(collection(db, 'events'), orderBy('createdAt', 'asc'));
      } catch (orderError) {
        console.log('Events: createdAt ordering failed, using simple query');
        q = query(collection(db, 'events'));
      }
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('Events: Received snapshot with', snapshot.docs.length, 'events');
          
          const fetchedEvents = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('Events: Processing event:', doc.id, data);
            // Enhanced image handling with better filtering
            let images: string[] = [];
            
            // Handle multiple images array with priority order
            if (data.images && Array.isArray(data.images)) {
              images = data.images.filter(img => 
                img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
              );
            } else if (data.photos && Array.isArray(data.photos)) {
              images = data.photos.filter(img => 
                img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
              );
            } else if (data.gallery && Array.isArray(data.gallery)) {
              images = data.gallery.filter(img => 
                img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
              );
            } else if (data.imageUrls && Array.isArray(data.imageUrls)) {
              images = data.imageUrls.filter(img => 
                img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
              );
            }
            
            // Handle single image fields as fallback
            if (images.length === 0) {
              if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim() && data.imageUrl.startsWith('http')) {
                images = [data.imageUrl.trim()];
              } else if (data.photoUrl && typeof data.photoUrl === 'string' && data.photoUrl.trim() && data.photoUrl.startsWith('http')) {
                images = [data.photoUrl.trim()];
              } else if (data.image && typeof data.image === 'string' && data.image.trim() && data.image.startsWith('http')) {
                images = [data.image.trim()];
              }
            }
            console.log(`Events: Processing event "${data.title}":`, {
              id: doc.id,
              hasValidImages: images.length > 0,
              imagesCount: images.length,
              primaryImage: images.length > 0 ? images[0] : null,
              allImages: images
            });
            
            return {
              id: doc.id,
              year: data.year?.toString() || 'Unknown',
              title: data.title || 'Untitled Event',
              description: data.description || 'No description available',
              // Try common image field names so admin can use any (backward compatibility)
              imageUrl: images.length > 0 ? images[0] : '',
              images,
              createdAt: data.createdAt,
            };
          });
          
          setFirebaseEvents(fetchedEvents);
          setLoading(false);
          setError(null);
          console.log('Events: Successfully loaded', fetchedEvents.length, 'events from Firebase');
        },
        (err) => {
          console.error('Events: Error fetching events:', err);
          
          // If ordering failed, try again without ordering
          if (err.code === 'failed-precondition' || err.message?.includes('index')) {
            console.log('Events: Retrying without ordering due to index error');
            const simpleQuery = query(collection(db, 'events'));
            onSnapshot(simpleQuery, (snapshot) => {
              const fetchedEvents = snapshot.docs.map((doc) => {
                const data = doc.data();
                // Use same enhanced image handling logic
                let images: string[] = [];
                
                if (data.images && Array.isArray(data.images)) {
                  images = data.images.filter(img => 
                    img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
                  );
                } else if (data.photos && Array.isArray(data.photos)) {
                  images = data.photos.filter(img => 
                    img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
                  );
                } else if (data.gallery && Array.isArray(data.gallery)) {
                  images = data.gallery.filter(img => 
                    img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
                  );
                } else if (data.imageUrls && Array.isArray(data.imageUrls)) {
                  images = data.imageUrls.filter(img => 
                    img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
                  );
                }
                
                if (images.length === 0) {
                  if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim() && data.imageUrl.startsWith('http')) {
                    images = [data.imageUrl.trim()];
                  } else if (data.photoUrl && typeof data.photoUrl === 'string' && data.photoUrl.trim() && data.photoUrl.startsWith('http')) {
                    images = [data.photoUrl.trim()];
                  }
                }
                return {
                  id: doc.id,
                  year: data.year?.toString() || 'Unknown',
                  title: data.title || 'Untitled Event',
                  description: data.description || 'No description available',
                  imageUrl: images.length > 0 ? images[0] : '',
                  images,
                  createdAt: data.createdAt,
                };
              });
              setFirebaseEvents(fetchedEvents);
              setLoading(false);
              setError(null);
            });
          } else {
            setError('Failed to load events from Firebase');
            setLoading(false);
          }
        }
      );

      return () => {
        console.log('Events: Cleaning up Firestore listener');
        unsubscribe();
      };
    } catch (err: any) {
      console.error('Events: Error setting up event listener:', err);
      setError(`Failed to initialize events: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, []);

  // Use only Firebase events
  const allEvents = firebaseEvents;

  // Professional UI: keyboard navigation and scroll lock for modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) {
          setLightbox(null);
        } else if (galleryOpenFor !== null) {
          setGalleryOpenFor(null);
        }
      }
      if (lightbox) {
        const ev = allEvents[lightbox.eventIndex] as any;
        const images: string[] = (ev && ev.images) ? ev.images : [];
        if (images.length > 0) {
          if (e.key === 'ArrowLeft') {
            const prevIndex = (lightbox.imageIndex - 1 + images.length) % images.length;
            setLightbox({ eventIndex: lightbox.eventIndex, imageIndex: prevIndex });
          } else if (e.key === 'ArrowRight') {
            const nextIndex = (lightbox.imageIndex + 1) % images.length;
            setLightbox({ eventIndex: lightbox.eventIndex, imageIndex: nextIndex });
          }
        }
      }
    };
    if (galleryOpenFor !== null || lightbox) {
      document.addEventListener('keydown', onKeyDown as any);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown as any);
      document.body.style.overflow = '';
    };
  }, [galleryOpenFor, lightbox, allEvents]);

  return (
    <Layout>
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Timeline of Impact
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Our Events
              <span className="block text-blue-600">Journey Through Time</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the milestones and memorable moments that have shaped our foundation's 
              journey of service, community impact, and social transformation.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-4 text-lg text-gray-600">Loading events...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16 mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Connection Issue</h3>
              <p className="text-gray-600 mb-2">{error}</p>
              <p className="text-gray-500 text-sm">Please check your connection and try again</p>
            </div>
          )}

          {/* No Events State */}
          {!loading && !error && allEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">No Events Yet</h3>
              <p className="text-gray-600">Events will be added from the admin panel soon.</p>
            </div>
          )}

          {/* Timeline Container */}
          {!loading && !error && allEvents.length > 0 && (
            <div className="relative max-w-6xl mx-auto">
              {/* Vertical Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-600 rounded-full" />

              <div className="space-y-20">
                {allEvents.map((event, index) => (
                  <div
                    key={event.id || index}
                    className={`relative flex ${
                      index % 2 === 0
                        ? "justify-start pr-[52%]"
                        : "justify-end pl-[52%]"
                    }`}
                  >
                    {/* Timeline Connector Dot */}
                    <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-8 h-8 border-4 border-white rounded-full shadow-xl z-10 transition-all duration-300 hover:scale-125 bg-gradient-to-tr from-blue-500 to-indigo-600" />

                    {/* Event Card */}
                    <div
                      className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl p-8 max-w-lg"
                    >
                      
                      {/* Top accent border */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

                      {/* Year Badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                          {event.year}
                        </div>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                        {event.title}
                      </h3>

                      {/* Event Description */}
                      <p className="text-gray-600 leading-relaxed break-words whitespace-normal">
                        {event.description}
                      </p>

                      {/* Simple Image Display with Gallery Button */}
                      {(event as any).images && (event as any).images.length > 0 && (
                        <div className="mt-6 space-y-4">
                          {/* Main Image - Full Display */}
                          <div 
                            className="relative rounded-lg overflow-hidden cursor-pointer bg-gray-50 flex items-center justify-center min-h-[200px]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🖼️ IMAGE CLICKED!');
                              console.log('Event index:', index);
                              console.log('Event images:', (event as any).images);
                              setImageLoading(true);
                              setGalleryOpenFor(index);
                            }}
                          >
                            <img
                              src={(event as any).images[0]}
                              alt={`${(event as any).title} - Preview`}
                              className="w-full h-auto object-contain max-h-80 rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              loading="lazy"
                            />
                            
                            {/* Image Count Badge */}
                            {(event as any).images.length > 1 && (
                              <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                                📸 {(event as any).images.length} photos
                              </div>
                            )}
                          </div>
                          
                          {/* Gallery Button - Simple and Direct */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🔥 GALLERY BUTTON CLICKED!');
                              console.log('Event index:', index);
                              console.log('Event:', event);
                              console.log('Images count:', (event as any).images.length);
                              setGalleryOpenFor(index);
                            }}
                            className="relative z-20 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                              {(event as any).images.length === 1 
                                ? 'View Photo' 
                                : `View Gallery (${(event as any).images.length} photos)`
                              }
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Gallery Modal with improved UX */}
              {galleryOpenFor !== null && (() => {
                const ev = allEvents[galleryOpenFor] as any;
                const images: string[] = (ev && ev.images) ? ev.images : [];
                return (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="gallery-modal-title"
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
                    onClick={() => setGalleryOpenFor(null)}
                  >
                    <div
                      className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                          <h3 id="gallery-modal-title" className="text-xl font-bold text-gray-900">
                            {(ev?.title) || 'Event Photos'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {images.length} photo{images.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Close gallery"
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                          onClick={() => setGalleryOpenFor(null)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Gallery Content */}
                      <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {images.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-600">No photos available for this event.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((src, i) => (
                              <div
                                key={i}
                                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center"
                                onClick={() => {
                                  console.log('🖼️ Gallery image clicked!');
                                  console.log('Image URL:', src);
                                  console.log('Image index:', i);
                                  setImageLoading(true);
                                  setLightbox({ eventIndex: galleryOpenFor as number, imageIndex: i });
                                }}
                              >
                                <img
                                  src={src}
                                  alt={`${(ev?.title) || 'Event'} - Photo ${i + 1}`}
                                  loading="lazy"
                                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    // Show placeholder
                                    const placeholder = target.parentElement?.querySelector('.placeholder');
                                    if (placeholder) {
                                      (placeholder as HTMLElement).style.display = 'flex';
                                    }
                                  }}
                                />
                                
                                {/* Placeholder for failed images */}
                                <div className="placeholder absolute inset-0 bg-gray-200 flex items-center justify-center hidden">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Image Number */}
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  {i + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Enhanced Lightbox Modal with smooth transitions */}
              {lightbox && (() => {
                const ev = allEvents[lightbox.eventIndex] as any;
                const images: string[] = (ev && ev.images) ? ev.images : [];
                const src = images[lightbox.imageIndex];
                const prevIndex = (lightbox.imageIndex - 1 + images.length) % (images.length || 1);
                const nextIndex = (lightbox.imageIndex + 1) % (images.length || 1);
                
                return (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image viewer"
                    className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
                    onClick={() => setLightbox(null)}
                  >
                    <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative flex items-center justify-center w-full h-full">
                        {/* Loading indicator */}
                        {imageLoading && (
                          <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center z-10">
                            <div className="bg-white/90 rounded-lg p-4 flex items-center gap-3">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                              <span className="text-gray-700">Loading image...</span>
                            </div>
                          </div>
                        )}
                        
                        {src ? (
                          <img
                            src={src}
                            alt={`${(ev?.title) || 'Event'} - Photo ${lightbox.imageIndex + 1}`}
                            className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                            style={{ 
                              minWidth: '300px',
                              minHeight: '200px'
                            }}
                            onError={(e) => {
                              console.error('🚨 Lightbox image failed to load!');
                              console.error('Image URL:', src);
                              console.error('Event:', ev);
                              console.error('All images:', images);
                              setImageLoading(false);
                              
                              // Show error and try next image or close
                              if (images.length > 1) {
                                console.log('Trying next image...');
                                setLightbox({ eventIndex: lightbox.eventIndex, imageIndex: nextIndex });
                              } else {
                                console.log('No more images, closing lightbox');
                                setLightbox(null);
                              }
                            }}
                            onLoad={(e) => {
                              console.log('✅ Lightbox image loaded successfully:', src);
                              setImageLoading(false);
                            }}
                            onLoadStart={() => {
                              console.log('🔄 Starting to load image:', src);
                              setImageLoading(true);
                            }}
                          />
                        ) : (
                          <div className="bg-gray-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-gray-600">Image not available</p>
                              <p className="text-gray-500 text-sm mt-2">URL: {src || 'No URL'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Navigation Controls */}
                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous image"
                            onClick={() => setLightbox({ eventIndex: lightbox.eventIndex, imageIndex: prevIndex })}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 shadow-lg transition-all duration-200 hover:scale-110"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            aria-label="Next image"
                            onClick={() => setLightbox({ eventIndex: lightbox.eventIndex, imageIndex: nextIndex })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 shadow-lg transition-all duration-200 hover:scale-110"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Top Controls */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                          {lightbox.imageIndex + 1} of {images.length}
                        </div>
                        <button
                          type="button"
                          aria-label="Close lightbox"
                          onClick={() => setLightbox(null)}
                          className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 shadow-lg transition-all duration-200 hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Bottom Info */}
                      <div className="absolute bottom-4 left-4 right-4 text-center">
                        <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm inline-block">
                          {(ev?.title) || 'Event Photo'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Events;