import React from 'react';
import { Navigate } from 'react-router-dom';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  // Additional safety check: if Firebase auth is not initialized, show error
  if (!auth) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        bg="red.50"
      >
        <Spinner size="xl" color="red.500" thickness="4px" />
        <Text mt={4} fontSize="lg" color="red.600" textAlign="center">
          Authentication system not available.<br />
          Please refresh the page or contact support.
        </Text>
      </Flex>
    );
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        bg="gray.50"
      >
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4} fontSize="lg" color="gray.600">
          Loading...
        </Text>
      </Flex>
    );
  }

  // Redirect to admin dashboard if already authenticated
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  // Render the auth component if not authenticated
  return children;
};

export default AuthGuard;
