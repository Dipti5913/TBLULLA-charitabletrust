// Utility to create an admin user
// Run this in the browser console on the sign-up page to create a test admin user

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export const createAdminUser = async (email, password, displayName = 'Admin User') => {
  try {
    console.log('Creating admin user with email:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }
    
    console.log('Admin user created successfully:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Example usage:
// createAdminUser('admin@tblulla.org', 'AdminPassword123', 'T.B. Lulla Admin');
