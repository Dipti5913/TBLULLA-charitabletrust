import React, { useState, useCallback, useEffect } from "react";
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
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase";
import { v4 as uuidv4 } from "uuid";
import MultiImageUploadChakra from "../../../components/MultiImageUploadChakra";

export default function EditEventModal({ isOpen, onClose, event }) {
  const toast = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingImagePaths, setExistingImagePaths] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize form data when event changes
  useEffect(() => {
    if (event && isOpen) {
      console.log('EDIT EVENT: Initializing with event data:', event);
      
      setYear(event.year || new Date().getFullYear());
      setTitle(event.title || "");
      setDescription(event.description || "");
      
      // Handle existing images
      const existingImgs = event.images || [];
      const existingPaths = event.imagePaths || [];
      
      // Ensure paths array matches images array length
      while (existingPaths.length < existingImgs.length) {
        existingPaths.push("");
      }
      
      setExistingImages(existingImgs);
      setExistingImagePaths(existingPaths);
      setImages([]);
      setImagesToDelete([]);
      
      console.log('EDIT EVENT: Set existing images:', existingImgs);
      console.log('EDIT EVENT: Set existing paths:', existingPaths);
    }
  }, [event, isOpen]);

  const reset = () => {
    setYear(new Date().getFullYear());
    setTitle("");
    setDescription("");
    setImages([]);
    setExistingImages([]);
    setExistingImagePaths([]);
    setImagesToDelete([]);
    setLoading(false);
    setUploadProgress(0);
  };

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
  }, []);

  // Handle removal of existing images
  const handleRemoveExistingImage = useCallback((index) => {
    console.log('EDIT EVENT: Removing existing image at index:', index);
    
    const imageToRemove = existingImages[index];
    const pathToRemove = existingImagePaths[index];
    
    if (imageToRemove) {
      // Add to deletion queue
      setImagesToDelete(prev => [...prev, { url: imageToRemove, path: pathToRemove }]);
      
      // Remove from existing arrays
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setExistingImagePaths(prev => prev.filter((_, i) => i !== index));
      
      console.log('EDIT EVENT: Added to deletion queue:', { url: imageToRemove, path: pathToRemove });
    }
  }, [existingImages, existingImagePaths]);

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

    console.log('EDIT EVENT: Starting event update...');
    console.log('EDIT EVENT: Firebase services check:', { 
      db: !!db,
      storage: !!storage,
      event: !!event
    });

    if (!db || !storage) {
      console.error('EDIT EVENT: Firebase services not initialized');
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
      // Step 1: Delete images marked for deletion from Firebase Storage
      console.log('EDIT EVENT: Deleting marked images:', imagesToDelete);
      for (const imageToDelete of imagesToDelete) {
        if (imageToDelete.path && imageToDelete.path.trim()) {
          try {
            const deleteRef = ref(storage, imageToDelete.path);
            await deleteObject(deleteRef);
            console.log('EDIT EVENT: Successfully deleted image from storage:', imageToDelete.path);
          } catch (deleteError) {
            console.warn('EDIT EVENT: Failed to delete image from storage:', imageToDelete.path, deleteError);
            // Continue with update even if image deletion fails
          }
        }
      }

      // Step 2: Upload new images
      const newImageUrls = [];
      const newImagePaths = [];

      if (images.length > 0) {
        console.log('EDIT EVENT: Uploading new images...');
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const ext = file.name?.split('.').pop() || 'jpg';
          const safeName = `${title.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_${year}_${Date.now()}_${i}.${ext}`;
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
                console.error('EDIT EVENT: Image upload failed:', error);
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
                  newImageUrls.push(downloadUrl);
                  newImagePaths.push(storagePath);
                  console.log('EDIT EVENT: Successfully uploaded image:', downloadUrl);
                  resolve();
                } catch (error) {
                  console.error('EDIT EVENT: Failed to get download URL:', error);
                  reject(error);
                }
              }
            );
          });
        }
      }

      // Step 3: Combine existing and new images
      const allImageUrls = [...existingImages, ...newImageUrls];
      const allImagePaths = [...existingImagePaths, ...newImagePaths];

      // Step 4: Update event in Firestore
      const eventData = {
        year: parseInt(year),
        title: title.trim(),
        description: description.trim(),
        images: allImageUrls,
        imagePaths: allImagePaths,
        updatedAt: serverTimestamp(),
      };

      console.log('EDIT EVENT: Updating Firestore with data:', eventData);
      
      const docRef = doc(db, 'events', event.id);
      await updateDoc(docRef, eventData);
      
      console.log('EDIT EVENT: Successfully updated event');

      toast({ title: "Event updated successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error('EDIT EVENT: Error updating event:', e);
      toast({ 
        title: "Failed to update event", 
        description: `${e.code || ''} ${e.message || ''}`.trim(), 
        status: "error" 
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    reset();
    onClose?.();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => { 
        if (!loading) { 
          handleCancel(); 
        } 
      }} 
      size="lg"
      closeOnOverlayClick={!loading}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Event</ModalHeader>
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
                isDisabled={loading}
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
                isDisabled={loading}
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
                isDisabled={loading}
              />
            </FormControl>

            <FormControl>
              <MultiImageUploadChakra
                images={images}
                onImagesChange={handleImagesChange}
                onRemoveExisting={handleRemoveExistingImage}
                existingImages={existingImages}
                maxImages={10}
                maxSizeMB={5}
                disabled={loading}
                label="Event Images"
                showExistingImages={true}
              />
            </FormControl>

            {loading && uploadProgress > 0 && (
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  {images.length > 0 ? 'Uploading images and updating event...' : 'Updating event...'}
                </Text>
                <Progress value={uploadProgress} size="sm" colorScheme="blue" rounded="full" />
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  {images.length > 0 ? `${Math.round(uploadProgress)}% complete` : 'Processing...'}
                </Text>
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleCancel} isDisabled={loading}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit} 
            isLoading={loading} 
            loadingText="Updating Event"
          >
            Update Event
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}