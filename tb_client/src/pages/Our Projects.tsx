import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageGallery } from "@/components/ui/ImageGallery";

// Add CSS to prevent any underlines on project elements
const projectStyles = `
  [data-project-link] * {
    text-decoration: none !important;
    border-bottom: none !important;
  }
  [data-project-link]:hover * {
    text-decoration: none !important;
    border-bottom: none !important;
  }
`;

export default function Projects() {
  const [firebaseProjects, setFirebaseProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Static project categories (fallback)
  const staticCategories = [
    { label: "Shiku Anande", to: "/projects/shiku-anande" },
    { label: "Literacy", to: "/projects/literacy" },
    { label: "Natural Calamities", to: "/projects/natural-calamities" },
  ];

  // Generate dynamic categories from Firebase projects
  const [allCategories, setAllCategories] = useState<any[]>(
    staticCategories.map(sc => ({ ...sc, isFromFirebase: false, projectCount: 0 }))
  );

  useEffect(() => {
    const categories = new Set<string>();
    
    // Add categories from Firebase projects
    firebaseProjects.forEach(project => {
      if (project.category && project.category.trim()) {
        categories.add(project.category);
      }
    });

    console.log('Our Projects: Found Firebase categories:', Array.from(categories));

    // Convert to category objects with proper routing
    const dynamicCategories = Array.from(categories).map(category => ({
      label: category,
      to: `/projects/${category.toLowerCase().replace(/\s+/g, '-')}`,
      isFromFirebase: true,
      projectCount: firebaseProjects.filter(p => p.category === category).length
    }));

    // Merge with static categories (avoid duplicates)
    const staticCategoryNames = staticCategories.map(c => c.label);
    const uniqueDynamicCategories = dynamicCategories.filter(
      dc => !staticCategoryNames.includes(dc.label)
    );

    const combinedCategories = [
      ...staticCategories.map(sc => ({ ...sc, isFromFirebase: false, projectCount: 0 })), 
      ...uniqueDynamicCategories
    ];

    console.log('Our Projects: Final categories:', combinedCategories);
    setAllCategories(combinedCategories);
  }, [firebaseProjects]);

  // Fetch projects from Firebase admin panel
  useEffect(() => {
    console.log('Projects: Starting to fetch projects, db:', !!db);
    console.log('Projects: Firebase db object:', db);
    console.log('Projects: Firebase db type:', typeof db);
    
    if (!db) {
      console.error('Projects: Firebase Firestore not initialized');
      setError('Firebase connection failed - Firestore not initialized');
      setLoading(false);
      return;
    }

    try {
      console.log('Projects: Setting up Firestore listener for projects collection');
      const q = query(collection(db, 'projects'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('Projects: Received snapshot with', snapshot.docs.length, 'projects');
          
          const fetchedProjects = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('Projects: Processing project:', doc.id, data);
            
            // Handle multiple images
            let images = [];
            let primaryImage = null;
            
            // Handle multiple images array
            if (data.images && Array.isArray(data.images)) {
              images = data.images.filter(img => 
                img && typeof img === 'string' && img.trim().length > 0 && img.startsWith('http')
              );
            }
            
            // Handle single image fields as fallback
            if (images.length === 0) {
              if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim() && data.imageUrl.startsWith('http')) {
                images = [data.imageUrl.trim()];
              } else if (data.image && typeof data.image === 'string' && data.image.trim() && data.image.startsWith('http')) {
                images = [data.image.trim()];
              }
            }
            
            // Set primary image for backward compatibility
            primaryImage = images.length > 0 ? images[0] : null;
            
            console.log(`Projects: Processing project "${data.title}":`, {
              id: doc.id,
              hasValidImages: images.length > 0,
              imagesCount: images.length,
              primaryImage: primaryImage,
              allImages: images
            });
            
            return {
              id: `firebase-${doc.id}`,
              title: data.title || 'Untitled Project',
              category: data.category || 'Uncategorized',
              description: data.description || 'No description available',
              image: primaryImage, // Keep for backward compatibility
              images: images, // New multiple images array
              isFromFirebase: true,
              createdAt: data.createdAt,
            };
          });
          
          // Sort by createdAt on client side (newest first)
          const sortedProjects = fetchedProjects.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.seconds - a.createdAt.seconds;
          });
          
          setFirebaseProjects(sortedProjects);
          setLoading(false);
          setError(null);
          console.log('Projects: Successfully loaded', fetchedProjects.length, 'projects from Firebase');
        },
        (err) => {
          console.error('Projects: Error fetching projects:', err);
          console.error('Projects: Error code:', err.code);
          console.error('Projects: Error message:', err.message);
          console.error('Projects: Full error object:', JSON.stringify(err, null, 2));
          
          let errorMessage = 'Failed to load projects';
          if (err.code === 'permission-denied') {
            errorMessage = 'Permission denied - Please check Firestore security rules for projects collection';
          } else if (err.code) {
            errorMessage = `${err.code}: ${err.message || ''}`;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
          setLoading(false);
        }
      );

      return () => {
        console.log('Projects: Cleaning up Firestore listener');
        unsubscribe();
      };
    } catch (err: any) {
      console.error('Projects: Error setting up listener:', err);
      setError(`Failed to initialize: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, []);

  // Group Firebase projects by category
  const groupedFirebaseProjects = firebaseProjects.reduce((acc, project) => {
    const category = project.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(project);
    return acc;
  }, {} as Record<string, any[]>);

  // Test function to create a sample project
  const createTestProject = async () => {
    if (!db) {
      console.error('Cannot create test project - Firebase not initialized');
      return;
    }
    
    try {
      console.log('Creating test project...');
      const testProject = {
        title: 'Test Project from Client',
        category: 'General',
        description: 'This is a test project created from the client side to verify Firebase connection.',
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'projects'), testProject);
      console.log('Test project created with ID:', docRef.id);
    } catch (error) {
      console.error('Error creating test project:', error);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: projectStyles }} />
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
              Our Projects
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Our Projects
              <span className="block text-blue-600">& Impact Areas</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of social projects, community development programs, 
              and transformative efforts making a real difference in people's lives.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>
          {/* Project Categories */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Categories</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our diverse range of projects across different focus areas
              </p>
            </div>
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>Firebase Projects: {firebaseProjects.length}</p>
                <p>All Categories: {allCategories.length}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Error: {error || 'None'}</p>
                <p>Categories: {allCategories.map(c => c.label).join(', ')}</p>
                <p>Firebase DB: {db ? 'Connected' : 'Not Connected'}</p>
                <button
                  onClick={createTestProject}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Create Test Project
                </button>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allCategories.map((category, index) => (
                <Link
                  key={category.to}
                  to={category.to}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 no-underline"
                  style={{ textDecoration: 'none' }}
                  data-project-link
                >
                  {/* Card Border Glow */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    category.isFromFirebase 
                      ? 'bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10'
                      : 'bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10'
                  }`}></div>
                  
                  {/* Top accent border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    category.isFromFirebase 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`} />
                  
                  <div className="p-8">
                    <div className="flex items-center justify-end mb-4">
                      <div className="flex items-center gap-2">
                        {category.isFromFirebase && category.projectCount > 0 && (
                          <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            {category.projectCount} projects
                          </span>
                        )}
                        <svg className={`w-6 h-6 text-gray-400 transition-colors duration-300 ${
                          category.isFromFirebase ? 'group-hover:text-emerald-500' : 'group-hover:text-blue-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-xl font-bold text-gray-900 transition-colors duration-300 ${
                        category.isFromFirebase ? 'group-hover:text-emerald-600' : 'group-hover:text-blue-600'
                      }`}
                      style={{ textDecoration: 'none', borderBottom: 'none' }}
                      >
                        {category.label}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Explore our projects in {category.label.toLowerCase()} and see the impact we're making.
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-4 text-lg text-gray-600">Loading latest projects...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Connection Issue</h3>
              <p className="text-yellow-600">{error}</p>
              <p className="text-gray-500 text-sm mt-2">Showing existing categories only</p>
            </div>
          )}

          {/* Firebase Projects Section */}
          {!loading && firebaseProjects.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Projects</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover our newest projects and ongoing work making a difference
                </p>
              </div>
              
              {Object.entries(groupedFirebaseProjects).map(([category, projects]) => (
                <div key={category} className="mb-12">
                  <div className="flex items-center gap-3 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">{category}</h3>
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                      {(projects as any[]).length} project{(projects as any[]).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {(projects as any[]).map((project) => (
                      <Card key={project.id} className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl ring-2 ring-emerald-200">
                        {/* Card Border Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        {/* Top accent border */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />

                        <CardHeader className="pb-4 pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              {project.category}
                            </div>
                            {project.images && project.images.length > 1 && (
                              <div className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                {project.images.length} photos
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                            {project.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="pb-6">
                          {/* Display project images */}
                          {project.images && project.images.length > 0 && (
                            <div className="mb-4">
                              <ImageGallery
                                images={project.images}
                                title={project.title}
                                className=""
                                showThumbnails={project.images.length > 1}
                                maxThumbnails={3}
                              />
                            </div>
                          )}
                          
                          <p className="text-gray-700 leading-relaxed">
                            {project.description.length > 150 
                              ? `${project.description.slice(0, 150)}...` 
                              : project.description
                            }
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State for Firebase projects only */}
          {!loading && !error && firebaseProjects.length === 0 && (
            <div className="text-center py-12 mt-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects Loading</h3>
              <p className="text-gray-600">
                No additional projects from admin panel yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
    </>
  );
}
