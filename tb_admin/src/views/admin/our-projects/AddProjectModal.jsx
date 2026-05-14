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
  Select,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase";
import MultiImageUploadChakra from "../../../components/MultiImageUploadChakra";

export default function AddProjectModal({ isOpen, onClose }) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [projectCategories, setProjectCategories] = useState([
    "Shiku Anande",
    "Literacy",
    "Rotary WASH",
    "Natural Calamities",
    "Health Care"
  ]);

  const handleAddNewCategory = () => {
    if (newCategory.trim() && !projectCategories.includes(newCategory.trim())) {
      const updatedCategories = [...projectCategories, newCategory.trim()];
      setProjectCategories(updatedCategories);
      setCategory(newCategory.trim());
      setNewCategory("");
      setShowNewCategoryInput(false);
      toast({
        title: "Category added",
        description: `"${newCategory.trim()}" has been added to categories`,
        status: "success",
        duration: 2000,
      });
    } else if (projectCategories.includes(newCategory.trim())) {
      toast({
        title: "Category exists",
        description: "This category already exists",
        status: "warning",
      });
    }
  };

  const handleCategoryChange = (value) => {
    if (value === "__add_new__") {
      setShowNewCategoryInput(true);
      setCategory("");
    } else {
      setCategory(value);
      setShowNewCategoryInput(false);
    }
  };

  const reset = () => {
    setTitle("");
    setCategory("");
    setNewCategory("");
    setShowNewCategoryInput(false);
    setDescription("");
    setUploading(false);
    setImages([]);
    setUploadProgress(0);
  };

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Please enter a project title", status: "warning" });
      return;
    }
    
    if (!description.trim()) {
      toast({ title: "Please enter a project description", status: "warning" });
      return;
    }

    if (!category.trim()) {
      toast({ title: "Please select or add a category", status: "warning" });
      return;
    }

    console.log('ADMIN PROJECTS: Starting project creation...');
    console.log('ADMIN PROJECTS: Firebase services check:', { 
      db: !!db,
      storage: !!storage,
      dbType: typeof db,
      storageType: typeof storage
    });

    if (!db || !storage) {
      console.error('ADMIN PROJECTS: Firebase services not initialized:', { db, storage });
      toast({
        title: "Firebase not connected",
        description: "Firestore/Storage not initialized. Check Firebase configuration and reload the app.",
        status: "error",
        duration: 10000,
      });
      return;
    }

    setUploading(true);
    try {
      const imageUrls = [];
      const imagePaths = [];

      if (images.length > 0) {
        console.log('ADMIN PROJECTS: Uploading project images...', {
          imageCount: images.length,
          storageRef: !!storage,
          firstImageName: images[0]?.name,
          firstImageSize: images[0]?.size,
          firstImageType: images[0]?.type
        });
        
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          console.log(`ADMIN PROJECTS: Processing image ${i + 1}/${images.length}:`, {
            name: image.name,
            size: image.size,
            type: image.type
          });
          
          const ext = image.name?.split('.').pop() || 'jpg';
          const uniqueName = `${title.replace(/[^a-zA-Z0-9]/g, '_') || 'project'}_${i}_${uuidv4()}.${ext}`;
          const storagePath = `projects/${uniqueName}`;
          
          console.log(`ADMIN PROJECTS: Storage path for image ${i + 1}:`, storagePath);
          
          try {
            const storageRef = ref(storage, storagePath);
            console.log(`ADMIN PROJECTS: Created storage reference for image ${i + 1}`);

            await new Promise((resolve, reject) => {
              const uploadTask = uploadBytesResumable(storageRef, image);
              
              uploadTask.on(
                'state_changed',
                (snapshot) => {
                  const progress = ((i + snapshot.bytesTransferred / snapshot.totalBytes) / images.length) * 100;
                  setUploadProgress(progress);
                  console.log(`ADMIN PROJECTS: Upload progress for image ${i + 1}: ${Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)}%`);
                },
                (error) => {
                  console.error(`ADMIN PROJECTS: Image ${i + 1} upload failed:`, {
                    error: error,
                    code: error.code,
                    message: error.message,
                    serverResponse: error.serverResponse
                  });
                  toast({
                    title: `Image ${i + 1} upload failed`,
                    description: `${error.code || ''} ${error.message || ''}`.trim(),
                    status: 'error',
                  });
                  reject(error);
                },
                async () => {
                  try {
                    console.log(`ADMIN PROJECTS: Image ${i + 1} uploaded successfully, getting download URL...`);
                    const downloadUrl = await getDownloadURL(storageRef);
                    console.log(`ADMIN PROJECTS: Got download URL for image ${i + 1}:`, downloadUrl);
                    imageUrls.push(downloadUrl);
                    imagePaths.push(storagePath);
                    resolve();
                  } catch (error) {
                    console.error(`ADMIN PROJECTS: Failed to get download URL for image ${i + 1}:`, error);
                    reject(error);
                  }
                }
              );
            });
          } catch (error) {
            console.error(`ADMIN PROJECTS: Error setting up upload for image ${i + 1}:`, error);
            throw error;
          }
        }
        
        console.log('ADMIN PROJECTS: All images uploaded successfully:', {
          totalImages: imageUrls.length,
          imageUrls: imageUrls,
          imagePaths: imagePaths
        });
      }

      // Save project to Firestore
      const projectData = {
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
        imagePath: imagePaths.length > 0 ? imagePaths[0] : null,
        images: imageUrls,
        imagePaths,
      };

      console.log('ADMIN PROJECTS: Saving to Firestore:', projectData);
      console.log('ADMIN PROJECTS: Images array length:', imageUrls.length);
      console.log('ADMIN PROJECTS: Image URLs:', imageUrls);
      
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      console.log('ADMIN PROJECTS: Document saved with ID:', docRef.id);

      toast({ title: "Project added successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error('ADMIN PROJECTS: Error adding project:', e);
      toast({ 
        title: "Failed to add project", 
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
        <ModalHeader>Add Project</ModalHeader>
        <ModalCloseButton isDisabled={uploading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Project Title</FormLabel>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter project title"
                maxLength={200}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <VStack align="stretch" spacing={2}>
                <Select 
                  value={category} 
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  placeholder="Select category"
                >
                  {projectCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__add_new__">+ Add New Category</option>
                </Select>
                
                {showNewCategoryInput && (
                  <HStack>
                    <Input 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                      maxLength={50}
                    />
                    <Button 
                      colorScheme="green" 
                      size="sm" 
                      onClick={handleAddNewCategory}
                      isDisabled={!newCategory.trim()}
                    >
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategory("");
                      }}
                    >
                      Cancel
                    </Button>
                  </HStack>
                )}
              </VStack>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Project Description</FormLabel>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe the project details, objectives, and outcomes"
                rows={6}
                maxLength={2000}
                resize="vertical"
              />
            </FormControl>

            <FormControl>
              <MultiImageUploadChakra
                images={images}
                onImagesChange={handleImagesChange}
                maxImages={8}
                maxSizeMB={5}
                disabled={uploading}
                label="Project Images"
                showExistingImages={false}
              />
            </FormControl>

            {uploading && (
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  {images.length > 0 ? 'Uploading images and saving project...' : 'Saving project...'}
                </Text>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${images.length > 0 ? uploadProgress : 100}%` }}
                  ></div>
                </div>
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
            loadingText="Adding Project"
          >
            Add Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
