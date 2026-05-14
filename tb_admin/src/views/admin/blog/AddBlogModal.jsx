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
  Box,
  Text,
  Image,
  Progress,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { FiX, FiUpload, FiImage } from "react-icons/fi";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase";
import MultiImageUploadChakra from "../../../components/MultiImageUploadChakra";

export default function AddBlogModal({ isOpen, onClose }) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
  }, []);

  const reset = () => {
    setTitle("");
    setDate(new Date().toISOString().split('T')[0]);
    setDescription("");
    setImages([]);
    setUploading(false);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Please enter a title", status: "warning" });
      return;
    }
    
    if (!description.trim()) {
      toast({ title: "Please enter a description", status: "warning" });
      return;
    }

    if (!date) {
      toast({ title: "Please select a date", status: "warning" });
      return;
    }

    console.log('ADMIN BLOG: Starting blog post creation...');
    console.log('ADMIN BLOG: Firebase services check:', { 
      storage: !!storage, 
      db: !!db,
      storageType: typeof storage,
      dbType: typeof db
    });

    if (!storage || !db) {
      console.error('ADMIN BLOG: Firebase services not initialized:', { storage, db });
      toast({
        title: "Firebase not connected",
        description: "Storage/Firestore is not initialized. Check Firebase configuration and reload the app.",
        status: "error",
        duration: 10000,
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrls = [];
      let imagePaths = [];

      // Upload images if provided
      if (images && images.length > 0) {
        console.log('ADMIN BLOG: Uploading images...');
        
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const ext = image.name.split(".").pop();
          const id = uuidv4();
          const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${i}_${id}.${ext}`;
          const imagePath = `blogs/${fileName}`;
          const storageRef = ref(storage, imagePath);

          await new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, image);
            
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress = ((i + snapshot.bytesTransferred / snapshot.totalBytes) / images.length) * 100;
                setUploadProgress(progress);
                console.log(`ADMIN BLOG: Images upload progress: ${progress}%`);
              },
              (error) => {
                console.error(`ADMIN BLOG: Image upload failed:`, error);
                toast({
                  title: 'Image upload failed',
                  description: `${error.code || ''} ${error.message || ''}`.trim(),
                  status: 'error',
                });
                reject(error);
              },
              async () => {
                try {
                  const imageUrl = await getDownloadURL(storageRef);
                  console.log('ADMIN BLOG: Got image download URL:', imageUrl);
                  imageUrls.push(imageUrl);
                  imagePaths.push(imagePath);
                  resolve();
                } catch (error) {
                  console.error(`ADMIN BLOG: Error getting download URL:`, error);
                  reject(error);
                }
              }
            );
          });
        }
      }

      // Save blog post to Firestore
      const primaryImage = imageUrls.length > 0 ? imageUrls[0] : null;
      const blogData = {
        title: title.trim(),
        description: description.trim(),
        date: new Date(date), // Convert string date to Date object
        imageUrl: primaryImage, // Primary image for backward compatibility
        imagePath: imagePaths.length > 0 ? imagePaths[0] : null, // Primary image path
        images: imageUrls, // All images array
        imagePaths: imagePaths, // All image paths array
        createdAt: serverTimestamp(),
      };

      console.log('ADMIN BLOG: Saving to Firestore:', blogData);
      
      const docRef = await addDoc(collection(db, 'blogs'), blogData);
      console.log('ADMIN BLOG: Document saved with ID:', docRef.id);

      toast({ title: "Blog post added successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error('ADMIN BLOG: Error adding blog post:', e);
      toast({ 
        title: "Failed to add blog post", 
        description: `${e.code || ''} ${e.message || ''}`.trim(), 
        status: "error" 
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!uploading) { reset(); onClose?.(); } }} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Blog Post</ModalHeader>
        <ModalCloseButton isDisabled={uploading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter blog post title"
                maxLength={200}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input 
                type="date"
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </FormControl>

            <FormControl>
              <MultiImageUploadChakra
                images={images}
                onImagesChange={handleImagesChange}
                maxImages={5}
                maxSizeMB={5}
                disabled={uploading}
                label="Blog Images"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter blog post description or content"
                rows={6}
                maxLength={2000}
                resize="vertical"
              />
            </FormControl>

            {/* Upload Progress */}
            {uploading && (
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  {images.length > 0 ? 'Uploading images and saving post...' : 'Saving blog post...'}
                </Text>
                <Progress value={images.length > 0 ? uploadProgress : 100} size="sm" colorScheme="brand" rounded="full" />
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  {images.length > 0 ? `${Math.round(uploadProgress)}% complete` : 'Processing...'}
                </Text>
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={() => { reset(); onClose?.(); }} isDisabled={uploading}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit} 
            isLoading={uploading} 
            loadingText="Adding Post"
          >
            Add Blog Post
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
