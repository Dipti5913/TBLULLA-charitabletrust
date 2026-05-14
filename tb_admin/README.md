# T.B. Lulla Foundation Admin Panel

A modern React-based admin panel for managing the T.B. Lulla Foundation's activities, projects, and partnerships.

## Features

- **Video Gallery Management** - Upload and manage foundation videos
- **Events Management** - Create and track foundation events
- **Rotary Global Grant Tracking** - Monitor grant projects and funding
- **Project Management** - Oversee foundation projects and initiatives
- **Annual Reports** - Manage and publish annual reports
- **Blog Management** - Create and publish blog posts
- **NGO Partnership Management** - Track partnerships with other organizations
- **Contact Message Management** - Handle inquiries and communications

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Public Sans Font** - Clean, professional typography

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository or extract the files
2. Navigate to the project directory:
   ```bash
   cd Admin
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/
│   ├── Header.js          # Top navigation header
│   └── Sidebar.js         # Left navigation sidebar
├── pages/
│   ├── VideoGallery.js    # Video management page
│   ├── Events.js          # Events management page
│   ├── RotaryGlobalGrant.js # Grant tracking page
│   ├── OurProjects.js     # Project management page
│   ├── AnnualReports.js   # Reports management page
│   ├── OurBlogs.js        # Blog management page
│   ├── NGOs.js            # NGO partnership page
│   └── ContactUs.js       # Contact messages page
├── App.js                 # Main application component
├── index.js              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Features Overview

### Dashboard Navigation
- Clean, modern sidebar navigation
- Responsive design that works on all devices
- Dark mode support (configured in Tailwind)

### Data Management
- Full CRUD operations for all entities
- Status tracking and priority management
- Search and filter capabilities
- Form validation and error handling

### User Interface
- Modern, professional design
- Consistent color scheme and typography
- Interactive components with hover states
- Loading states and transitions

## Customization

### Colors
The primary color scheme can be modified in `tailwind.config.js`:
- Primary: `#1173d4` (Foundation blue)
- Background Light: `#f6f7f8`
- Background Dark: `#101922`

### Adding New Pages
1. Create a new component in `src/pages/`
2. Add the route in `src/App.js`
3. Add navigation item in `src/components/Sidebar.js`

## Deployment

To deploy the application:

1. Build the production version:
   ```bash
   npm run build
   ```

2. The `build` folder contains the optimized production files
3. Deploy to your preferred hosting service (Netlify, Vercel, etc.)

## Contributing

1. Follow the existing code structure and naming conventions
2. Use functional components with React hooks
3. Maintain consistent styling with Tailwind CSS
4. Test all functionality before submitting changes

## License

This project is developed for the T.B. Lulla Foundation.
