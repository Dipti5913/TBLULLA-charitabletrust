import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdLock,
  MdOutlineShoppingCart,
  MdVideoLibrary,
} from 'react-icons/md';

// Admin Imports
import VideoGallery from 'views/admin/video-gallery';
import Events from 'views/admin/events';
import RotaryGlobalGrants from 'views/admin/rotary-global-grants';
import OurProjects from 'views/admin/our-projects';
import Blog from 'views/admin/blog';
import NGOs from 'views/admin/ngos';
import ContactUs from 'views/admin/contact-us';
import AnnualReports from 'views/admin/annual-reports';
import Testimonials from 'pages/Testimonials';

// Auth Imports
import NewSignIn from 'views/auth/newSignIn';
import SignUp from 'views/auth/signup';

// Auth routes - kept separate for functionality but not shown in sidebar
const authRoutes = [
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <NewSignIn />,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignUp />,
  },
];

const routes = [
  // Admin Routes
  {
    name: 'Video Testimonials',
    layout: '/admin',
    path: '/testimonials',
    icon: <Icon as={MdVideoLibrary} width="20px" height="20px" color="inherit" />,
    component: <Testimonials />,
  },
  {
    name: 'VideoGallary',
    layout: '/admin',
    path: '/video-gallary',
    icon: (
      <Icon
        as={MdOutlineShoppingCart}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <VideoGallery />,
    secondary: true,
  },
  {
    name: 'Events',
    layout: '/admin',
    path: '/events',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <Events />,
  },
  {
    name: 'Rotary Global Grants',
    layout: '/admin',
    path: '/rotary-global-grants',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <RotaryGlobalGrants />,
  },
  {
    name: 'Our Projects',
    layout: '/admin',
    path: '/our-projects',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <OurProjects />,
  },
  {
    name: 'Annual Reports',
    layout: '/admin',
    path: '/annual-reports',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <AnnualReports />,
  },
  {
    name: 'Our Blog',
    layout: '/admin',
    path: '/blog',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <Blog />,
  },
  {
    name: 'NGOs',
    layout: '/admin',
    path: '/ngos',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <NGOs />,
  },
  {
    name: 'Contact Us',
    layout: '/admin',
    path: '/contact-us',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <ContactUs />,
  },
];

// Export admin routes for sidebar (default export)
export default routes;

// Export all routes (admin + auth) for routing functionality
export const allRoutes = [...authRoutes, ...routes];
