import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

// All Rotary Global Grants are now managed from the admin panel

export default function RotaryProjects() {
  const [firebaseGrants, setFirebaseGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Global Grants from Firebase
  useEffect(() => {
    console.log('RotaryGrants: Starting to fetch grants, db:', !!db);
    console.log('RotaryGrants: Firebase db object:', db);
    
    if (!db) {
      console.error('RotaryGrants: Firebase Firestore not initialized');
      setError('Firebase connection failed');
      setLoading(false);
      return;
    }

    try {
      console.log('RotaryGrants: Setting up Firestore listener for globalGrants collection');
      console.log('RotaryGrants: About to create query...');
      const q = query(collection(db, 'globalGrants'), orderBy('createdAt', 'asc'));
      
      console.log('RotaryGrants: Query created, setting up onSnapshot listener...');
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('RotaryGrants: onSnapshot callback triggered');
          console.log('RotaryGrants: Received snapshot with', snapshot.docs.length, 'grants');
          console.log('RotaryGrants: Snapshot metadata:', snapshot.metadata);
          
          if (snapshot.empty) {
            console.log('RotaryGrants: Snapshot is empty - no documents found');
          }
          
          const fetchedGrants = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            console.log(`RotaryGrants: Processing grant ${index + 1}:`, doc.id, {
              projectName: data.projectName,
              createdAt: data.createdAt,
              timestamp: data.createdAt?.seconds
            });
            
            // Convert Firebase data to match new project structure
            return {
              id: `firebase-${doc.id}`,
              title: data.projectName || 'Untitled Project',
              rotaryGlobalGrantNo: data.rotaryGlobalGrantNo || 'Not specified',
              totalProjectCost: data.totalProjectCost || 'Not specified',
              contributionByKishorLulla: data.contributionByKishorLulla || 'Not specified',
              hostClub: data.hostClub || 'Not specified',
              foreignPartner: data.foreignPartner || 'Not specified',
              isFromFirebase: true, // Flag to identify Firebase entries
              createdAt: data.createdAt,
            };
          });
          
          console.log('RotaryGrants: Final order check (ascending 1-30):', fetchedGrants.map((grant, index) => ({
            position: index + 1,
            title: grant.title,
            timestamp: grant.createdAt?.seconds,
            date: grant.createdAt?.seconds ? new Date(grant.createdAt.seconds * 1000).toLocaleDateString() : 'No date'
          })));
          
          console.log('RotaryGrants: Processed grants:', fetchedGrants);
          setFirebaseGrants(fetchedGrants);
          setLoading(false);
          setError(null);
          console.log('RotaryGrants: Successfully loaded', fetchedGrants.length, 'grants from Firebase');
        },
        (err) => {
          console.error('RotaryGrants: Error fetching grants:', err);
          console.error('RotaryGrants: Error code:', err.code);
          console.error('RotaryGrants: Error message:', err.message);
          setError(`Failed to load grants: ${err.code || ''} ${err.message || ''}`.trim());
          setLoading(false);
        }
      );

      return () => {
        console.log('RotaryGrants: Cleaning up Firestore listener');
        unsubscribe();
      };
    } catch (err: any) {
      console.error('RotaryGrants: Error setting up listener:', err);
      console.error('RotaryGrants: Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError(`Failed to initialize: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, []);

  // Use only Firebase grants and ensure proper ordering (oldest first - ascending 1 to 30)
  const allProjects = firebaseGrants.sort((a, b) => {
    // Sort by createdAt timestamp, oldest first (ascending order)
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    
    // If both have timestamps, sort by timestamp (ascending)
    if (aTime && bTime) {
      return aTime - bTime;
    }
    
    // If only one has timestamp, prioritize the one with timestamp
    if (aTime && !bTime) return -1;
    if (!aTime && bTime) return 1;
    
    // If neither has timestamp, sort alphabetically by title as fallback
    return (a.title || '').localeCompare(b.title || '');
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 mt-5">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Rotary Global Grants
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Rotary initiatives focused on improving local communities through
              healthcare, education, infrastructure, and skill development.
            </p>
            <div className="w-24 h-1 bg-white mx-auto mt-8 rounded-full"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading additional grants...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-4 mb-6">
            <div className="text-yellow-500 mb-2">⚠️</div>
            <p className="text-yellow-600 text-sm">{error}</p>
            <p className="text-gray-500 text-xs mt-1">Please try again later</p>
          </div>
        )}

        {/* No Grants State */}
        {!loading && !error && allProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">No Grants Yet</h3>
            <p className="text-gray-600">Rotary Global Grants will be added from the admin panel soon.</p>
          </div>
        )}

        {/* Grants Grid */}
        {!loading && !error && allProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project, index) => (
            <Card key={project.id} className="group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl">
              {/* Top accent border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
              
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-xl font-bold mb-3 text-gray-900">
                  {project.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm pb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 text-sm">
                    <div className="w-2 h-2 rounded-full mr-2 bg-blue-500" />
                    <span className="font-medium">Rotary Global Grant No:</span>
                    <span className="ml-1">{project.rotaryGlobalGrantNo}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <div className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                    <span className="font-medium">Total Project Cost:</span>
                    <span className="ml-1">{project.totalProjectCost}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <div className="w-2 h-2 rounded-full mr-2 bg-purple-500" />
                    <span className="font-medium">Contribution by Rtn. Kishor Lulla:</span>
                    <span className="ml-1">{project.contributionByKishorLulla}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <div className="w-2 h-2 rounded-full mr-2 bg-orange-500" />
                    <span className="font-medium">Host Club:</span>
                    <span className="ml-1">{project.hostClub}</span>
                  </div>
                  
                  <div className="flex items-center p-3 rounded-lg border bg-blue-50 border-blue-200">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium text-sm text-blue-700">
                      Foreign Partner: {project.foreignPartner}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        
        </div>
      </div>
    </Layout>
  );
}
