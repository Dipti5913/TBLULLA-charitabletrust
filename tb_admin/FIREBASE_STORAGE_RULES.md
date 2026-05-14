# Firebase Storage Rules Configuration

## Issue: Images not displaying after upload

The most common cause of "Image not available" after successful upload is Firebase Storage security rules.

## Solution: Update Firebase Storage Rules

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `admin-a6f7e`
3. Go to Storage → Rules
4. Replace the existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Specific rules for blog images
    match /blogs/{imageId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null; // Only authenticated users can upload
    }
    
    // Test folder for debugging
    match /test/{imageId} {
      allow read, write: if true; // Full access for testing
    }
  }
}
```

## Alternative (More Permissive for Testing):

If you're still having issues, temporarily use this more permissive rule for testing:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Warning**: The permissive rule above should only be used for testing. Use the first rule set for production.

## How to Apply:

1. Copy the rules above
2. Paste in Firebase Console → Storage → Rules
3. Click "Publish"
4. Wait 1-2 minutes for rules to propagate
5. Test image upload again

## Verification:

After updating rules, test by:
1. Upload a new blog with image
2. Check console for "URL accessibility test: { accessible: true }"
3. Verify image displays in both admin and client

## Additional CORS Configuration:

If images still don't load, you may need to configure CORS. Create a `cors.json` file:

```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

Then run: `gsutil cors set cors.json gs://admin-a6f7e.firebasestorage.app`
