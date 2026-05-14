import React, { useCallback, useMemo, useState } from "react";
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
  Input,
  Select,
  Box,
  Text,
  Image,
  useToast,
  Progress,
  useColorModeValue,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../../../firebase";

const MAX_FILES = 20;
const MAX_SIZE_MB = 8; // per file
const COMPRESSION_THRESHOLD_MB = 2; // Compress images above 2MB
const COMPRESSION_QUALITY = 0.8; // Compression quality (0.1 to 1.0)
const MAX_DIMENSION = 1920; // Max width/height after compression
const ACCEPT = {
  "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"]
};

// Image compression utility function
const compressImage = (file, quality = COMPRESSION_QUALITY, maxDimension = MAX_DIMENSION) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          // Create a new File object with the compressed blob
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg', // Always convert to JPEG for better compression
            lastModified: Date.now(),
          });
          
          // Add compression info to the file object
          compressedFile.originalSize = file.size;
          compressedFile.compressed = true;
          compressedFile.compressionRatio = ((file.size - blob.size) / file.size * 100).toFixed(1);
          
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export default function UploadPhotosModal({ isOpen, onClose }) {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ARGHYADAN 2010");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const borderColor = useColorModeValue("gray.300", "whiteAlpha.300");
  const activeColor = useColorModeValue("brand.500", "brand.300");

  const onDrop = useCallback(async (accepted, rejected) => {
    if (rejected?.length) {
      toast({ title: `Some files were rejected`, status: "warning" });
    }
    
    if (accepted.length === 0) return;
    
    setCompressing(true);
    setCompressionProgress(0);
    
    try {
      const processedFiles = [];
      let compressedCount = 0;
      
      for (let i = 0; i < accepted.length; i++) {
        const file = accepted[i];
        const fileSizeMB = file.size / (1024 * 1024);
        
        let processedFile = file;
        
        // Compress if file is larger than threshold
        if (fileSizeMB > COMPRESSION_THRESHOLD_MB) {
          try {
            processedFile = await compressImage(file);
            const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const newSizeMB = (processedFile.size / (1024 * 1024)).toFixed(2);
            
            toast({
              title: "Image compressed",
              description: `${file.name}: ${originalSizeMB}MB → ${newSizeMB}MB (${processedFile.compressionRatio}% reduction)`,
              status: "info",
              duration: 3000,
            });
            compressedCount++;
          } catch (error) {
            console.error('Compression failed for', file.name, error);
            toast({
              title: "Compression failed",
              description: `Failed to compress ${file.name}, using original file`,
              status: "warning",
            });
          }
        }
        
        // Add preview URL
        processedFile.preview = URL.createObjectURL(processedFile);
        processedFiles.push(processedFile);
        
        // Update progress
        setCompressionProgress(((i + 1) / accepted.length) * 100);
      }
      
      setFiles((prev) => {
        const next = [...prev, ...processedFiles].slice(0, MAX_FILES);
        return next;
      });
      
      if (compressedCount > 0) {
        toast({
          title: "Compression complete",
          description: `${compressedCount} image(s) were compressed to reduce file size`,
          status: "success",
        });
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Error processing files",
        description: "Some files could not be processed",
        status: "error",
      });
    } finally {
      setCompressing(false);
      setCompressionProgress(0);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple: true,
    onDrop,
  });

  const thumbs = useMemo(() => (
    <HStack spacing={3} wrap="wrap">
      {files.map((file, idx) => (
        <VStack key={idx} spacing={1} align="center">
          <Box boxSize="88px" rounded="md" overflow="hidden" borderWidth="1px">
            <Image src={file.preview} alt={file.name} objectFit="cover" w="100%" h="100%" />
          </Box>
          <Text fontSize="xs" maxW="100px" noOfLines={1}>{file.name}</Text>
        </VStack>
      ))}
    </HStack>
  ), [files]);

  const reset = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setTitle("");
    setCategory("ARGHYADAN 2010");
    setProgress(0);
    setUploading(false);
    setCompressing(false);
    setCompressionProgress(0);
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast({ title: "Please add at least one image", status: "warning" });
      return;
    }
    
    console.log('ADMIN UPLOAD: Starting upload process...');
    console.log('ADMIN UPLOAD: Firebase services check:', { 
      storage: !!storage, 
      db: !!db,
      storageType: typeof storage,
      dbType: typeof db
    });
    
    if (!storage || !db) {
      console.error('ADMIN UPLOAD: Firebase services not initialized:', { storage, db });
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

      const uploads = files.map(async (file) => {
        const ext = file.name.split(".").pop();
        const id = uuidv4();
        const storagePath = `photos/${Date.now()}-${id}.${ext}`;
        const storageRef = ref(storage, storagePath);
        const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

        await new Promise((resolve, reject) => {
          task.on(
            'state_changed',
            (snap) => {
              const totalPercent = ((completed + snap.bytesTransferred / snap.totalBytes) / files.length) * 100;
              setProgress(totalPercent);
            },
            (error) => {
              // Surface Firebase Storage error immediately
              console.error('Upload error:', error);
              toast({
                title: 'Upload failed',
                description: `${error.code || ''} ${error.message || ''}`.trim(),
                status: 'error',
              });
              reject(error);
            },
            () => resolve()
          );
        });
        const url = await getDownloadURL(storageRef);
        console.log('ADMIN UPLOAD: Got download URL:', url);
        
        const photoData = {
          title: title || file.name,
          category,
          url,
          storagePath,
          createdAt: serverTimestamp(),
        };
        console.log('ADMIN UPLOAD: Saving to Firestore:', photoData);
        
        const docRef = await addDoc(collection(db, 'photos'), photoData);
        console.log('ADMIN UPLOAD: Document saved with ID:', docRef.id);
        
        completed += 1;
        setProgress((completed / files.length) * 100);
      });

      await Promise.all(uploads);
      toast({ title: "Uploaded successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error(e);
      toast({ title: "Upload failed", description: `${e.code || ''} ${e.message || ''}`.trim(), status: "error" });
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!uploading) { reset(); onClose?.(); } }} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Photos</ModalHeader>
        <ModalCloseButton isDisabled={uploading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Box
              {...getRootProps()}
              borderWidth="2px"
              borderStyle="dashed"
              rounded="md"
              p={6}
              textAlign="center"
              cursor="pointer"
              borderColor={isDragActive ? activeColor : borderColor}
            >
              <input {...getInputProps()} />
              <Text fontWeight="semibold">Drag and drop images here, or click to select</Text>
              <Text fontSize="sm" color="gray.500">Up to {MAX_FILES} images • Max {MAX_SIZE_MB}MB each • Images over {COMPRESSION_THRESHOLD_MB}MB will be automatically compressed</Text>
            </Box>

            {files.length > 0 && (
              <VStack align="stretch" spacing={2}>
                <Text fontWeight="medium">Preview</Text>
                {thumbs}
              </VStack>
            )}

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title applied to all" />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option>ARGHYADAN 2010</option>
                  <option>SEVA 2011</option>
                  <option>KALAVISHKAR 2012</option>
                  <option>SEVA 2013</option>
                  <option>SHIKU AANANDE</option>
                  <option>CYBER CRIME AWARENESS SEMINAR</option>
                  <option>COFFEE TABLE BOOK 2013</option>
                  <option>OTHER</option>
                  <option>SHIKSHAN MAZA VASA 2017</option>
                  <option>AWARD FUNCTION</option>
                  <option>SHIKSHAN MAZA VASA 2018</option>
                  <option>SHIKSHAN MAZA VASA 2019</option>
                  <option>SHIKSHAN MAZA VASA 2020</option>
                  <option>ABHYANG SNAN ( DIWALI FIRST DAY)</option>
                  <option>ANKUR BALSHIKSHAN KARYKARM</option>
                  <option>AROGYASAKHI 2020</option>
                  <option>BASIC LIFE SUPPORT AMBULANCE AT KANAKAVLI</option>
                  <option>COVID -2020</option>
                  <option>DIALYSIS MACHINE AT HUBALI BY ROTARY GLOBAL GRANT</option>
                  <option>DIL DOSTI DUNIYADARI AANI MEE 2019</option>
                  <option>FLOOD 2019</option>
                  <option>JALDAN PROGRAM</option>
                  <option>KALI UMALATANA 2018</option>
                  <option>MASIK PALI VYAVASTHAPAN 2017</option>
                  <option>MOBILE HOSPITAL</option>
                  <option>NAMO DNANAYA 2015</option>
                  <option>PASHAN PALAVI 2013 & 2018</option>
                  <option>ROTARY HAPPY SCHOOL GOA GLOBAL GRANT</option>
                  <option>SANITARY NAPKIN DISPOSAL CONTAINER</option>
                  <option>SATYAM SHIVAM SUNDARAM AND SWARLATA</option>
                  <option>SHIKSHAN MAZA VASA 2021</option>
                  <option>SHIKSHAN MAZA VASA 2022</option>
                  <option>SHIKU ANANDE 2014</option>
                  <option>SHODH TARYANCHA(2018)</option>
                  <option>SHORT FILM SHIKU ANANDE 2017</option>
                  <option>SMART GIRL 2020</option>
                  <option>SOLAR ECLIPS 2020</option>
                  <option>SWARGARATHA(2017)</option>
                  <option>TESTING EQUIPMENT TO INCREASE COVID- 19 TESTING AT MIRAJ MEDICAL COLLAGE(2020)</option>
                  <option>SHIKU ANANDE 2020</option>
                  <option>VACHU LIHU ACTIVITY BOOK 2020</option>
                  <option>VISION TO POOR AVOIDABLE BLINDNESS(GLOBAL GRANT)</option>
                </Select>
              </FormControl>
            </HStack>

            {compressing && (
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" color="gray.500">Compressing images…</Text>
                <Progress value={compressionProgress} size="sm" colorScheme="blue" rounded="full" />
              </VStack>
            )}
            
            {uploading && (
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" color="gray.500">Uploading…</Text>
                <Progress value={progress} size="sm" colorScheme="brand" rounded="full" />
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={() => { reset(); onClose?.(); }} isDisabled={uploading || compressing}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleUpload} 
            isLoading={uploading} 
            loadingText="Uploading"
            isDisabled={compressing}
          >
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
