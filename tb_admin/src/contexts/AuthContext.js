import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign in function
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('ADMIN: Attempting to sign in with email:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('ADMIN: Sign in successful:', result.user.uid);
      return result;
    } catch (error) {
      console.error('ADMIN: Sign in error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      setError(null);
      console.log('ADMIN: Signing out...');
      await signOut(auth);
      console.log('ADMIN: Sign out successful');
    } catch (error) {
      console.error('ADMIN: Sign out error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Create user function (for initial setup)
  const createUser = async (email, password) => {
    try {
      setError(null);
      console.log('ADMIN: Creating user with email:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('ADMIN: User creation successful:', result.user.uid);
      return result;
    } catch (error) {
      console.error('ADMIN: User creation error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      console.error('ADMIN: Auth not initialized');
      setLoading(false);
      return;
    }

    console.log('ADMIN: Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('ADMIN: Auth state changed:', user ? user.uid : 'No user');
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    createUser,
    loading,
    error,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};