import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  useColorModeValue,
  Flex,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';

function NewSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Chakra color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to sign in with:', email);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', userCredential.user.email);
      
      // Navigate to admin dashboard
      navigate('/admin/video-gallary', { replace: true });
      
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to sign in. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={bgColor}
      px={4}
    >
      <Box
        maxW="md"
        w="full"
        bg={cardBg}
        boxShadow="2xl"
        rounded="xl"
        p={8}
        border="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6}>
          {/* Header */}
          <Box textAlign="center">
            <Heading
              fontSize="2xl"
              fontWeight="bold"
              color={textColor}
              mb={2}
            >
              Admin Sign In
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Enter your credentials to access the admin panel
            </Text>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}

          {/* Sign In Form */}
          <Box w="full">
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {/* Email Field */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium" color={textColor}>
                    Email Address
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    size="lg"
                    borderColor={borderColor}
                    _hover={{ borderColor: 'blue.300' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                </FormControl>

                {/* Password Field */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium" color={textColor}>
                    Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      borderColor={borderColor}
                      _hover={{ borderColor: 'blue.300' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                    <InputRightElement>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon as={showPassword ? ViewOffIcon : ViewIcon} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Signing In..."
                  spinner={<Spinner size="sm" />}
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                  _active={{ transform: 'translateY(0)' }}
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Footer */}
          <Box textAlign="center">
            <Text fontSize="xs" color="gray.500">
              Tblulla Admin Panel - Secure Access
            </Text>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
}

export default NewSignIn;
