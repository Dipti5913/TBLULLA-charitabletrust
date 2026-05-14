import React, { useState, useEffect } from 'react';
import TestimonialModal from '../components/TestimonialModal';
import { testimonialService } from '../services/firebaseService';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      console.log('Loading testimonials...');
      const testimonialsData = await testimonialService.getAll();
      console.log('Testimonials loaded:', testimonialsData);
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (testimonialData) => {
    try {
      if (editingTestimonial) {
        await testimonialService.update(editingTestimonial.id, testimonialData);
      } else {
        await testimonialService.create(testimonialData);
      }

      await loadTestimonials();
      setEditingTestimonial(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    if (window.confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      try {
        await testimonialService.delete(testimonialId);
        await loadTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setShowModal(true);
  };

  const getYouTubeVideoId = (url) => {
    // Handle various YouTube URL formats including Shorts
    const patterns = [
      /(?:youtube\.com\/embed\/)([^?&]+)/,
      /(?:youtu\.be\/)([^?&]+)/,
      /(?:youtube\.com\/watch\?v=)([^?&]+)/,
      /(?:youtube\.com\/shorts\/)([^?&]+)/,
      /(?:youtube\.com\/v\/)([^?&]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const getThumbnailUrl = (testimonial) => {
    // If custom thumbnail is provided, use it
    if (testimonial.thumbnailUrl) {
      return testimonial.thumbnailUrl;
    }
    
    // Generate thumbnail based on platform
    const platform = testimonial.platform || 'youtube';
    const url = testimonial.videoUrl || '';
    
    switch (platform) {
      case 'youtube':
      case 'youtube-shorts':
        const videoId = getYouTubeVideoId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/api/placeholder/300/200';
      
      case 'instagram-reel':
      case 'instagram-video':
        return '/api/placeholder/300/400'; // Instagram aspect ratio
      
      case 'facebook':
      case 'twitter':
      case 'linkedin':
      case 'tiktok':
        return '/api/placeholder/300/300'; // Square aspect ratio
      
      default:
        return '/api/placeholder/300/200';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube': return '📺';
      case 'youtube-shorts': return '🩳';
      case 'instagram-reel': return '📱';
      case 'instagram-video': return '📹';
      case 'facebook': return '👥';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'tiktok': return '🎵';
      default: return '📺';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white break-words">Video Testimonials</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">Manage video testimonials from community members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Add Video Testimonial
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Testimonials Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Start building trust by adding video testimonials from community members who have benefited from your projects.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add First Testimonial
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={getThumbnailUrl(testimonial)}
                  alt={`${testimonial.title || 'Video'} testimonial`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/300/200';
                  }}
                />
                

                
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-words">
                      {testimonial.title || 'Video Testimonial'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <span className="capitalize">{(testimonial.platform || 'youtube').replace('-', ' ')}</span>
                      <span>•</span>
                      <span>{new Date(testimonial.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                    </div>
                    {testimonial.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 line-clamp-2">
                        {testimonial.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditTestimonial(testimonial)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit Video"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete Video"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Video URL Preview */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-500 break-all">
                    Video: {testimonial.videoUrl}
                  </p>
                  {testimonial.thumbnailUrl && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 break-all mt-1">
                      Thumbnail: {testimonial.thumbnailUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TestimonialModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTestimonial(null);
        }}
        onSubmit={handleSubmit}
        title={editingTestimonial ? 'Edit Video Testimonial' : 'Add Video Testimonial'}
        initialData={editingTestimonial}
      />
    </div>
  );
};

export default Testimonials;