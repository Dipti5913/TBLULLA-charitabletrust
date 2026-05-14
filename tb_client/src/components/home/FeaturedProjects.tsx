import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

const projects = [
  {
    id: 1,
    title: "T.B.LULLA CHARITABLE FOUNDATION",
    imageUrl: "/TBLulla.jpg", // T.B. Lulla portrait image
    description:
      "Shri. Totaram Bhojraj Lulla, a renowned name in the field of taxation, migrated in 1947 to India along with his father, mother, brothers & sisters after leaving behind well earned money & well settled property. His family was staying at Shikarpur in Sindh Prant. He was one of the lakhs of Sindhi people who fortunately could save their lives in spite of slaying in the train from Sindh to Gujrat. Autobiography Of T. B. Lulla Sindhu Te Krishna Born on 12th Oct 1935, he completed his post graduation of Law degree from Govt Law College, Mumbai. For his fees & expenses, he sold toffees in local trains of Mumbai. As a Sales Tax inspector from Mumbai he was transferred to Kolhapur & then to Sangli, where he started practice in taxation in the year 1958, after resigning from the Sales Tax Department.\n\nDue to his calm, quiet & non greedy nature, he became \"DADDY\", not only of his two sons but also of entire community. A book \"Sindhu te Krishna\" was published when he was 71, to present before the Maharashtrian Community about the struggle faced by entire Sindhi's at the time of partition. He passed away on 28th Sept 2010 leaving behind his wife, two sons, grandson & grand daughter. The achievements in his life are commendable.",
  },
];

export function FeaturedProjects() {
  const [expandedProjects, setExpandedProjects] = useState<{[key: number]: boolean}>({});

  const toggleExpanded = (projectId: number) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  return (
    <section className="relative py-12 sm:py-16 lg:py-32 bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Foundation Story
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            About T. B. Lulla
            <span className="block text-blue-600">Charitable Foundation</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Discover the inspiring journey of a foundation built on compassion, 
            dedication, and an unwavering commitment to social transformation.
          </p>
          <div className="flex justify-center mt-8">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {projects.map((project, index) => (
            <Card key={project.id} className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl">
              {/* Card Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative flex flex-col lg:flex-row gap-0">
                {/* Image Section - Fixed Size */}
                <div className="lg:w-1/2 relative overflow-hidden flex-shrink-0">
                  <div className="aspect-[4/3] lg:aspect-auto lg:h-[500px] relative">
                    <img
                      src={project.imageUrl || "/TBLulla.jpg"}
                      alt="Shri T.B. Lulla - Founder of T.B. Lulla Charitable Foundation (1935-2010)"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to TBLulla.jpg if project image fails
                        if (e.currentTarget.src !== window.location.origin + "/TBLulla.jpg") {
                          console.log('Project image failed, trying TBLulla.jpg');
                          e.currentTarget.src = "/TBLulla.jpg";
                          return;
                        }
                        
                        // Final fallback to gradient background
                        console.log('T.B. Lulla portrait image failed to load');
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        
                        // Add a memorial text overlay
                        const overlay = document.createElement('div');
                        overlay.className = 'absolute inset-0 flex items-center justify-center text-white text-center p-8';
                        overlay.innerHTML = `
                          <div>
                            <h3 class="text-2xl font-bold mb-2">के. टी.बी. लुल्ला</h3>
                            <p class="text-lg">12/10/1935 - 28/09/2010</p>
                            <p class="text-sm mt-2">Founder & Visionary</p>
                          </div>
                        `;
                        e.currentTarget.parentElement.appendChild(overlay);
                      }}
                      onLoad={() => {
                        console.log('T.B. Lulla portrait loaded successfully');
                      }}
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:w-1/2 flex flex-col justify-center p-6 sm:p-8 lg:p-16 lg:min-h-[500px]">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-semibold rounded-full">
                        Our Legacy
                      </span>
                    </div>
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                        {project.title.split(' ').map((word, i) => (
                          <span key={i} className={i === 2 ? 'text-blue-600' : ''}>
                            {word}{' '}
                          </span>
                        ))}
                      </h3>
                      <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    </div>
                    
                    {/* Description */}
                    <div className="prose prose-xl text-gray-700 leading-relaxed max-w-none">
                      {expandedProjects[project.id] ? (
                        project.description.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="text-base sm:text-lg lg:text-xl leading-relaxed mb-4">
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="text-base sm:text-lg lg:text-xl leading-relaxed">
                          {`${project.description.substring(0, 300)}...`}
                        </p>
                      )}
                      {project.description.length > 300 && (
                        <button
                          onClick={() => toggleExpanded(project.id)}
                          className="mt-4 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm sm:text-base rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          {expandedProjects[project.id] ? 'Read Less' : 'Read More'}
                          <svg 
                            className={`ml-2 w-4 h-4 transition-transform duration-300 ${expandedProjects[project.id] ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Key Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Established Legacy</h4>
                          <p className="text-gray-600 text-xs sm:text-sm">Founded in 1947 with unwavering commitment</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Community Impact</h4>
                          <p className="text-gray-600 text-xs sm:text-sm">Transforming lives through dedicated service</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
