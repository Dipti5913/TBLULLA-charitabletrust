import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectModal from "@/components/ui/ProjectModal";

// No more demo images - using Firebase images only

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string | null;
  images?: string[];
  createdAt: any;
}

interface ProjectPageProps {
  category: string;
  pageTitle: string;
  pageDescription?: string;
}

export default function ProjectPage({ category, pageTitle, pageDescription }: ProjectPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryOpenFor, setGalleryOpenFor] = useState<number | null>(null);
  // Removed lightbox functionality - using simple image display

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  useEffect(() => {
    if (!db) {
      setError("Firebase not connected. Please check configuration.");
      setLoading(false);
      return;
    }

    // Query all projects (filter by category on client side to avoid index requirement)
    const q = query(collection(db, "projects"));
    
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log('CLIENT PROJECTS: Received snapshot with', snapshot.docs.length, 'documents');
        
        const projectsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log(`CLIENT PROJECTS: Project ${doc.id}:`, {
            title: data.title,
            category: data.category,
            imageUrl: data.imageUrl,
            images: data.images,
            imagesLength: data.images?.length || 0
          });
          
          return {
            id: doc.id,
            ...data,
          };
        }) as Project[];
        
        // Filter by category
        const filteredProjects = projectsData.filter(project => project.category === category);
        console.log(`CLIENT PROJECTS: Filtered ${filteredProjects.length} projects for category "${category}"`);
        
        // Sort by createdAt on client side to avoid index requirement
        const sortedProjects = filteredProjects.sort((a, b) => {
          // Handle cases where createdAt might be null or undefined
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1; // Put items without timestamp at the end
          if (!b.createdAt) return -1; // Put items without timestamp at the end
          
          try {
            return b.createdAt.toMillis() - a.createdAt.toMillis(); // Newest first
          } catch (error) {
            console.warn('Error sorting projects by timestamp:', error);
            return 0;
          }
        });
        
        console.log('CLIENT PROJECTS: Final sorted projects:', sortedProjects.length);
        setProjects(sortedProjects);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [category]);

  // Keyboard navigation and scroll lock for modals
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
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-primary to-accent rounded-sm" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-gray-900 to-accent bg-clip-text text-transparent mb-6 leading-tight">
              {pageTitle}
            </h1>
            
            {pageDescription && (
              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  {pageDescription}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto" />
              </div>
            )}
            
            {/* Stats indicator */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live Updates</span>
              </div>
              <div className="w-1 h-4 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>{projects.length} Projects</span>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Projects</h3>
              <p className="text-muted-foreground">Fetching the latest {category.toLowerCase()} projects...</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Projects</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-6">
                <div className="w-8 h-8 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                It looks like there are no {category.toLowerCase()} projects to display yet. 
                New projects will appear here once they're added through the admin panel.
              </p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Card 
                  key={project.id} 
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm"
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Card number indicator */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>


                  <CardHeader className="relative pb-3">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors duration-200">
                          {project.title}
                        </CardTitle>
                      </div>
                    </div>
                    
                    {/* Category badge with enhanced styling */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20">
                        {project.category}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="relative pt-0">
                    {/* Description with better typography */}
                    <div className="relative">
                      <p 
                        className="text-sm leading-relaxed text-gray-700 whitespace-pre-line group-hover:text-gray-900 transition-all duration-300"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {project.description}
                      </p>
                      
                      {/* Read more gradient overlay for long text */}
                      {project.description.length > 200 && (
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* Image Gallery Section */}
                    <div className="mt-4">
                      {/* Multiple Images Display */}
                      {project.images && project.images.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                              {project.images.length} Photo{project.images.length > 1 ? 's' : ''}
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
                            {project.images.slice(0, 4).map((imageUrl, imgIndex) => (
                              <button
                                key={imgIndex}
                                className="relative group aspect-square"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGalleryOpenFor(index);
                                }}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`${project.title} photo ${imgIndex + 1}`}
                                  loading="lazy"
                                  className="w-full h-full object-cover rounded border border-gray-200 shadow-sm"
                                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                    console.log('Failed to load project image:', imageUrl);
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                {imgIndex === 3 && project.images!.length > 4 && (
                                  <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      +{project.images!.length - 4}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : project.imageUrl ? (
                        <button
                          className="relative group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGalleryOpenFor(index);
                          }}
                        >
                          <img
                            src={project.imageUrl}
                            alt={project.title || 'Project photo'}
                            loading="lazy"
                            className="w-24 h-16 object-cover rounded-md border border-gray-200 shadow-sm"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              console.log('Failed to load project image:', project.imageUrl);
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute inset-0 rounded-md bg-black/40 text-white text-xs font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            View Image
                          </span>
                        </button>
                      ) : (
                        <div className="w-24 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Read More Button */}
                      <div className="flex justify-end mt-2">{project.description.length > 200 && (
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

                    </div>

                  </CardContent>

                  {/* Hover effect border */}
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Gallery Modal (shows all images for selected project) */}
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
              className="absolute top-3 right-3 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
              onClick={() => setGalleryOpenFor(null)}
            >
              Close
            </button>
            <div className="p-6">
              <h3 id="gallery-modal-title" className="text-xl font-bold mb-4">
                {projects[galleryOpenFor]?.title || 'Project Photos'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Display multiple images if available */}
                {projects[galleryOpenFor]?.images && projects[galleryOpenFor]?.images!.length > 0 ? (
                  projects[galleryOpenFor]?.images!.map((imageUrl, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`${projects[galleryOpenFor]?.title || 'Project'} photo ${imgIndex + 1}`}
                        loading="lazy"
                        className="w-full h-64 object-cover rounded-md border border-gray-200 shadow-sm"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          console.log('Failed to load project image:', imageUrl);
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {imgIndex + 1} / {projects[galleryOpenFor]?.images!.length}
                      </div>
                    </div>
                  ))
                ) : projects[galleryOpenFor]?.imageUrl ? (
                  <div className="md:col-span-2 lg:col-span-3">
                    <img
                      src={projects[galleryOpenFor].imageUrl}
                      alt={projects[galleryOpenFor]?.title || 'Project photo'}
                      loading="lazy"
                      className="w-full max-h-96 object-contain rounded-md border border-gray-200 mx-auto"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="md:col-span-2 lg:col-span-3 w-full h-48 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">No images available</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image count info */}
              {projects[galleryOpenFor]?.images && projects[galleryOpenFor]?.images!.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing {projects[galleryOpenFor]?.images!.length} image{projects[galleryOpenFor]?.images!.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {/* Project Modal */}
      <ProjectModal 
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeProjectModal}
      />
    </Layout>
  );
}
