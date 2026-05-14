import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Progress,
} from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase";
import { v4 as uuidv4 } from "uuid";
import MultiImageUploadChakra from "../../../components/MultiImageUploadChakra";

export default function AddEventModal({ isOpen, onClose }) {
  const toast = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const reset = () => {
    setYear(new Date().getFullYear());
    setTitle("");
    setDescription("");
    setImages([]);
    setLoading(false);
    setUploadProgress(0);
  };

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Please enter a title", status: "warning" });
      return;
    }
    
    if (!description.trim()) {
      toast({ title: "Please enter a description", status: "warning" });
      return;
    }

    if (!year || year < 1900 || year > 2100) {
      toast({ title: "Please enter a valid year", status: "warning" });
      return;
    }

    console.log('ADMIN EVENT: Starting event creation...');
    console.log('ADMIN EVENT: Firebase services check:', { 
      db: !!db,
      storage: !!storage,
      dbType: typeof db,
      storageType: typeof storage
    });

    if (!db || !storage) {
      console.error('ADMIN EVENT: Firebase services not initialized:', { db, storage });
      toast({
        title: "Firebase not connected",
        description: "Firestore/Storage not initialized. Check Firebase configuration and reload the app.",
        status: "error",
        duration: 10000,
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      // Upload images first if any
      const imageUrls = [];
      const imagePaths = [];
      
      if (images.length > 0) {
        console.log('ADMIN EVENT: Uploading event images...');
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const ext = file.name?.split('.').pop() || 'jpg';
          const safeName = `${title.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_${year}_${i}_${uuidv4()}.${ext}`;
          const storagePath = `events/${year}/${safeName}`;
          const storageRef = ref(storage, storagePath);

          await new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = ((i + snapshot.bytesTransferred / snapshot.totalBytes) / images.length) * 100;
                setUploadProgress(progress);
              },
              (error) => {
                console.error('ADMIN EVENT: Image upload failed:', error);
                toast({
                  title: 'Image upload failed',
                  description: `${error.code || ''} ${error.message || ''}`.trim(),
                  status: 'error',
                });
                reject(error);
              },
              async () => {
                try {
                  const downloadUrl = await getDownloadURL(storageRef);
                  imageUrls.push(downloadUrl);
                  imagePaths.push(storagePath);
                  console.log('ADMIN EVENT: Successfully uploaded image:', downloadUrl);
                  resolve();
                } catch (error) {
                  console.error('ADMIN EVENT: Failed to get download URL:', error);
                  reject(error);
                }
              }
            );
          });
        }
      }

      const eventData = {
        year: parseInt(year),
        title: title.trim(),
        description: description.trim(),
        images: imageUrls,
        imagePaths: imagePaths,
        createdAt: serverTimestamp(),
      };

      console.log('ADMIN EVENT: Saving to Firestore:', eventData);
      console.log('ADMIN EVENT: Images array length:', imageUrls.length);
      console.log('ADMIN EVENT: Image URLs:', imageUrls);
      
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log('ADMIN EVENT: Document saved with ID:', docRef.id);

      toast({ title: "Event added successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error('ADMIN EVENT: Error adding event:', e);
      toast({ 
        title: "Failed to add event", 
        description: `${e.code || ''} ${e.message || ''}`.trim(), 
        status: "error" 
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!loading) { reset(); onClose?.(); } }} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Event</ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Year</FormLabel>
              <NumberInput 
                value={year} 
                onChange={(valueString, valueNumber) => setYear(valueNumber)}
                min={1900}
                max={2100}
              >
                <NumberInputField placeholder="Enter year (e.g., 2024)" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter event title"
                maxLength={100}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter event description"
                rows={4}
                maxLength={500}
                resize="vertical"
              />
            </FormControl>

            <FormControl>
              <MultiImageUploadChakra
                images={images}
                onImagesChange={handleImagesChange}
                maxImages={10}
                maxSizeMB={5}
                disabled={loading}
                label="Event Images (Optional)"
              />
            </FormControl>

            {loading && uploadProgress > 0 && (
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" color="gray.600">Uploading images...</Text>
                <Progress value={uploadProgress} size="sm" colorScheme="blue" rounded="full" />
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={() => { reset(); onClose?.(); }} isDisabled={loading}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit} 
            isLoading={loading} 
            loadingText="Adding Event"
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
