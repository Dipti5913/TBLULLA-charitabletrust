import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import VideoGallery from './pages/VideoGallery';
import Events from './pages/Events';
import RotaryGlobalGrant from './pages/RotaryGlobalGrant';
import OurProjects from './pages/OurProjects';
import AnnualReports from './pages/AnnualReports';
import OurBlogs from './pages/OurBlogs';
import NGOs from './pages/NGOs';
import ContactUs from './pages/ContactUs';
import CSRProposals from './pages/CSRProposals';
import CSRFocusAreas from './pages/CSRFocusAreas';
import CSRCertificates from './pages/CSRCertificates';
import CSRDashboard from './pages/CSRDashboard';
import Testimonials from './pages/Testimonials';

const AdminPanel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
      <div className="flex h-screen">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex flex-1 flex-col lg:ml-0">
          <Header onToggleSidebar={toggleSidebar} />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/video-gallery" replace />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/video-gallery" element={<VideoGallery />} />
                <Route path="/events" element={<Events />} />
                <Route path="/rotary-global-grant" element={<RotaryGlobalGrant />} />
                <Route path="/our-projects" element={<OurProjects />} />
                <Route path="/annual-reports" element={<AnnualReports />} />
                <Route path="/our-blogs" element={<OurBlogs />} />
                <Route path="/ngos" element={<NGOs />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/csr-dashboard" element={<CSRDashboard />} />
                <Route path="/csr-proposals" element={<CSRProposals />} />
                <Route path="/csr-focus-areas" element={<CSRFocusAreas />} />
                <Route path="/csr-certificates" element={<CSRCertificates />} />
                {/* Catch all route - redirect to video gallery */}
                <Route path="*" element={<Navigate to="/video-gallery" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const [appError, setAppError] = React.useState(null);

  React.useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('App loading timeout - forcing app to show login');
        setAppError('Loading timeout - please refresh the page');
      }
    }, 10000);

    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  if (appError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Error</h2>
          <p className="text-gray-600 mb-4">{appError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <Router basename="/admin">
      <Routes>
        <Route 
          path="/*" 
          element={
            currentUser ? (
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            ) : (
              <Login />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

