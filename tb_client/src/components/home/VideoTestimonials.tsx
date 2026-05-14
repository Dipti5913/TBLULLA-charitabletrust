import { useState, useEffect, useRef } from "react";
import { Play, X } from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Testimonial {
  id: number;
  name: string;
  title: string;
  organization: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  platform?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    title: "Medical Director",
    organization: "Sangli Civil Hospital",
    thumbnailUrl: "https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
    description: "Healthcare transformation testimonial",
  },
  {
    id: 2,
    name: "Priya Sharma",
    title: "Principal",
    organization: "Government School, Sangli",
    thumbnailUrl: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    description: "Education impact testimonial",
  },
  {
    id: 3,
    name: "Amit Patil",
    title: "Community Leader",
    organization: "Sangli District",
    thumbnailUrl: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    description: "Community development testimonial",
  },
  {
    id: 4,
    name: "Dr. Sunita Desai",
    title: "Pediatrician",
    organization: "Miraj Medical College",
    thumbnailUrl: "https://img.youtube.com/vi/ZXsQAXx_ao0/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/ZXsQAXx_ao0",
    description: "Medical equipment testimonial",
  },
  {
    id: 5,
    name: "Ravi Joshi",
    title: "NGO Director",
    organization: "Health Care Foundation",
    thumbnailUrl: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk",
    description: "COVID support testimonial",
  },
  {
    id: 6,
    name: "Meera Kulkarni",
    title: "Teacher",
    organization: "Rural Education Center",
    thumbnailUrl: "https://img.youtube.com/vi/LdOM0x0XDMo/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/LdOM0x0XDMo",
    description: "Educational infrastructure testimonial",
  },
];

// Utility functions for different social media platforms
const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "youtube":
      return "📺";
    case "youtube-shorts":
      return "🩳";
    case "instagram-reel":
      return "📱";
    case "instagram-video":
      return "📹";
    case "facebook":
      return "👥";
    case "twitter":
      return "🐦";
    case "linkedin":
      return "💼";
    case "tiktok":
      return "🎵";
    default:
      return "📺";
  }
};

const getEmbedUrl = (url: string, platform: string) => {
  if (!url) return "";

  switch (platform) {
    case "youtube":
    case "youtube-shorts":
      // Convert various YouTube URL formats to embed
      const youtubeMatch = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/
      );
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }
      return url.includes("embed") ? url : "";

    case "instagram-reel":
    case "instagram-video":
      // Instagram embeds need special handling
      const instagramMatch = url.match(
        /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/
      );
      if (instagramMatch) {
        return `https://www.instagram.com/p/${instagramMatch[1]}/embed/`;
      }
      return url;

    case "facebook":
      // Facebook video embeds
      if (url.includes("facebook.com")) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          url
        )}`;
      }
      return url;

    case "twitter":
      // Twitter embeds need special handling
      return url;

    case "linkedin":
      // LinkedIn embeds
      return url;

    case "tiktok":
      // TikTok embeds
      return url;

    default:
      return url;
  }
};

const getThumbnailUrl = (
  url: string,
  platform: string,
  customThumbnail?: string
) => {
  if (customThumbnail) return customThumbnail;

  switch (platform) {
    case "youtube":
    case "youtube-shorts":
      const youtubeMatch = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/
      );
      if (youtubeMatch) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
      }
      break;

    case "instagram-reel":
    case "instagram-video":
      // Instagram thumbnails are harder to get, use placeholder
      return "/api/placeholder/300/400";

    case "facebook":
      return "/api/placeholder/300/400";

    case "twitter":
      return "/api/placeholder/300/400";

    case "linkedin":
      return "/api/placeholder/300/400";

    case "tiktok":
      return "/api/placeholder/300/400";
  }

  return "/api/placeholder/300/400";
};

// Add CSS to hide scrollbar
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export function VideoTestimonials() {
  const [selectedVideo, setSelectedVideo] = useState<Testimonial | null>(null);
  const [firebaseTestimonials, setFirebaseTestimonials] = useState<
    Testimonial[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch testimonials from Firebase with better error handling
  useEffect(() => {
    console.log("Client: Starting testimonials fetch, db:", !!db);
    console.log(
      "Client: Firebase project ID:",
      db?._delegate?._databaseId?.projectId || "unknown"
    );

    if (!db) {
      console.error("Client: Firebase db not initialized");
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      try {
        console.log(
          "Client: Setting up Firebase listener for testimonials collection"
        );

        // Test Firebase connection first
        const { getDocs } = await import("firebase/firestore");
        const testQuery = query(collection(db, "testimonials"));

        try {
          const testSnapshot = await getDocs(testQuery);
          console.log("Client: Firebase connection test successful:", {
            size: testSnapshot.size,
            empty: testSnapshot.empty,
          });
        } catch (testError: any) {
          console.error("Client: Firebase connection test failed:", testError);
          if (testError.code === "permission-denied") {
            console.error("Client: Permission denied - check Firestore rules");
            setLoading(false);
            return;
          }
        }

        // Set up real-time listener
        const q = query(collection(db, "testimonials"));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log("Client: Real-time snapshot received:", {
              empty: snapshot.empty,
              size: snapshot.size,
              docs: snapshot.docs.length,
              fromCache: snapshot.metadata.fromCache,
              hasPendingWrites: snapshot.metadata.hasPendingWrites,
            });

            const fetchedTestimonials = snapshot.docs.map((doc, index) => {
              const data = doc.data();
              console.log(`Client: Processing testimonial ${index + 1}:`, {
                id: doc.id,
                videoUrl: data.videoUrl,
                thumbnailUrl: data.thumbnailUrl,
                platform: data.platform,
                hasCreatedAt: !!data.createdAt,
              });

              const platform = data.platform || "youtube";
              const videoUrl = data.videoUrl || "";
              const embedUrl = getEmbedUrl(videoUrl, platform);
              const thumbnailUrl = getThumbnailUrl(
                videoUrl,
                platform,
                data.thumbnailUrl
              );

              return {
                id: parseInt(doc.id) || index + 1000,
                name: data.title || `Community Member ${index + 1}`,
                title: "Community Member",
                organization: "T.B. Lulla Foundation",
                thumbnailUrl,
                videoUrl: embedUrl,
                description:
                  data.description || "Video testimonial from our community",
                platform,
              };
            });

            console.log(
              "Client: Successfully processed",
              fetchedTestimonials.length,
              "Firebase testimonials"
            );
            setFirebaseTestimonials(fetchedTestimonials);
            setLoading(false);
          },
          (error: any) => {
            console.error("Client: Firebase real-time listener error:", error);
            console.error("Client: Error details:", {
              code: error.code,
              message: error.message,
            });

            if (error.code === "permission-denied") {
              console.error(
                "Client: Permission denied - testimonials collection not accessible"
              );
              console.error(
                "Client: Please update Firestore rules to allow public read access to testimonials"
              );
            }

            setLoading(false);
          }
        );

        console.log("Client: Firebase real-time listener set up successfully");
      } catch (error: any) {
        console.error("Client: Error setting up Firebase listener:", error);
        console.error("Client: Setup error details:", {
          code: error.code,
          message: error.message,
        });
        setLoading(false);
      }
    };

    // Set up the listener
    setupListener();

    // Cleanup function
    return () => {
      console.log("Client: Cleaning up Firebase listener");
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Always prioritize Firebase testimonials, only use static as fallback
  const allTestimonials =
    firebaseTestimonials.length > 0 ? firebaseTestimonials : testimonials;

  const openVideo = (testimonial: Testimonial) => {
    setSelectedVideo(testimonial);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Update scroll position for button visibility
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollContainerRef.current
    ? scrollPosition <
      scrollContainerRef.current.scrollWidth -
        scrollContainerRef.current.clientWidth
    : false;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyle }} />
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Community Voices
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              What Others Say About
              <span className="block text-blue-600">
                T.B.Lulla Charitable Foundation
              </span>
            </h2>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">
                Loading testimonials...
              </span>
            </div>
          )}

          {/* Video Grid - Horizontal scrolling */}
          {!loading && (
            <div className="relative">
              {/* Navigation Buttons */}
              {allTestimonials.length > 6 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={scrollLeft}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 ${
                      canScrollLeft
                        ? "opacity-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!canScrollLeft}
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={scrollRight}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 ${
                      canScrollRight
                        ? "opacity-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!canScrollRight}
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`${
                  allTestimonials.length > 6
                    ? "overflow-x-auto px-12 scrollbar-hide"
                    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4"
                }`}
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div
                  className={`${
                    allTestimonials.length > 6
                      ? "flex gap-3 lg:gap-4 pb-4"
                      : "contents"
                  }`}
                >
                  {allTestimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                        allTestimonials.length > 6
                          ? "flex-shrink-0 w-48 sm:w-56 lg:w-64"
                          : ""
                      }`}
                    >
                      {/* Video Thumbnail - 9:16 aspect ratio */}
                      <div className="relative aspect-[9/16] overflow-hidden bg-gray-100">
                        <img
                          src={testimonial.thumbnailUrl}
                          alt={`${testimonial.name} testimonial`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => openVideo(testimonial)}
                            className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:bg-white"
                          >
                            <Play
                              className="w-5 h-5 text-blue-600 ml-0.5"
                              fill="currentColor"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicator Dots (optional) */}
              {allTestimonials.length > 6 && (
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from({
                    length: Math.ceil(allTestimonials.length / 6),
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-gray-300 transition-colors duration-300"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden">
              {/* Close Button */}
              <button
                onClick={closeVideo}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Video Content */}
              {(selectedVideo.platform === "youtube" ||
                selectedVideo.platform === "youtube-shorts" ||
                !selectedVideo.platform) && (
                <div className="aspect-video">
                  <iframe
                    src={selectedVideo.videoUrl}
                    title={`${selectedVideo.name} testimonial`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {selectedVideo.platform === "instagram-reel" ||
              selectedVideo.platform === "instagram-video" ? (
                <div className="aspect-[9/16] max-h-[80vh] mx-auto">
                  <iframe
                    src={selectedVideo.videoUrl}
                    title={`${selectedVideo.name} testimonial`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : selectedVideo.platform === "facebook" ? (
                <div className="aspect-video">
                  <iframe
                    src={selectedVideo.videoUrl}
                    title={`${selectedVideo.name} testimonial`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : selectedVideo.platform === "twitter" ||
                selectedVideo.platform === "linkedin" ||
                selectedVideo.platform === "tiktok" ? (
                <div className="p-8 text-center text-white">
                  <h3 className="text-xl font-semibold mb-4">
                    {selectedVideo.name}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {selectedVideo.description}
                  </p>
                  <a
                    href={selectedVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <span>
                      View on {selectedVideo.platform?.replace("-", " ")}
                    </span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
