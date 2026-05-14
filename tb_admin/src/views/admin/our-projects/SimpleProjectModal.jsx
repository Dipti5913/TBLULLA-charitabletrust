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
  Box,
  Image,
  HStack,
  IconButton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase";

export default function SimpleProjectModal({ isOpen, onClose }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const categories = [
    "Shiku Anande",
    "Literacy",
    "Rotary WASH", 
    "Natural Calamities",
    "Health Care"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    // Filter valid image files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        console.log('Rejected non-image:', file.name);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        console.log('Rejected large file:', file.name, file.size);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    console.log('Valid files selected:', validFiles.length);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const reset = () => {
    setFormData({ title: "", category: "", description: "" });
    setSelectedFiles([]);
    setUploadStatus("");
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({ title: "कृपया project title भरा", status: "warning" });
      return;
    }
    if (!formData.category) {
      toast({ title: "कृपया category निवडा", status: "warning" });
      return;
    }
    if (!formData.description.trim()) {
      toast({ title: "कृपया description भरा", status: "warning" });
      return;
    }

    console.log('Starting project creation...');
    console.log('Form data:', formData);
    console.log('Files to upload:', selectedFiles.length);

    // Check Firebase
    if (!db || !storage) {
      console.error('Firebase not initialized:', { db: !!db, storage: !!storage });
      toast({
        title: "Firebase Error",
        description: "Firebase services not initialized",
        status: "error",
      });
      return;
    }

    setUploading(true);
    setUploadStatus("Starting upload...");

    try {
      const imageUrls = [];
      const imagePaths = [];

      // Upload each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadStatus(`Uploading image ${i + 1}/${selectedFiles.length}: ${file.name}`);
        
        // Create unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${randomId}.${extension}`;
        const storagePath = `projects/${fileName}`;

        console.log(`Uploading file ${i + 1}: ${fileName}`);

        try {
          // Upload to Firebase Storage
          const storageRef = ref(storage, storagePath);
          const uploadResult = await uploadBytes(storageRef, file);
          console.log(`Upload ${i + 1} completed:`, uploadResult.metadata.size, 'bytes');

          // Get download URL
          const downloadURL = await getDownloadURL(storageRef);
          console.log(`Download URL ${i + 1}:`, downloadURL);

          imageUrls.push(downloadURL);
          imagePaths.push(storagePath);

        } catch (uploadError) {
          console.error(`Error uploading file ${i + 1}:`, uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }
      }

      setUploadStatus("Saving project to database...");

      // Create project document
      const projectData = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        images: imageUrls,
        imagePaths: imagePaths,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null, // First image as primary
        imagePath: imagePaths.length > 0 ? imagePaths[0] : null,
        createdAt: serverTimestamp(),
      };

      console.log('Saving project data:', projectData);

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      console.log('Project saved with ID:', docRef.id);

      setUploadStatus("Project created successfully!");

      toast({
        title: "Success!",
        description: `Project "${formData.title}" created with ${imageUrls.length} images`,
        status: "success",
      });

      reset();
      onClose();

    } catch (error) {
      console.error('Project creation error:', error);
      setUploadStatus(`Error: ${error.message}`);
      toast({
        title: "Error creating project",
        description: error.message,
        status: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!uploading) { reset(); onClose(); } }} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>नया Project Add करें</ModalHeader>
        <ModalCloseButton isDisabled={uploading} />
        <ModalBody>
          <VStack spacing={4}>
            
            {/* Firebase Status */}
            <Alert status={db && storage ? "success" : "error"} size="sm">
              <AlertIcon />
              Firebase Status: DB {db ? "✅" : "❌"} | Storage {storage ? "✅" : "❌"}
            </Alert>

            {/* Title */}
            <FormControl isRequired>
              <FormLabel>Project Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Project का नाम लिखें"
                isDisabled={uploading}
              />
            </FormControl>

            {/* Category */}
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Category चुनें"
                isDisabled={uploading}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FormControl>

            {/* Description */}
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Project के बारे में विस्तार से लिखें"
                rows={4}
                isDisabled={uploading}
              />
            </FormControl>

            {/* File Upload */}
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
                Multiple images select कर सकते हैं (Max 10MB each)
              </Text>
            </FormControl>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <Box w="100%">
                <Text fontWeight="bold" mb={2}>
                  Selected Images ({selectedFiles.length}):
                </Text>
                <VStack spacing={2}>
                  {selectedFiles.map((file, index) => (
                    <HStack key={index} w="100%" p={2} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <VStack align="start" flex={1} spacing={0}>
                        <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                          {file.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </VStack>
                      <IconButton
                        icon={<CloseIcon />}
                        size="sm"
                        onClick={() => removeFile(index)}
                        isDisabled={uploading}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Upload Status */}
            {uploadStatus && (
              <Alert status={uploadStatus.includes('Error') ? 'error' : 'info'}>
                <AlertIcon />
                {uploadStatus}
              </Alert>
            )}

          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={() => { reset(); onClose(); }} isDisabled={uploading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={uploading}
            loadingText="Creating..."
            isDisabled={!formData.title || !formData.category || !formData.description}
          >
            Project Create करें
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}