import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  Text, 
  Alert, 
  AlertIcon, 
  Code,
  Divider,
  Badge,
  HStack
} from '@chakra-ui/react';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';

const FirebaseDebugger = () => {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, status, message, data = null) => {
    setResults(prev => [...prev, { 
      test, 
      status, 
      message, 
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test 1: Firebase Services Initialization
  const testFirebaseInit = () => {
    addResult('Firebase Init', 'info', 'Testing Firebase services initialization...');
    
    const dbStatus = !!db;
    const storageStatus = !!storage;
    
    addResult('Firestore DB', dbStatus ? 'success' : 'error', 
      dbStatus ? 'Firestore initialized successfully' : 'Firestore NOT initialized', 
      { db: typeof db, dbInstance: !!db });
      
    addResult('Firebase Storage', storageStatus ? 'success' : 'error', 
      storageStatus ? 'Storage initialized successfully' : 'Storage NOT initialized',
      { storage: typeof storage, storageInstance: !!storage });
      
    return dbStatus && storageStatus;
  };

  // Test 2: Firestore Connection
  const testFirestoreConnection = async () => {
    addResult('Firestore Connection', 'info', 'Testing Firestore connection...');
    
    try {
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      
      addResult('Firestore Read', 'success', 
        `Successfully read ${snapshot.docs.length} projects from Firestore`,
        { 
          projectCount: snapshot.docs.length,
          projects: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        });
        
      return true;
    } catch (error) {
      addResult('Firestore Read', 'error', 
        `Firestore connection failed: ${error.message}`,
        { error: error.code, message: error.message });
      return false;
    }
  };

  // Test 3: Storage Connection and Upload
  const testStorageUpload = async () => {
    addResult('Storage Upload', 'info', 'Testing Firebase Storage upload...');
    
    try {
      // Create a test blob
      const testData = 'Hello Firebase Storage!';
      const testBlob = new Blob([testData], { type: 'text/plain' });
      const testFileName = `test_${Date.now()}.txt`;
      const testPath = `debug/${testFileName}`;
      
      addResult('Storage Upload', 'info', `Creating test file: ${testPath}`);
      
      const storageRef = ref(storage, testPath);
      const uploadResult = await uploadBytes(storageRef, testBlob);
      
      addResult('Storage Upload', 'success', 
        'Test file uploaded successfully',
        { path: testPath, size: uploadResult.metadata.size });
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      addResult('Storage URL', 'success', 
        'Download URL generated successfully',
        { url: downloadURL });
        
      return true;
    } catch (error) {
      addResult('Storage Upload', 'error', 
        `Storage upload failed: ${error.message}`,
        { error: error.code, message: error.message });
      return false;
    }
  };

  // Test 4: List Storage Files
  const testStorageList = async () => {
    addResult('Storage List', 'info', 'Testing Storage file listing...');
    
    try {
      const projectsRef = ref(storage, 'projects');
      const listResult = await listAll(projectsRef);
      
      addResult('Storage List', 'success', 
        `Found ${listResult.items.length} files in projects folder`,
        { 
          fileCount: listResult.items.length,
          files: listResult.items.map(item => item.name)
        });
        
      return true;
    } catch (error) {
      addResult('Storage List', 'error', 
        `Storage listing failed: ${error.message}`,
        { error: error.code, message: error.message });
      return false;
    }
  };

  // Test 5: Test Project Creation
  const testProjectCreation = async () => {
    addResult('Project Creation', 'info', 'Testing project creation with image...');
    
    try {
      // Create test image blob
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 100, 100);
      
      const testImageBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });
      
      // Upload test image
      const imageName = `test_project_${Date.now()}.png`;
      const imagePath = `projects/${imageName}`;
      const imageRef = ref(storage, imagePath);
      
      addResult('Project Creation', 'info', `Uploading test image: ${imagePath}`);
      
      const uploadResult = await uploadBytes(imageRef, testImageBlob);
      const imageURL = await getDownloadURL(imageRef);
      
      addResult('Project Creation', 'success', 'Test image uploaded successfully');
      
      // Create test project in Firestore
      const projectData = {
        title: `Test Project ${Date.now()}`,
        category: 'Health Care',
        description: 'This is a test project created by the debugger',
        images: [imageURL],
        imagePaths: [imagePath],
        imageUrl: imageURL,
        imagePath: imagePath,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      
      addResult('Project Creation', 'success', 
        'Test project created successfully',
        { 
          projectId: docRef.id, 
          imageURL: imageURL,
          projectData: projectData
        });
        
      return true;
    } catch (error) {
      addResult('Project Creation', 'error', 
        `Project creation failed: ${error.message}`,
        { error: error.code, message: error.message });
      return false;
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTesting(true);
    clearResults();
    
    addResult('Test Suite', 'info', 'Starting Firebase diagnostic tests...');
    
    // Test 1: Firebase Initialization
    const initOk = testFirebaseInit();
    
    if (!initOk) {
      addResult('Test Suite', 'error', 'Firebase not initialized. Cannot continue tests.');
      setTesting(false);
      return;
    }
    
    // Test 2: Firestore Connection
    await testFirestoreConnection();
    
    // Test 3: Storage Upload
    await testStorageUpload();
    
    // Test 4: Storage List
    await testStorageList();
    
    // Test 5: Project Creation
    await testProjectCreation();
    
    addResult('Test Suite', 'success', 'All diagnostic tests completed!');
    setTesting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'warning': return 'yellow';
      default: return 'blue';
    }
  };

  return (
    <Box p={6} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">Firebase Debugger</Text>
          <HStack>
            <Button onClick={clearResults} size="sm" variant="outline">
              Clear Results
            </Button>
            <Button 
              onClick={runAllTests} 
              colorScheme="blue" 
              isLoading={testing}
              loadingText="Testing..."
            >
              Run All Tests
            </Button>
          </HStack>
        </HStack>
        
        <Divider />
        
        {results.length === 0 && (
          <Alert status="info">
            <AlertIcon />
            Click "Run All Tests" to diagnose Firebase issues
          </Alert>
        )}
        
        {results.map((result, index) => (
          <Box key={index} p={3} border="1px solid" borderColor="gray.100" borderRadius="md">
            <HStack justify="space-between" mb={2}>
              <HStack>
                <Badge colorScheme={getStatusColor(result.status)}>
                  {result.status.toUpperCase()}
                </Badge>
                <Text fontWeight="semibold">{result.test}</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">{result.timestamp}</Text>
            </HStack>
            
            <Text mb={2}>{result.message}</Text>
            
            {result.data && (
              <Code p={2} borderRadius="md" fontSize="sm" display="block" whiteSpace="pre-wrap">
                {JSON.stringify(result.data, null, 2)}
              </Code>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default FirebaseDebugger;