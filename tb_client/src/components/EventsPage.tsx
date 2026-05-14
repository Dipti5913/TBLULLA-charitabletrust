import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";

interface Event {
  id: string;
  year: number;
  title: string;
  description: string;
  images?: string[];
  createdAt: any;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [galleryOpenFor, setGalleryOpenFor] = useState<number | null>(null);

  useEffect(() => {
    if (!db) {
      setError("Firebase not connected. Please check configuration.");
      setLoading(false);
      return;
    }

    console.log('CLIENT EVENTS: Setting up Firebase listener...');

    const q = query(collection(db, "events"), orderBy("year", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log('CLIENT EVENTS: Received snapshot with', snapshot.docs.length, 'documents');

        const eventsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log(`CLIENT EVENTS: Event ${doc.id}:`, {
            title: data.title,
            year: data.year,
            images: data.images,
            imagesLength: data.images?.length || 0
          });

          return {
            id: doc.id,
            ...data,
          };
        }) as Event[];

        console.log('CLIENT EVENTS: Final events:', eventsData.length);
        setEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error("CLIENT EVENTS: Error fetching events:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Keyboard navigation for modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (galleryOpenFor !== null) {
          setGalleryOpenFor(null);
        }
      }
    };
    if (galleryOpenFor !== null) {
      document.addEventListener('keydown', onKeyDown as any);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown as any);
      document.body.style.overflow = '';
    };
  }, [galleryOpenFor]);

  return (
    <Layout>
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 space-y-12 relative">
          <div className="text-center mb-12">
            {/* Enhanced header with icon and decorative elements */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-gray-900 to-accent bg-clip-text text-transparent mb-6 leading-tight">
              Our Events
            </h1>

            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Discover the impactful events and initiatives organized by T.B. Lulla Charitable Foundation
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto" />
            </div>

            {/* Stats indicator */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live Updates</span>
              </div>
              <div className="w-1 h-4 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>{events.length} Events</span>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Events</h3>
              <p className="text-muted-foreground">Fetching the latest events...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-6">
                <div className="w-8 h-8 text-red-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Events</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-6">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                It looks like there are no events to display yet.
                New events will appear here once they're added through the admin panel.
              </p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, index) => (
                <Card
                  key={event.id}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm"
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Year badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {event.year}
                    </Badge>
                  </div>

                  <CardHeader className="relative pb-3">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-200">
                          {event.title}
                        </CardTitle>
                      </div>
                    </div>

                    {/* Event meta info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{event.year}</span>
                      </div>
                      {event.images && event.images.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{event.images.length} Photo{event.images.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="relative pt-0">
                    {/* Description */}
                    <div className="relative mb-4">
                      <p
                        className="text-sm leading-relaxed text-gray-700 whitespace-pre-line group-hover:text-gray-900 transition-all duration-300"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {event.description}
                      </p>
                    </div>

                    {/* Images Gallery Section */}
                    {event.images && event.images.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">
                            {event.images.length} Photo{event.images.length > 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryOpenFor(index);
                            }}
                            className="text-xs text-primary hover:text-primary/80 font-medium"
                          >
                            View All
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {event.images.slice(0, 4).map((imageUrl, imgIndex) => (
                            <button
                              key={imgIndex}
                              className="relative group/img aspect-square"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGalleryOpenFor(index);
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt={`${event.title} photo ${imgIndex + 1}`}
                                loading="lazy"
                                className="w-full h-full object-cover rounded border border-gray-200 shadow-sm"
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                  console.log('Failed to load event image:', imageUrl);
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              {imgIndex === 3 && event.images!.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    +{event.images!.length - 4}
                                  </span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity rounded" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  {/* Hover effect border */}
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Modal */}
      {galleryOpenFor !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-modal-title"
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setGalleryOpenFor(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close gallery"
              className="absolute top-3 right-3 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 z-10"
              onClick={() => setGalleryOpenFor(null)}
            >
              Close
            </button>
            <div className="p-6">
              <h3 id="gallery-modal-title" className="text-xl font-bold mb-4">
                {events[galleryOpenFor]?.title || 'Event Photos'} ({events[galleryOpenFor]?.year})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events[galleryOpenFor]?.images && events[galleryOpenFor]?.images!.length > 0 ? (
                  events[galleryOpenFor]?.images!.map((imageUrl, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`${events[galleryOpenFor]?.title || 'Event'} photo ${imgIndex + 1}`}
                        loading="lazy"
                        className="w-full h-64 object-cover rounded-md border border-gray-200 shadow-sm"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          console.log('Failed to load event image:', imageUrl);
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {imgIndex + 1} / {events[galleryOpenFor]?.images!.length}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 lg:col-span-3 w-full h-48 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image count info */}
              {events[galleryOpenFor]?.images && events[galleryOpenFor]?.images!.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing {events[galleryOpenFor]?.images!.length} image{events[galleryOpenFor]?.images!.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}