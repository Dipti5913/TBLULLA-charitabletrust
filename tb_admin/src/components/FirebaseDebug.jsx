import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Badge, Button } from '@chakra-ui/react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

const FirebaseDebug = () => {
  const [status, setStatus] = useState({
    auth: null,
    db: null,
    storage: null,
    testResult: null
  });

  useEffect(() => {
    setStatus({
      auth: !!auth,
      db: !!db,
      storage: !!storage,
      testResult: null
    });
  }, []);

  const testFirestore = async () => {
    try {
      console.log('ADMIN DEBUG: Testing Firestore...');
      
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Test write
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Firebase test',
        timestamp: serverTimestamp()
      });
      console.log('ADMIN DEBUG: Test document created:', testDoc.id);

      // Test read
      const snapshot = await getDocs(collection(db, 'photos'));
      console.log('ADMIN DEBUG: Photos collection has', snapshot.docs.length, 'documents');

      setStatus(prev => ({
        ...prev,
        testResult: `✅ Success! Photos: ${snapshot.docs.length}, Test doc: ${testDoc.id}`
      }));
    } catch (error) {
      console.error('ADMIN DEBUG: Firestore test failed:', error);
      setStatus(prev => ({
        ...prev,
        testResult: `❌ Failed: ${error.message}`
      }));
    }
  };

  return (
    <Box p={4} bg="gray.50" rounded="md" mb={4}>
      <Text fontWeight="bold" mb={2}>🔧 Firebase Debug Status</Text>
      <VStack align="start" spacing={2}>
        <Text>
          Auth: <Badge colorScheme={status.auth ? 'green' : 'red'}>{status.auth ? 'Connected' : 'Not Connected'}</Badge>
        </Text>
        <Text>
          Firestore: <Badge colorScheme={status.db ? 'green' : 'red'}>{status.db ? 'Connected' : 'Not Connected'}</Badge>
        </Text>
        <Text>
          Storage: <Badge colorScheme={status.storage ? 'green' : 'red'}>{status.storage ? 'Connected' : 'Not Connected'}</Badge>
        </Text>
        
        <Button size="sm" onClick={testFirestore} colorScheme="blue">
          Test Firestore Connection
        </Button>
        
        {status.testResult && (
          <Text fontSize="sm" p={2} bg="white" rounded="md" w="100%">
            {status.testResult}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default FirebaseDebug;
