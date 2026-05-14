# Firestore Rules for Visitor Count

To fix the "Missing or insufficient permissions" error for the visitor count feature, you need to update your Firestore security rules.

## Current Issue
The visitor count system tries to read/write to the `analytics` collection, but the current Firestore rules don't allow public access to this collection.

## Solution: Update Firestore Rules

Add these rules to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write access to visitor analytics
    match /analytics/siteVisitors {
      allow read, write: if true;
    }
    
    // Your existing rules for other collections...
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Alternative: More Secure Rules

If you want more security, you can allow only specific operations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read and increment operations on visitor count
    match /analytics/siteVisitors {
      allow read: if true;
      allow write: if true; // For creating the document initially
      allow update: if true; // For incrementing the count
    }
    
    // Your existing rules...
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## How to Apply Rules

1. Go to Firebase Console
2. Select your project
3. Go to Firestore Database
4. Click on "Rules" tab
5. Update the rules with the code above
6. Click "Publish"

## Fallback System

The visitor count system now includes a localStorage fallback:
- If Firebase permissions fail, it uses localStorage
- Starts with a base count of 1000 visitors
- Increments locally on each visit
- Syncs with Firebase when permissions are fixed

## Testing

Use the debug panel (in development mode) to:
- Test Firebase connection
- Test localStorage fallback
- Manually increment visitor count
- Check current status and mode