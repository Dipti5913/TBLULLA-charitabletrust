import React, { useState } from "react";
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
  Text,
  Progress,
  Alert,
  AlertIcon,
  Box,
  Image,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase";

export default function AddProjectModalFixed({ isOpen, onClose }) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState([]);

  const projectCategories = [
    "Shiku Anande",
    "Literacy", 
    "Rotary WASH",
    "Natural Calamities",
    "Health Care"
  ];

  const addDebugInfo = (message) => {
    console.log('DEBUG:', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const reset = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setSelectedFiles([]);
    setUploading(false);
    setUploadProgress(0);
    setDebugInfo([]);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    addDebugInfo(`Selected ${files.length} files`);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        addDebugInfo(`Rejected ${file.name}: not an image`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        addDebugInfo(`Rejected ${file.name}: too large (${Math.round(file.size / 1024 / 1024)}MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    addDebugInfo(`Accepted ${validFiles.length} valid files`);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    addDebugInfo(`Removed file at index ${index}`);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast({ title: "Please enter a project title", status: "warning" });
      return;
    }
    
    if (!description.trim()) {
      toast({ title: "Please enter a project description", status: "warning" });
      return;
    }

    if (!category.trim()) {
      toast({ title: "Please select a category", status: "warning" });
      return;
    }

    addDebugInfo('Starting project creation...');
    
    // Check Firebase services
    if (!db) {
      addDebugInfo('ERROR: Firestore not initialized');
      toast({
        title: "Firebase Error",
        description: "Firestore not initialized. Check console for details.",
        status: "error",
      });
      return;
    }

    if (!storage) {
      addDebugInfo('ERROR: Storage not initialized');
      toast({
        title: "Firebase Error", 
        description: "Storage not initialized. Check console for details.",
        status: "error",
      });
      return;
    }

    addDebugInfo(`Firebase services OK. Files to upload: ${selectedFiles.length}`);
    
    setUploading(true);
    setUploadProgress(0);

    try {
      const imageUrls = [];
      const imagePaths = [];

      // Upload images one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        addDebugInfo(`Uploading file ${i + 1}/${selectedFiles.length}: ${file.name}`);
        
        try {
          // Create unique filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2);
          const extension = file.name.split('.').pop() || 'jpg';
          const fileName = `project_${timestamp}_${randomId}.${extension}`;
          const storagePath = `projects/${fileName}`;
          
          addDebugInfo(`Storage path: ${storagePath}`);
          
          // Create storage reference
          const storageRef = ref(storage, storagePath);
          addDebugInfo(`Storage reference created`);
          
          // Upload file using uploadBytes (simpler than uploadBytesResumable)
          addDebugInfo(`Starting upload...`);
          const uploadResult = await uploadBytes(storageRef, file);
          addDebugInfo(`Upload completed. Size: ${uploadResult.metadata.size} bytes`);
          
          // Get download URL
          addDebugInfo(`Getting download URL...`);
          const downloadURL = await getDownloadURL(storageRef);
          addDebugInfo(`Download URL obtained: ${downloadURL.substring(0, 50)}...`);
          
          imageUrls.push(downloadURL);
          imagePaths.push(storagePath);
          
          // Update progress
          const progress = ((i + 1) / selectedFiles.length) * 100;
          setUploadProgress(progress);
          addDebugInfo(`Progress: ${Math.round(progress)}%`);
          
        } catch (uploadError) {
          addDebugInfo(`ERROR uploading file ${i + 1}: ${uploadError.message}`);
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
      }

      addDebugInfo(`All ${imageUrls.length} images uploaded successfully`);

      // Create project document
      const projectData = {
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        images: imageUrls,
        imagePaths: imagePaths,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
        imagePath: imagePaths.length > 0 ? imagePaths[0] : null,
        createdAt: serverTimestamp(),
      };

      addDebugInfo('Saving project to Firestore...');
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      addDebugInfo(`Project saved with ID: ${docRef.id}`);

      toast({ 
        title: "Success!", 
        description: `Project created with ${imageUrls.length} images`,
        status: "success" 
      });
      
      reset();
      onClose?.();

    } catch (error) {
      addDebugInfo(`ERROR: ${error.message}`);
      console.error('Project creation error:', error);
      toast({
        title: "Failed to create project",
        description: error.message,
        status: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!uploading) { reset(); onClose?.(); } }} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>Add Project (Fixed Version)</ModalHeader>
        <ModalCloseButton isDisabled={uploading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            
            {/* Debug Info */}
            {debugInfo.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>Debug Log:</Text>
                <Box 
                  maxH="100px" 
                  overflowY="auto" 
                  bg="gray.50" 
                  p={2} 
                  borderRadius="md"
                  fontSize="xs"
                  fontFamily="monospace"
                >
                  {debugInfo.map((info, i) => (
                    <Text key={i}>{info}</Text>
                  ))}
                </Box>
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel>Project Title</FormLabel>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter project title"
                isDisabled={uploading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select category"
                isDisabled={uploading}
              >
                {projectCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe the project"
                rows={4}
                isDisabled={uploading}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Project Images</FormLabel>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                isDisabled={uploading}
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Select multiple images (max 10MB each)
              </Text>
            </FormControl>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>Selected Files ({selectedFiles.length}):</Text>
                <SimpleGrid columns={3} spacing={2}>
                  {selectedFiles.map((file, index) => (
                    <Box key={index} position="relative" border="1px solid" borderColor="gray.200" borderRadius="md" p={2}>
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        boxSize="80px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        position="absolute"
                        top={1}
                        right={1}
                        onClick={() => removeFile(index)}
                        isDisabled={uploading}
                      />
                      <Text fontSize="xs" mt={1} noOfLines={1}>{file.name}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Upload Progress */}
            {uploading && (
              <Box>
                <Text fontSize="sm" mb={2}>
                  Uploading... {Math.round(uploadProgress)}%
                </Text>
                <Progress value={uploadProgress} colorScheme="blue" />
              </Box>
            )}

            {/* Firebase Status */}
            <Alert status={db && storage ? "success" : "error"}>
              <AlertIcon />
              Firebase Status: 
              Firestore {db ? "✅" : "❌"} | 
              Storage {storage ? "✅" : "❌"}
            </Alert>

          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={() => { reset(); onClose?.(); }} isDisabled={uploading}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit} 
            isLoading={uploading}
            loadingText="Creating Project..."
            isDisabled={!title || !category || !description}
          >
            Create Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}