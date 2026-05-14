import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

const NGOs = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [firebaseNgos, setFirebaseNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 9; // 9 cards per page

  // Fetch NGOs from Firebase admin panel
  useEffect(() => {
    console.log('NGOs: Starting to fetch NGOs, db:', !!db);
    
    if (!db) {
      console.error('NGOs: Firebase Firestore not initialized');
      setError('Firebase connection failed');
      setLoading(false);
      return;
    }

    try {
      console.log('NGOs: Setting up Firestore listener for ngos collection');
      const q = query(collection(db, 'ngos'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('NGOs: Received snapshot with', snapshot.docs.length, 'NGOs');
          
          const fetchedNgos = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('NGOs: Processing NGO:', doc.id, data);
            
            return {
              id: `firebase-${doc.id}`,
              name: data.organizationName || 'Untitled Organization',
              field: data.fieldOfWork || 'Not specified',
              city: data.city || 'Not specified',
              concernPerson: data.concernPerson,
              address: data.address,
              email: data.email,
              website: data.website,
              contactNumber: data.contactNumber,
              isFromFirebase: true,
              createdAt: data.createdAt,
            };
          });
          
          setFirebaseNgos(fetchedNgos);
          setLoading(false);
          setError(null);
          console.log('NGOs: Successfully loaded', fetchedNgos.length, 'NGOs from Firebase');
        },
        (err) => {
          console.error('NGOs: Error fetching NGOs:', err);
          let errorMessage = 'Failed to load NGOs';
          if (err.code === 'permission-denied') {
            errorMessage = 'Permission denied - Please check Firestore security rules for ngos collection';
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
        console.log('NGOs: Cleaning up Firestore listener');
        unsubscribe();
      };
    } catch (err: any) {
      console.error('NGOs: Error setting up listener:', err);
      setError(`Failed to initialize: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, []);

  // Use only Firebase NGO data and sort alphabetically by organization name
  const allNgos = [...firebaseNgos].sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  // Search filter
  const filteredData = allNgos.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.field.toLowerCase().includes(search.toLowerCase()) ||
      item.city.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Mobile sliding page numbers
  const maxPageButtons = 4; // show only 4 page numbers
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = startPage + maxPageButtons - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

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
              Partner Network
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              NGO Directory
              <span className="block text-blue-600">& Partners</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with our network of trusted NGO partners and organizations 
              working together to create positive social impact across communities.
            </p>
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-8 mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Connection Issue</h3>
              <p className="text-yellow-600">{error}</p>
              <p className="text-gray-500 text-sm mt-2">Please try again later</p>
            </div>
          )}

          {/* Search Section */}
          <div className="mb-16">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search NGO by name, field or city..."
                  className="block w-full pl-12 pr-4 py-4 border-0 rounded-2xl bg-white shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              {search && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-4 text-lg text-gray-600">Loading NGO directory...</span>
            </div>
          )}

          {/* NGO Cards */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentData.map((ngo, index) => (
                <div
                  key={ngo.sr || ngo.id}
                  className={`group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl ${
                    ngo.isFromFirebase ? 'ring-2 ring-emerald-200' : ''
                  }`}
                >
                  {/* Card Border Glow */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
                    ngo.isFromFirebase 
                      ? 'bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10' 
                      : 'bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10'
                  }`}></div>
                  
                  {/* Top accent border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    ngo.isFromFirebase 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`} />

                  <div className="relative z-10 p-6">

                    {/* Organization Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      {ngo.name}
                    </h3>

                    {/* Basic Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          ngo.isFromFirebase ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Field:</span> {ngo.field}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          ngo.isFromFirebase ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">City:</span> {ngo.city}
                        </span>
                      </div>
                    </div>

                    {/* Additional Firebase fields */}
                    {ngo.isFromFirebase && (
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        {ngo.concernPerson && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Contact Person:</span> {ngo.concernPerson}
                          </div>
                        )}
                        {ngo.email && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-600">Email:</span>{' '}
                            <a href={`mailto:${ngo.email}`} className="text-emerald-600 hover:text-emerald-700 hover:underline">
                              {ngo.email}
                            </a>
                          </div>
                        )}
                        {ngo.contactNumber && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-600">Phone:</span>{' '}
                            <a href={`tel:${ngo.contactNumber}`} className="text-emerald-600 hover:text-emerald-700 hover:underline">
                              {ngo.contactNumber}
                            </a>
                          </div>
                        )}
                        {ngo.website && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-600">Website:</span>{' '}
                            <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                              Visit Website
                            </a>
                          </div>
                        )}
                        {ngo.address && (
                          <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                            <span className="font-medium">Address:</span> {ngo.address}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-16">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-6 py-3 rounded-xl bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-gray-700 hover:text-blue-600"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 ${
                      currentPage === page 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-110" 
                        : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-6 py-3 rounded-xl bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-gray-700 hover:text-blue-600"
              >
                Next
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && currentData.length === 0 && (
            <div className="text-center py-12 mt-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">
                {search ? `No NGOs found matching "${search}"` : 'No NGOs available in the directory'}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default NGOs;
