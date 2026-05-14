import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface MissionProps {
  title: string;
  description: string;
}

// ✅ Our Mission Section
const OurMission: FC<MissionProps> = ({ title, description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Truncate description to first 300 characters for preview
  const previewText = description.substring(0, 300);
  const shouldShowReadMore = description.length > 300;

  return (
    <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Our Purpose
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
          </h2>
          <div className="flex justify-center mb-8">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>

        {/* Mission Content Card */}
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-8 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-700 group">
            {/* Card Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative">
              <div className="text-lg lg:text-xl text-gray-700 leading-relaxed text-justify">
                {isExpanded ? (
                  <p>{description}</p>
                ) : (
                  <p>
                    {previewText}
                    {shouldShowReadMore && (
                      <span className="text-gray-500">...</span>
                    )}
                  </p>
                )}
              </div>
              
              {/* Read More Button */}
              {shouldShowReadMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300 space-x-2"
                  >
                    <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export function UpcomingEvents() {
  const missionData = {
    title: "Our Mission",
    description: `After achieving success in the field of taxation since 1980 & also in the field of Land Development since 1995, Adv. Kishor Lulla decided to diversify his activities towards social & charitable purposes in the year 2010 immediately after sad demise of his father on 28-Sept-2010. In other words, he realized where to stop earning & come out of day to day engagement in business & profession at the age of fifty. His vision is to support the Genuine Non Government Social Organizations not only by monetary help but by providing them knowledge of running the organizations successfully in every aspect. The ultimate aim was to form a “Federation of NGO’s” which should create a pressure group over the ill elements of the society. From 2014 onwards the Foundation has decided to work in the field of primary & secondary education instead of working specially for NGOs. To make the education happy & practical in primary & secondary school children. Also to increase the quality of government schools in every aspect, specially by Teacher’s Training.`,
  };

  return (
    <>
      {/* Our Mission Section */}
      <OurMission
        title={missionData.title}
        description={missionData.description}
      />
    </>
  );
}
