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
  HStack,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Text,
  Box,
  Progress,
  IconButton,
  Wrap,
  WrapItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { FiX, FiUpload, FiFile, FiImage } from "react-icons/fi";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase";

export default function AddSevaVicharModal({ isOpen, onClose }) {
  const toast = useToast();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const borderColor = useColorModeValue("gray.300", "whiteAlpha.300");
  const activeColor = useColorModeValue("brand.500", "brand.300");

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: uuidv4(),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    
    setFiles((prev) => [...prev, ...newFiles]);
    
    toast({
      title: `${acceptedFiles.length} file(s) added`,
      description: "Files are ready for upload",
      status: "success",
      duration: 2000,
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: true,
  });

  const removeFile = (fileId) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const reset = () => {
    // Revoke all object URLs
    files.forEach((f) => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    
    setFiles([]);
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setProgress(0);
    setUploading(false);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FiImage />;
    }
    return <FiFile />;
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({ title: "Please add at least one file", status: "warning" });
      return;
    }

    if (!year || year < 1900 || year > 2100) {
      toast({ title: "Please select a valid year", status: "warning" });
      return;
    }

    console.log('ADMIN SEVA VICHAR: Starting upload process...');
    console.log('ADMIN SEVA VICHAR: Firebase services check:', { 
      storage: !!storage, 
      db: !!db,
      storageType: typeof storage,
      dbType: typeof db
    });

    if (!storage || !db) {
      console.error('ADMIN SEVA VICHAR: Firebase services not initialized:', { storage, db });
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
      let completed = 0;
      const uploadedFiles = [];

      const uploads = files.map(async (fileObj) => {
        const { file } = fileObj;
        const ext = file.name.split(".").pop();
        const id = uuidv4();
        const fileName = `${file.name.split('.')[0]}_${id}.${ext}`;
        const storagePath = `sevaVichar/${year}/${month}/${fileName}`;
        const storageRef = ref(storage, storagePath);

        return new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file);
          
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Progress tracking per file
              const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`ADMIN SEVA VICHAR: File ${file.name} upload progress: ${fileProgress}%`);
            },
            (error) => {
              console.error(`ADMIN SEVA VICHAR: Upload failed for ${file.name}:`, error);
              toast({
                title: 'Upload failed',
                description: `${error.code || ''} ${error.message || ''}`.trim(),
                status: 'error',
              });
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(storageRef);
                console.log('ADMIN SEVA VICHAR: Got download URL:', url);
                
                uploadedFiles.push({
                  name: file.name,
                  url,
                  storagePath,
                  type: file.type,
                  size: file.size,
                });
                
                completed += 1;
                setProgress((completed / files.length) * 100);
                console.log(`ADMIN SEVA VICHAR: Completed ${completed}/${files.length} files`);
                resolve();
              } catch (error) {
                console.error(`ADMIN SEVA VICHAR: Error getting download URL for ${file.name}:`, error);
                reject(error);
              }
            }
          );
        });
      });

      await Promise.all(uploads);

      // Save to Firestore
      const sevaVicharData = {
        title: "Seva Vichar", // Permanent title as requested
        month: parseInt(month),
        year: parseInt(year),
        files: uploadedFiles,
        createdAt: serverTimestamp(),
      };

      console.log('ADMIN SEVA VICHAR: Saving to Firestore:', sevaVicharData);
      
      const docRef = await addDoc(collection(db, 'sevaVichar'), sevaVicharData);
      console.log('ADMIN SEVA VICHAR: Document saved with ID:', docRef.id);

      toast({ title: "Seva Vichar uploaded successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error('ADMIN SEVA VICHAR: Error uploading:', e);
      toast({ 
        title: "Upload failed", 
        description: `${e.code || ''} ${e.message || ''}`.trim(), 
        status: "error" 
      });
    } finally {
      setUploading(false);
    }
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!uploading) { reset(); onClose?.(); } }} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Seva Vichar</ModalHeader>
        <ModalCloseButton isDisabled={uploading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {/* Permanent Title Display */}
            <Box p={3} bg="blue.50" rounded="md" border="1px" borderColor="blue.200">
              <Text fontSize="sm" color="blue.600" fontWeight="medium">
                Title: <Text as="span" fontWeight="bold">Seva Vichar</Text> (Permanent)
              </Text>
            </Box>

            {/* Date Selection */}
            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Month</FormLabel>
                <Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Year</FormLabel>
                <Select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            {/* File Upload */}
            <FormControl>
              <FormLabel>Files (PDF, Images, Documents)</FormLabel>
              <Box
                {...getRootProps()}
                borderWidth="2px"
                borderStyle="dashed"
                rounded="md"
                p={6}
                textAlign="center"
                cursor="pointer"
                borderColor={isDragActive ? activeColor : borderColor}
                bg={isDragActive ? "blue.50" : "transparent"}
                transition="all 0.2s"
              >
                <input {...getInputProps()} />
                <VStack spacing={2}>
                  <FiUpload size={24} color="gray" />
                  <Text fontWeight="semibold">Drag and drop files here, or click to select</Text>
                  <Text fontSize="sm" color="gray.500">
                    Supports PDF, Images (JPG, PNG, GIF), and Documents • No file limit
                  </Text>
                </VStack>
              </Box>
            </FormControl>

            {/* File Preview */}
            {files.length > 0 && (
              <VStack align="stretch" spacing={3}>
                <Text fontWeight="medium">Selected Files ({files.length})</Text>
                <Wrap spacing={2} maxH="200px" overflowY="auto">
                  {files.map((fileObj) => (
                    <WrapItem key={fileObj.id}>
                      <HStack
                        spacing={2}
                        p={2}
                        bg="gray.50"
                        rounded="md"
                        border="1px"
                        borderColor="gray.200"
                        maxW="200px"
                      >
                        {getFileIcon(fileObj.file)}
                        <VStack spacing={0} align="start" flex={1} minW={0}>
                          <Text fontSize="xs" fontWeight="medium" noOfLines={1} title={fileObj.file.name}>
                            {fileObj.file.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </VStack>
                        <IconButton
                          icon={<FiX />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeFile(fileObj.id)}
                          isDisabled={uploading}
                        />
                      </HStack>
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            )}

            {/* Upload Progress */}
            {uploading && (
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" color="gray.500">Uploading files...</Text>
                <Progress value={progress} size="sm" colorScheme="brand" rounded="full" />
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  {Math.round(progress)}% complete
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
            loadingText="Uploading"
          >
            Upload Seva Vichar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
