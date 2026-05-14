import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

// ==========================
// Types
// ==========================
type PdfFile = {
  name: string;
  url: string;
};

type MonthData = {
  year: string;
  month: string;
  title: string;
  content: string;
  pdfs?: PdfFile[];
  isFromFirebase?: boolean;
};

// ==========================
// Main Component
// ==========================
export default function SevaVicharPage() {
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [firebaseIssues, setFirebaseIssues] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Helper functions for managing expanded cards
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const isCardExpanded = (cardId: string) => expandedCards.has(cardId);

  // Function to extract date and title from issue data
  const getDisplayInfo = (issue: MonthData) => {
    // Extract date from month and year
    const date = `${issue.month} ${issue.year}`;
    
    // Always use "Seva Vichar" as title
    const title = "Seva Vichar";
    
    return { date, title };
  };

  // Function to get month name from number
  const getMonthName = (monthNum: number): string => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[monthNum - 1] || monthNum.toString();
  };

  // Fetch Seva Vichar entries from Firebase
  useEffect(() => {
    console.log('SevaVichar: Starting to fetch entries, db:', !!db);
    
    if (!db) {
      console.error('SevaVichar: Firebase Firestore not initialized');
      setError('Firebase connection failed');
      setLoading(false);
      return;
    }

    try {
      console.log('SevaVichar: Setting up Firestore listener for sevaVichar collection');
      const q = query(collection(db, 'sevaVichar'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('SevaVichar: Received snapshot with', snapshot.docs.length, 'entries');
          
          const fetchedIssues: MonthData[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('SevaVichar: Processing entry:', doc.id, data);
            
            // Convert Firebase files to PDF format expected by client
            const pdfs: PdfFile[] = data.files ? data.files.map((file: any) => ({
              name: file.name,
              url: file.url
            })) : [];
            
            return {
              year: data.year?.toString() || 'Unknown',
              month: getMonthName(data.month) || 'Unknown',
              title: data.title || 'Seva Vichar',
              content: `Issue for ${getMonthName(data.month)} ${data.year}.`,
              pdfs,
              isFromFirebase: true, // Flag to identify Firebase entries
              createdAt: data.createdAt, // Keep for sorting
            } as MonthData & { createdAt?: any };
          });
          
          // Sort by createdAt on client side (newest first)
          const sortedIssues = fetchedIssues.sort((a: any, b: any) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.seconds - a.createdAt.seconds;
          });
          
          setFirebaseIssues(sortedIssues);
          setLoading(false);
          setError(null);
          console.log('SevaVichar: Successfully loaded', fetchedIssues.length, 'entries from Firebase');
        },
        (err) => {
          console.error('SevaVichar: Error fetching entries:', err);
          console.error('SevaVichar: Error code:', err.code);
          console.error('SevaVichar: Error message:', err.message);
          
          let errorMessage = 'Failed to load entries from Firebase';
          if (err.code === 'permission-denied') {
            errorMessage = '🚨 PERMISSION DENIED: Firebase security rules need to be updated. Please apply the rules from firebase-rules-quick-fix.txt file to Firebase Console → Firestore → Rules → Publish';
          } else if (err.code === 'unavailable') {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
          } else if (err.message) {
            errorMessage = `Firebase error: ${err.message}`;
          }
          
          setError(errorMessage);
          setLoading(false);
        }
      );

      return () => {
        console.log('SevaVichar: Cleaning up Firestore listener');
        unsubscribe();
      };
    } catch (err: any) {
      console.error('SevaVichar: Error setting up listener:', err);
      setError(`Failed to initialize: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, []);

  // Use only Firebase issues (no static data)
  const allIssues = React.useMemo(() => {
    return [...firebaseIssues].sort((a, b) => {
      // Convert month names to numbers for proper sorting
      const monthToNumber = (monthStr: string): number => {
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        const shortIndex = shortMonths.indexOf(monthStr);
        if (shortIndex !== -1) return shortIndex + 1;
        
        const longIndex = longMonths.indexOf(monthStr);
        if (longIndex !== -1) return longIndex + 1;
        
        return 0;
      };

      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      const monthA = monthToNumber(a.month);
      const monthB = monthToNumber(b.month);

      // Sort by year first (descending), then by month (descending)
      if (yearA !== yearB) {
        return yearB - yearA; // Newer year first
      }
      return monthB - monthA; // Newer month first
    });
  }, [firebaseIssues]);

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
              Publication Archive
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Seva Vichar
              <span className="block text-blue-600">Archive Collection</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our comprehensive collection of Seva Vichar publications, documenting years of 
              community service, social initiatives, and transformative projects.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-4 text-lg text-gray-600">Loading additional entries...</span>
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
              <p className="text-gray-500 text-sm mt-2">Showing existing entries only</p>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allIssues.map((issue, idx) => (
              <Card
                key={`firebase-${idx}`}
                className={`group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl ${
                  issue.isFromFirebase ? 'ring-2 ring-emerald-200' : ''
                }`}
              >
                {/* Card Border Glow */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10 ${
                  issue.isFromFirebase 
                    ? 'bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10' 
                    : 'bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10'
                }`}></div>
                
                {/* Top accent border */}
                <div className={`absolute top-0 left-0 right-0 h-1 pointer-events-none -z-10 ${
                  issue.isFromFirebase 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`} />

                <CardHeader className="relative z-10 pb-4 pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      issue.isFromFirebase 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {(() => {
                        const { date } = getDisplayInfo(issue);
                        return date;
                      })()}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                    Seva Vichar Edition
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {issue.content}
                  </p>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4 pb-6">
                  {/* Documents Section */}
                  {issue.pdfs && issue.pdfs.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className={`w-5 h-5 ${
                          issue.isFromFirebase ? 'text-emerald-600' : 'text-blue-600'
                        }`} />
                        <h4 className="font-semibold text-gray-900">
                          Documents ({issue.pdfs.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {(() => {
                          const cardId = `firebase-${idx}`;
                          const isExpanded = isCardExpanded(cardId);
                          const documentsToShow = isExpanded ? issue.pdfs : issue.pdfs.slice(0, 3);
                          
                          return documentsToShow.map((pdf, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImg(pdf.url)}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg text-left border transition-all duration-300 hover:scale-105 ${
                              issue.isFromFirebase 
                                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              issue.isFromFirebase ? 'bg-emerald-500' : 'bg-blue-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-700 line-clamp-2">
                              {pdf.name}
                            </span>
                          </button>
                          ));
                        })()}
                        
                        {/* Show More/Less Button */}
                        {issue.pdfs.length > 3 && (
                          <div className="text-center pt-3">
                            <button
                              onClick={() => {
                                const cardId = `firebase-${idx}`;
                                toggleCardExpansion(cardId);
                              }}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                issue.isFromFirebase 
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {(() => {
                                const cardId = `firebase-${idx}`;
                                const isExpanded = isCardExpanded(cardId);
                                return (
                                  <>
                                    <span>
                                      {isExpanded 
                                        ? 'Show Less' 
                                        : `Show ${issue.pdfs.length - 3} More`
                                      }
                                    </span>
                                    <svg 
                                      className={`w-4 h-4 transition-transform duration-300 ${
                                        isExpanded ? 'rotate-180' : ''
                                      }`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </>
                                );
                              })()}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State for Firebase entries only */}
          {!loading && !error && firebaseIssues.length === 0 && (
            <div className="text-center py-12 mt-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Archive Complete</h3>
              <p className="text-gray-600">
                No additional entries from admin panel yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {activeImg && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-4 max-w-[80vw] max-h-[90vh] flex flex-col items-center">
            {/* Image Viewer */}
            <img
              src={activeImg}
              alt="Seva Vichar Page"
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded"
            />

            {/* Footer */}
            <div className="mt-4">
              <button
                onClick={() => setActiveImg(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}