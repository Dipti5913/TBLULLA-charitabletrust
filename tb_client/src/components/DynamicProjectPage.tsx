import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const gatherProjectImages = (data: Record<string, any>): string[] => {
  const collectionFields = ["images", "photos", "gallery", "imageUrls"];
  const singleFields = ["imageUrl", "photoUrl", "image", "imageURL", "photoURL"];
  const collected: string[] = [];

  collectionFields.forEach((field) => {
    const value = data?.[field];
    if (Array.isArray(value)) {
      value.forEach((img) => {
        if (typeof img === "string" && img.trim().length > 0) {
          collected.push(img.trim());
        }
      });
    }
  });

  singleFields.forEach((field) => {
    const value = data?.[field];
    if (typeof value === "string" && value.trim().length > 0) {
      collected.push(value.trim());
    }
  });

  return Array.from(new Set(collected));
};

export default function DynamicProjectPage() {
  const { category } = useParams<{ category: string }>();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpenFor, setGalleryOpenFor] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ projectIndex: number; imageIndex: number } | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  // Convert URL slug back to category name
  const getCategoryName = (slug: string) => {
    const converted = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    console.log('DynamicProjectPage: Converting slug to category:', {
      originalSlug: slug,
      convertedCategory: converted
    });
    
    return converted;
  };

  const categoryName = category ? getCategoryName(category) : '';

  useEffect(() => {
    console.log('DynamicProjectPage: useEffect triggered');
    console.log('DynamicProjectPage: category param:', category);
    console.log('DynamicProjectPage: categoryName:', categoryName);
    console.log('DynamicProjectPage: db initialized:', !!db);
    
    if (!category || !db) {
      console.error('DynamicProjectPage: Missing category or Firebase not initialized');
      setError('Invalid category or Firebase not initialized');
      setLoading(false);
      return;
    }

    console.log('DynamicProjectPage: Fetching projects for category:', categoryName);

    try {
      // First, let's fetch ALL projects to see what's in the database
      const allProjectsQuery = query(collection(db, 'projects'));
      
      const allProjectsUnsubscribe = onSnapshot(allProjectsQuery, (allSnapshot) => {
        console.log('DynamicProjectPage: ALL PROJECTS in database:', allSnapshot.docs.length);
        allSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('DynamicProjectPage: Project in DB:', {
            id: doc.id,
            title: data.title,
            category: data.category,
            isTargetCategory: data.category === categoryName
          });
        });
      });

      // Try multiple query approaches to handle case sensitivity and spaces
      console.log('DynamicProjectPage: Trying exact match for category:', categoryName);
      
      // First try exact match
      const q = query(
        collection(db, 'projects'),
        where('category', '==', categoryName)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('DynamicProjectPage: Received', snapshot.docs.length, 'projects for category:', categoryName);
          console.log('DynamicProjectPage: All documents in snapshot:', snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          })));
          
          const fetchedProjects = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('DynamicProjectPage: Processing project:', {
              id: doc.id,
              title: data.title,
              category: data.category,
              categoryMatch: data.category === categoryName,
              description: data.description?.substring(0, 50) + '...'
            });
            
            const images = gatherProjectImages(data);

            return {
              id: doc.id,
              title: data.title || 'Untitled Project',
              category: data.category || 'Uncategorized',
              description: data.description || 'No description available',
              createdAt: data.createdAt,
              images,
              imageUrl: images.length > 0 ? images[0] : null,
            };
          });

          // Sort projects with "Vastradan" first, then alphabetically by title
          const sortedProjects = fetchedProjects.sort((a, b) => {
            // If one project is "Vastradan", it comes first
            if (a.title.toLowerCase().includes('vastradan')) return -1;
            if (b.title.toLowerCase().includes('vastradan')) return 1;
            
            // Otherwise sort alphabetically by title
            return (a.title || '').localeCompare(b.title || '');
          });

          setProjects(sortedProjects);
          setLoading(false);
          setError(null);
          
          // If no projects found with exact match, try client-side filtering of all projects
          if (sortedProjects.length === 0) {
            console.log('DynamicProjectPage: No exact matches found, trying client-side filtering...');
            
            const allProjectsForFiltering = query(collection(db, 'projects'));
            onSnapshot(allProjectsForFiltering, (allSnapshot) => {
              const allProjects = allSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              console.log('DynamicProjectPage: All projects for client filtering:', allProjects);
              
              // Try different matching strategies
              const matches = allProjects.filter(project => {
                const projectCategory = project.category || '';
                return (
                  projectCategory === categoryName || // Exact match
                  projectCategory.toLowerCase() === categoryName.toLowerCase() || // Case insensitive
                  projectCategory.trim() === categoryName.trim() || // Trim spaces
                  projectCategory.toLowerCase().trim() === categoryName.toLowerCase().trim() // Both
                );
              });
              
              console.log('DynamicProjectPage: Client-side filtered matches:', matches);
              
              if (matches.length > 0) {
                const clientFilteredProjects = matches.map(project => {
                  const images = gatherProjectImages(project as Record<string, any>);

                  return {
                    id: project.id,
                    title: project.title || 'Untitled Project',
                    category: project.category || 'Uncategorized',
                    description: project.description || 'No description available',
                    createdAt: (project as any).createdAt,
                    images,
                    imageUrl: images.length > 0 ? images[0] : null,
                  };
                });
                
                const clientSorted = clientFilteredProjects.sort((a, b) => {
                  // If one project is "Vastradan", it comes first
                  if (a.title.toLowerCase().includes('vastradan')) return -1;
                  if (b.title.toLowerCase().includes('vastradan')) return 1;
                  
                  // Otherwise sort alphabetically by title
                  return (a.title || '').localeCompare(b.title || '');
                });
                
                setProjects(clientSorted);
              }
            });
          }
        },
        (err) => {
          console.error('DynamicProjectPage: Error fetching projects:', err);
          setError(`Failed to load projects: ${err.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('DynamicProjectPage: Error setting up listener:', err);
      setError(`Failed to initialize: ${err.message}`);
      setLoading(false);
    }
  }, [category, categoryName]);

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
        const project = projects[lightbox.projectIndex];
        const images: string[] = project?.images && project.images.length > 0 ? project.images : [];
        if (images.length > 0) {
          if (e.key === 'ArrowLeft') {
            const prevIndex = (lightbox.imageIndex - 1 + images.length) % images.length;
            setLightbox({ projectIndex: lightbox.projectIndex, imageIndex: prevIndex });
          } else if (e.key === 'ArrowRight') {
            const nextIndex = (lightbox.imageIndex + 1) % images.length;
            setLightbox({ projectIndex: lightbox.projectIndex, imageIndex: nextIndex });
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
  }, [galleryOpenFor, lightbox, projects]);

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
              Project Category
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {categoryName}
              <span className="block text-blue-600">Projects</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our impactful projects in {categoryName.toLowerCase()}, 
              making a real difference in communities and lives.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-4 text-lg text-gray-600">Loading {categoryName.toLowerCase()} projects...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Error Loading Projects</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && projects.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Card key={project.id} className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl">
                  {/* Card Border Glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
                  
                  {/* Top accent border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 pointer-events-none" />


                  <CardHeader className="pb-4 pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {project.category}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                      {project.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <div className="text-gray-700 leading-relaxed">
                      <p>
                        {expandedDescriptions.has(project.id) 
                          ? project.description
                          : project.description.length > 150 
                            ? `${project.description.slice(0, 150)}...` 
                            : project.description
                        }
                      </p>
                      {project.description.length > 150 && (
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedDescriptions);
                            if (expandedDescriptions.has(project.id)) {
                              newExpanded.delete(project.id);
                            } else {
                              newExpanded.add(project.id);
                            }
                            setExpandedDescriptions(newExpanded);
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                        >
                          {expandedDescriptions.has(project.id) ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      {project.images && project.images.length > 0 ? (
                        <button
                          aria-label="View photo gallery"
                          className="relative group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGalleryOpenFor(index);
                          }}
                        >
                          <img
                            src={project.images[0]}
                            alt={project.title || 'Project photo'}
                            loading="lazy"
                            className="w-24 h-16 object-cover rounded-md border border-gray-200 shadow-sm"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute inset-0 rounded-md bg-black/40 text-white text-xs font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            View Gallery
                          </span>
                        </button>
                      ) : (
                        <div className="w-24 h-16 bg-gray-100 rounded-md border border-dashed border-gray-200 flex items-center justify-center">
                          <span className="text-[11px] text-gray-500 text-center px-2">No photos yet</span>
                        </div>
                      )}

                      {project.description.length > 200 && (
                        <button
                          onClick={() => openProjectModal(project)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 group/btn"
                        >
                          <span>Read More</span>
                          <svg 
                            className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Project Date */}
                    {project.createdAt && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Added: {new Date(project.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">No Projects Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                No projects have been added to the {categoryName} category yet. 
                Check back soon for updates on our latest projects.
              </p>
            </div>
          )}

          {/* Gallery Modal (shows all images for selected project) */}
          {galleryOpenFor !== null && (() => {
            const project = projects[galleryOpenFor];
            const images: string[] = project?.images && project.images.length > 0 ? project.images : [];
            return (
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
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
                    onClick={() => setGalleryOpenFor(null)}
                  >
                    Close
                  </button>
                  <div className="p-6">
                    <h3 id="gallery-modal-title" className="text-xl font-bold mb-4">{project?.title || 'Project Photos'}</h3>
                    {images.length === 0 ? (
                      <p className="text-gray-600">No photos available.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={project?.title || 'Project photo'}
                            loading="lazy"
                            className="w-full h-32 object-cover rounded-md border border-gray-200 hover:opacity-90 transition cursor-pointer"
                            onClick={() => setLightbox({ projectIndex: galleryOpenFor as number, imageIndex: i })}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Lightbox Modal for individual image */}
          {lightbox && (() => {
            const project = projects[lightbox.projectIndex];
            const images: string[] = project?.images && project.images.length > 0 ? project.images : [];
            if (images.length === 0) {
              return null;
            }
            const src = images[lightbox.imageIndex];
            const prevIndex = (lightbox.imageIndex - 1 + images.length) % images.length;
            const nextIndex = (lightbox.imageIndex + 1) % images.length;
            return (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Image viewer"
                className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"
                onClick={() => setLightbox(null)}
              >
                <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
                  {src && (
                    <img
                      src={src}
                      alt={project?.title || 'Project photo'}
                      className="w-full max-h-[80vh] object-contain rounded-md shadow-xl"
                      onError={() => setLightbox(null)}
                    />
                  )}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() => setLightbox({ projectIndex: lightbox.projectIndex, imageIndex: prevIndex })}
                        className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 shadow"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => setLightbox({ projectIndex: lightbox.projectIndex, imageIndex: nextIndex })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 shadow"
                      >
                        ›
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setLightbox(null)}
                    className="absolute top-2 right-2 px-3 py-1.5 rounded-md bg-black/50 hover:bg-black/70 text-white border border-white/20 shadow"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </section>
    </Layout>
  );
}
