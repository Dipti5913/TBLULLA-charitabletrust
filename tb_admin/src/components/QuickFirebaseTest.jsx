import React, { useState } from 'react';
import { Button, Box, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../firebase';

const QuickFirebaseTest = () => {
  const [result, setResult] = useState('');
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setResult('Testing...');

    try {
      // Test 1: Check Firebase services
      if (!db || !storage) {
        setResult(`❌ Firebase not initialized. DB: ${!!db}, Storage: ${!!storage}`);
        setTesting(false);
        return;
      }

      setResult('✅ Firebase services initialized. Testing upload...');

      // Test 2: Create test image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 100, 100);

      const testBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      setResult('✅ Test image created. Uploading to storage...');

      // Test 3: Upload to storage
      const testPath = `test/quick_test_${Date.now()}.png`;
      const storageRef = ref(storage, testPath);
      const uploadResult = await uploadBytes(storageRef, testBlob);

      setResult('✅ Upload successful. Getting download URL...');

      // Test 4: Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      setResult('✅ Download URL obtained. Creating Firestore document...');

      // Test 5: Create Firestore document
      const testDoc = {
        title: 'Quick Test Project',
        category: 'Test',
        description: 'This is a test project',
        imageUrl: downloadURL,
        imagePath: testPath,
        images: [downloadURL],
        imagePaths: [testPath],
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'projects'), testDoc);

      setResult(`🎉 SUCCESS! Everything works! 
      
✅ Firebase initialized
✅ Image uploaded to: ${testPath}
✅ Download URL: ${downloadURL.substring(0, 50)}...
✅ Firestore document created: ${docRef.id}

Your Firebase setup is working correctly!`);

    } catch (error) {
      setResult(`❌ ERROR: ${error.message}

Error details:
- Code: ${error.code}
- Message: ${error.message}

Check Firebase Console and Storage Rules.`);
      console.error('Quick test error:', error);
    }

    setTesting(false);
  };

  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg="blue.50">
      <Text fontWeight="bold" mb={3}>🚀 Quick Firebase Test</Text>
      
      <Button 
        onClick={runTest} 
        colorScheme="blue" 
        isLoading={testing}
        loadingText="Testing..."
        mb={3}
      >
        Test Firebase Now
      </Button>

      {result && (
        <Alert status={result.includes('SUCCESS') ? 'success' : result.includes('ERROR') ? 'error' : 'info'}>
          <AlertIcon />
          <Box>
            <Text whiteSpace="pre-line" fontSize="sm">
              {result}
            </Text>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default QuickFirebaseTest;