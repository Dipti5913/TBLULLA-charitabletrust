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
  Select,
  useToast,
  HStack,
  Text,
} from "@chakra-ui/react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase";
import MultiImageUploadChakra from "../../../components/MultiImageUploadChakra";

export default function EditProjectModal({ isOpen, onClose, project }) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingImagePaths, setExistingImagePaths] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [projectCategories, setProjectCategories] = useState([
    "Shiku Anande",
    "Literacy",
    "Rotary WASH",
    "Natural Calamities",
    "Health Care"
  ]);

  // Initialize form data when project changes
  useEffect(() => {
    if (project && isOpen) {
      console.log('EDIT PROJECT: Initializing with project data:', project);
      
      setTitle(project.title || "");
      setCategory(project.category || "");
      setDescription(project.description || "");
      
      // Handle existing images - prioritize images array over single imageUrl
      const existingImgs = [];
      const existingPaths = [];
      
      console.log('EDIT PROJECT: Raw project data:', {
        imageUrl: project.imageUrl,
        images: project.images,
        imagePaths: project.imagePaths
      });
      
      // First, handle multiple images array (preferred)
      if (project.images && Array.isArray(project.images) && project.images.length > 0) {
        existingImgs.push(...project.images);
        if (project.imagePaths && Array.isArray(project.imagePaths)) {
          existingPaths.push(...project.imagePaths);
        } else {
          // If no paths available, create empty paths
          existingPaths.push(...new Array(project.images.length).fill(""));
        }
      } 
      // Fallback to legacy single image only if no images array
      else if (project.imageUrl) {
        existingImgs.push(project.imageUrl);
        existingPaths.push(project.imagePath || "");
      }
      
      // Remove duplicates and ensure arrays match in length
      const uniqueImages = [...new Set(existingImgs)];
      const uniquePaths = existingPaths.slice(0, uniqueImages.length);
      
      // Ensure paths array matches images array length
      while (uniquePaths.length < uniqueImages.length) {
        uniquePaths.push("");
      }
      
      setExistingImages(uniqueImages);
      setExistingImagePaths(uniquePaths);
      setImages([]);
      setImagesToDelete([]);
      
      console.log('EDIT PROJECT: Set existing images:', uniqueImages);
      console.log('EDIT PROJECT: Set existing paths:', uniquePaths);
    }
  }, [project, isOpen]);

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
    setExistingImages([]);
    setExistingImagePaths([]);
    setImagesToDelete([]);
    setUploadProgress(0);
  };

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
  }, []);

  // Handle removal of existing images
  const handleRemoveExistingImage = useCallback((index) => {
    console.log('EDIT PROJECT: Removing existing image at index:', index);
    
    const imageToRemove = existingImages[index];
    const pathToRemove = existingImagePaths[index];
    
    if (imageToRemove) {
      // Add to deletion queue
      setImagesToDelete(prev => [...prev, { url: imageToRemove, path: pathToRemove }]);
      
      // Remove from existing arrays
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setExistingImagePaths(prev => prev.filter((_, i) => i !== index));
      
      console.log('EDIT PROJECT: Added to deletion queue:', { url: imageToRemove, path: pathToRemove });
    }
  }, [existingImages, existingImagePaths]);

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

    console.log('EDIT PROJECT: Starting project update...');
    console.log('EDIT PROJECT: Firebase services check:', { 
      db: !!db,
      storage: !!storage,
      project: !!project
    });

    if (!db || !storage) {
      console.error('EDIT PROJECT: Firebase services not initialized');
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
      // Step 1: Delete images marked for deletion from Firebase Storage
      console.log('EDIT PROJECT: Deleting marked images:', imagesToDelete);
      for (const imageToDelete of imagesToDelete) {
        if (imageToDelete.path && imageToDelete.path.trim()) {
          try {
            const deleteRef = ref(storage, imageToDelete.path);
            await deleteObject(deleteRef);
            console.log('EDIT PROJECT: Successfully deleted image from storage:', imageToDelete.path);
          } catch (deleteError) {
            console.warn('EDIT PROJECT: Failed to delete image from storage:', imageToDelete.path, deleteError);
            // Continue with update even if image deletion fails
          }
        }
      }

      // Step 2: Upload new images
      const newImageUrls = [];
      const newImagePaths = [];

      if (images.length > 0) {
        console.log('EDIT PROJECT: Uploading new images...');
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const ext = image.name?.split('.').pop() || 'jpg';
          const uniqueName = `${title.replace(/[^a-zA-Z0-9]/g, '_') || 'project'}_${Date.now()}_${i}.${ext}`;
          const storagePath = `projects/${uniqueName}`;
          const storageRef = ref(storage, storagePath);

          await new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, image);
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = ((i + snapshot.bytesTransferred / snapshot.totalBytes) / images.length) * 100;
                setUploadProgress(progress);
              },
              (error) => {
                console.error('EDIT PROJECT: Image upload failed:', error);
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
                  console.log('EDIT PROJECT: Successfully uploaded image:', downloadUrl);
                  resolve();
                } catch (error) {
                  console.error('EDIT PROJECT: Failed to get download URL:', error);
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

      // Step 4: Update project in Firestore
      const projectData = {
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        updatedAt: serverTimestamp(),
        imageUrl: allImageUrls.length > 0 ? allImageUrls[0] : null, // Keep first image as primary
        imagePath: allImagePaths.length > 0 ? allImagePaths[0] : null,
        images: allImageUrls,
        imagePaths: allImagePaths,
      };

      console.log('EDIT PROJECT: Updating Firestore with data:', projectData);
      
      const docRef = doc(db, 'projects', project.id);
      await updateDoc(docRef, projectData);
      
      console.log('EDIT PROJECT: Successfully updated project');

      toast({ title: "Project updated successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error('EDIT PROJECT: Error updating project:', e);
      toast({ 
        title: "Failed to update project", 
        description: `${e.code || ''} ${e.message || ''}`.trim(), 
        status: "error" 
      });
    } finally {
      setUploading(false);
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
        if (!uploading) { 
          handleCancel(); 
        } 
      }} 
      size="lg"
      closeOnOverlayClick={!uploading}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Project</ModalHeader>
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
                isDisabled={uploading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <VStack align="stretch" spacing={2}>
                <Select 
                  value={category} 
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  placeholder="Select category"
                  isDisabled={uploading}
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
                      isDisabled={uploading}
                    />
                    <Button 
                      colorScheme="green" 
                      size="sm" 
                      onClick={handleAddNewCategory}
                      isDisabled={!newCategory.trim() || uploading}
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
                      isDisabled={uploading}
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
                isDisabled={uploading}
              />
            </FormControl>

            <FormControl>
              <MultiImageUploadChakra
                images={images}
                onImagesChange={handleImagesChange}
                onRemoveExisting={handleRemoveExistingImage}
                existingImages={existingImages}
                maxImages={8}
                maxSizeMB={5}
                disabled={uploading}
                label="Project Images"
                showExistingImages={true}
              />
            </FormControl>

            {uploading && (
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  {images.length > 0 ? 'Uploading images and updating project...' : 'Updating project...'}
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
          <Button mr={3} onClick={handleCancel} isDisabled={uploading}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit} 
            isLoading={uploading} 
            loadingText="Updating Project"
          >
            Update Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}