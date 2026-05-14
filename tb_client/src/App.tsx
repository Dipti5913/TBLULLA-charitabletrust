import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { incrementVisitorCount } from "@/lib/visitorService";

import Index from "./pages/Index";
import About from "./pages/About";
import AboutLanding from "./pages/AboutLanding";
import AboutTBLulla from "./pages/AboutTBLulla";
import AboutKishorLulla from "./pages/AboutKishorLulla";
import Events from "./pages/Events";
import RotaryGrant from "./pages/RotaryGrant";
import ContactUs from "./pages/ContactUs";
import OurBlog from "./pages/OurBlog";
import NGO from "./pages/NGOs";
import Projects from "./pages/Our Projects";
import Gallery from "./pages/Gallery";
import AnnualReports from "./pages/AnnualReports";

import ShikuAnande from "./pages/OurProjects/Shiku Anande";
import Literacy from "./pages/OurProjects/Literacy";

import NaturalCalamities from "./pages/OurProjects/NaturalCalamities";

import DynamicProjectPage from "./components/DynamicProjectPage";

import VideoGallery from "./pages/Videogallary";
import CSR from "./pages/CSR";


  

const queryClient = new QueryClient();

// Component to handle visitor tracking
const VisitorTracker = () => {
  useEffect(() => {
    // Track visitor on app mount (only once per session)
    try {
      const hasTrackedThisSession = sessionStorage.getItem('visitor_tracked');
      
      if (!hasTrackedThisSession) {
        incrementVisitorCount().catch(error => {
          console.warn('Failed to track visitor:', error);
        });
        sessionStorage.setItem('visitor_tracked', 'true');
      }
    } catch (error) {
      console.warn('Visitor tracking failed:', error);
    }
  }, []);

  return null; // This component doesn't render anything
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <VisitorTracker />
        <Routes>
          {/* General Pages */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutLanding />} />
          <Route path="/about-tb-lulla" element={<AboutTBLulla />} />
          <Route path="/about-kishor-lulla" element={<AboutKishorLulla />} />
          <Route path="/events" element={<Events />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/annual-reports" element={<AnnualReports />} />
          <Route path="/rotary-grant" element={<RotaryGrant />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/pages/ourblog" element={<OurBlog />} />
          <Route path="/ngo" element={<NGO />} />
          <Route path="/csr" element={<CSR />} />

          {/* Our Projects - Static Routes */}
          <Route path="/projects/shiku-anande" element={<ShikuAnande />} />
          <Route path="/projects/literacy" element={<Literacy />} />

          <Route path="/projects/natural-calamities" element={<NaturalCalamities />} />

          
          {/* Dynamic Project Categories - This should be last to avoid conflicts */}
          <Route path="/projects/:category" element={<DynamicProjectPage />} />
          
          <Route path="/Videogallary" element={<VideoGallery/>}/>

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

