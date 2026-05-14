import React, { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { videoService } from "../lib/firebaseService";

type VideoItem = {
  id: string;
  title: string;
  src: string; // YouTube embed link or other iframe-supported video URL
  youtubeId?: string;
  createdAt?: any;
};

// Sample videos for testing when no Firebase videos are available
const sampleVideos: VideoItem[] = [
  {
    id: "sample-1",
    title: "T.B. Lulla Foundation - Educational Initiative",
    src: "https://www.youtube.com/embed/6stlCkUDG_s?autoplay=0&controls=1&rel=0&modestbranding=1",
  },
  {
    id: "sample-2", 
    title: "Community Development Program",
    src: "https://www.youtube.com/embed/QH2-TGUlwu4?autoplay=0&controls=1&rel=0&modestbranding=1",
  },
  {
    id: "sample-3",
    title: "Healthcare Outreach Program", 
    src: "https://www.youtube.com/embed/nfWlot6h_JM?autoplay=0&controls=1&rel=0&modestbranding=1",
  },
  {
    id: "sample-4",
    title: "Educational Impact Story",
    src: "https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=0&controls=1&rel=0&modestbranding=1",
  },
];

function VideoGallery(): JSX.Element {
  const [firebaseVideos, setFirebaseVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingSampleData, setShowingSampleData] = useState(false);

  // Fetch videos from Firebase
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('VideoGallery: Fetching videos from Firebase');
        const fetchedVideos = await videoService.getActive();
        
        // Check if we got sample videos (fallback data)
        const isSampleData = fetchedVideos.length > 0 && fetchedVideos[0].id?.startsWith('sample-');
        
        const formattedVideos: VideoItem[] = fetchedVideos.map((video: any) => {
          // Convert YouTube ID to embed URL if needed
          let embedUrl = '';
          
          if (video.youtubeId) {
            embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&controls=1&rel=0&modestbranding=1`;
          } else if (video.videoUrl || video.url || video.src) {
            const videoUrl = video.videoUrl || video.url || video.src;
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = videoUrl.match(youtubeRegex);
            
            if (match) {
              embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=0&controls=1&rel=0&modestbranding=1`;
            } else if (videoUrl.includes('embed')) {
              const baseUrl = videoUrl.split('?')[0];
              embedUrl = `${baseUrl}?autoplay=0&controls=1&rel=0&modestbranding=1`;
            } else {
              embedUrl = videoUrl;
            }
          }
          
          return {
            id: video.id,
            title: video.title || 'Untitled Video',
            src: embedUrl,
            youtubeId: video.youtubeId,
            createdAt: video.createdAt,
          };
        });
        
        setFirebaseVideos(formattedVideos);
        setLoading(false);
        
        if (isSampleData) {
          setShowingSampleData(true);
          console.log('VideoGallery: Showing sample videos (no real videos found or Firebase access issues)');
        } else {
          setShowingSampleData(false);
          console.log('VideoGallery: Successfully loaded', formattedVideos.length, 'real videos from Firebase');
        }
      } catch (error) {
        console.error('VideoGallery: Error fetching videos:', error);
        setError('Videos collection access blocked - showing sample videos');
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Show Firebase videos if available, otherwise show sample videos
  const allVideos = firebaseVideos.length > 0 ? firebaseVideos : (!loading ? sampleVideos : []);

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
              Video Stories
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Video Gallery
              <span className="block text-blue-600">Stories in Motion</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Watch our collection of videos showcasing our initiatives, events, and the transformative 
              impact of our community programs across India.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-4 text-lg text-gray-600">Loading videos...</span>
            </div>
          )}

          {/* Sample Data Notification */}
          {showingSampleData && !error && (
            <div className="mb-8 mx-auto max-w-4xl">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Demo Mode:</strong> Showing sample videos. Real videos will appear once uploaded through the admin panel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Error Loading Videos</h3>
              <p className="text-gray-600 mb-2">{error}</p>
              <p className="text-gray-500 text-sm">Please try refreshing the page</p>
            </div>
          )}

          {/* Video Grid */}
          {!loading && allVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allVideos.map((video, index) => (
                <article
                  key={video.id}
                  className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl hover:scale-105"
                >
                  {/* Card Border Glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10"></div>
                  
                  {/* Top accent border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Video Container */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    {video.src ? (
                      <iframe
                        className="w-full h-64"
                        src={video.src}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        allowFullScreen
                        style={{ 
                          border: 'none',
                          pointerEvents: 'auto'
                        }}
                        onLoad={() => console.log('Video loaded:', video.title)}
                        onError={(e) => {
                          console.error('Failed to load video:', video.src, e);
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 text-sm">Video not available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                      {video.title}
                    </h3>
                    
                    {/* Video Meta */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Video Story</span>
                    </div>
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && firebaseVideos.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <span className="text-2xl">📹</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">No Videos Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Videos will appear here once they are uploaded through the admin panel.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default VideoGallery;
