# 🔧 Complete Firebase Rules for Entire NGO Site

## Overview
These rules provide comprehensive access control for your entire NGO website, covering all features:
- ✅ Blog system with images
- ✅ Events management
- ✅ Projects showcase
- ✅ Video gallery
- ✅ Annual reports
- ✅ NGO partnerships
- ✅ CSR proposals system
- ✅ Contact forms
- ✅ File uploads

## Rule Philosophy
- **Public Read**: Anyone can view published content (blogs, events, projects, etc.)
- **Authenticated Write**: Only logged-in admin users can create/edit content
- **Public Submissions**: Anyone can submit contact forms and CSR proposals
- **Secure Admin**: Full admin access for authenticated users

## How to Apply Rules

### Step 1: Firebase Storage Rules (For Images & Files)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **admin-a6f7e**
3. Click **Storage** → **Rules**
4. Copy content from `COMPLETE_FIREBASE_STORAGE_RULES.txt`
5. Paste and click **"Publish"**

### Step 2: Firestore Database Rules (For Data)
1. In Firebase Console, click **Firestore Database** → **Rules**
2. Copy content from `COMPLETE_FIRESTORE_RULES.txt`
3. Paste and click **"Publish"**

## What Each Rule Does

### Storage Rules Cover:
- `/blogs/` - Blog images
- `/events/` - Event photos
- `/projects/` - Project images
- `/videos/` - Video thumbnails
- `/reports/` - Annual reports (PDFs)
- `/csr/` - CSR certificates
- `/ngos/` - NGO partner files
- `/uploads/` - General uploads
- `/test/` - Testing folder

### Firestore Rules Cover:
- `blogs` - Blog posts and content
- `events` - Event information
- `projects` - Project details
- `globalGrants` - Rotary grants
- `videos` - Video gallery data
- `annualReports` - Report metadata
- `ngos` - NGO partnership data
- `csrProposals` - CSR partnership requests
- `csrFocusAreas` - CSR focus areas
- `csrCertificates` - CSR certificate data
- `contactMessages` - Contact form submissions

## Security Features

### Public Access (Read Only):
- ✅ Website visitors can view all published content
- ✅ Download annual reports
- ✅ View project galleries
- ✅ Read blog posts
- ✅ See event information

### Public Submissions:
- ✅ Anyone can submit contact forms
- ✅ Companies can submit CSR proposals
- ✅ Form submissions are stored securely

### Admin Only:
- ✅ Create/edit blogs, events, projects
- ✅ Upload images and files
- ✅ Manage NGO partnerships
- ✅ View contact messages and CSR proposals
- ✅ Upload annual reports

## Testing After Applying Rules

### Test Image Upload:
1. Open blog creation form
2. Select an image
3. Click "🔍 Run Complete Diagnostic"
4. Should show: ✅ ALL TESTS PASSED!

### Test Public Access:
1. Open your client website (not logged in)
2. Check if blogs, events, projects display
3. Verify images load properly
4. Test contact form submission

### Test Admin Functions:
1. Login to admin panel
2. Create a new blog with image
3. Create a new event
4. Upload an annual report
5. Check CSR proposals

## Expected Results
After applying these rules:
- ✅ Images upload and display correctly
- ✅ Public can view all content
- ✅ Admin can manage everything
- ✅ Contact forms work
- ✅ CSR proposals can be submitted
- ✅ File downloads work
- ✅ No security vulnerabilities

## Troubleshooting
If something doesn't work:
1. Wait 1-2 minutes after publishing rules
2. Clear browser cache
3. Check browser console for errors
4. Verify you're logged in for admin functions
5. Test with the diagnostic button in blog form

## Production Security
These rules are production-ready and provide:
- ✅ Proper access control
- ✅ Public content visibility
- ✅ Secure admin operations
- ✅ Protected sensitive data
- ✅ Safe file uploads
