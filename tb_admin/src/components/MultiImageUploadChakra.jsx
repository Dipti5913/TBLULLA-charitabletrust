import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  IconButton,
  SimpleGrid,
  useToast,
  FormLabel,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiX, FiUpload } from 'react-icons/fi';

const MultiImageUploadChakra = ({ 
  images = [], 
  onImagesChange, 
  onRemoveExisting,
  maxImages = 10, 
  maxSizeMB = 5,
  disabled = false,
  showExistingImages = true,
  existingImages = [],
  label = "Images"
}) => {
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        const error = file.errors[0];
        return `${file.file.name}: ${error.message}`;
      });
      toast({
        title: "Some files were rejected",
        description: errors.join(', '),
        status: "warning",
        duration: 5000,
      });
    }

    if (acceptedFiles.length === 0) return;

    const validFiles = [];
    const errors = [];

    acceptedFiles.forEach(file => {
      // Check if we haven't exceeded max images
      if (images.length + validFiles.length >= maxImages) {
        errors.push(`Maximum ${maxImages} images allowed`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast({
        title: "Upload limit reached",
        description: errors.join(', '),
        status: "warning",
        duration: 3000,
      });
    }

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      onImagesChange(newImages);
      
      toast({
        title: "Images added",
        description: `${validFiles.length} image(s) selected for upload`,
        status: "success",
        duration: 2000,
      });
    }
  }, [images, maxImages, onImagesChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: disabled || images.length >= maxImages,
  });

  const removeImage = useCallback((index) => {
    if (disabled) return;
    
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [disabled, images, onImagesChange]);

  const removeExistingImage = useCallback((index) => {
    if (disabled) return;
    
    console.log('MULTI_IMAGE_UPLOAD: Removing existing image at index:', index);
    
    // Call the parent component's remove function
    if (onRemoveExisting && typeof onRemoveExisting === 'function') {
      onRemoveExisting(index);
    } else {
      console.warn('MULTI_IMAGE_UPLOAD: onRemoveExisting function not provided');
    }
  }, [disabled, onRemoveExisting]);

  return (
    <VStack align="stretch" spacing={4}>
      {/* Existing Images Display */}
      {showExistingImages && existingImages && existingImages.length > 0 && (
        <Box>
          <FormLabel mb={2}>Current Images</FormLabel>
          <SimpleGrid columns={[2, 3, 4]} spacing={3}>
            {existingImages.map((imageUrl, index) => (
              <Box key={`existing-${index}`} position="relative" _hover={{ '& > button': { opacity: 1 } }}>
                <Image
                  src={imageUrl}
                  alt={`Existing ${index + 1}`}
                  boxSize="100px"
                  objectFit="cover"
                  borderRadius="md"
                  border="1px"
                  borderColor="gray.300"
                />
                {!disabled && (
                  <IconButton
                    icon={<FiX />}
                    size="xs"
                    colorScheme="red"
                    position="absolute"
                    top={-2}
                    right={-2}
                    opacity={0}
                    transition="opacity 0.2s"
                    onClick={() => removeExistingImage(index)}
                    aria-label="Remove existing image"
                  />
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* New Images Upload */}
      <Box>
        <FormLabel mb={2}>
          {existingImages && existingImages.length > 0 ? 'Add More Images' : label}
          {!disabled && (
            <Text as="span" fontSize="xs" color="gray.500" ml={2}>
              ({images.length}/{maxImages} selected)
            </Text>
          )}
        </FormLabel>
        
        {/* Upload Area */}
        <Box
          {...getRootProps()}
          borderWidth="2px"
          borderStyle="dashed"
          rounded="md"
          p={6}
          textAlign="center"
          cursor={disabled || images.length >= maxImages ? "not-allowed" : "pointer"}
          borderColor={isDragActive ? "blue.400" : "gray.300"}
          bg={isDragActive ? "blue.50" : "transparent"}
          opacity={disabled ? 0.5 : 1}
          transition="all 0.2s"
          _hover={!disabled && images.length < maxImages ? { borderColor: "gray.400" } : {}}
        >
          <input {...getInputProps()} />
          <VStack spacing={2}>
            <FiUpload size={24} color="gray" />
            <Text fontWeight="semibold" color="blue.600">
              {images.length >= maxImages 
                ? `Maximum ${maxImages} images reached` 
                : 'Drag and drop images here, or click to select'
              }
            </Text>
            <Text fontSize="sm" color="gray.500">
              Supports JPG, PNG, GIF, WebP • Max {maxSizeMB}MB each • Up to {maxImages} images
            </Text>
          </VStack>
        </Box>

        {/* Selected Images Preview */}
        {images.length > 0 && (
          <Box mt={4}>
            <Text fontWeight="medium" mb={2}>
              Selected Images ({images.length})
            </Text>
            <SimpleGrid columns={[2, 3, 4]} spacing={3}>
              {images.map((file, index) => (
                <Box key={`new-${index}`} position="relative" _hover={{ '& > button': { opacity: 1 } }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="md"
                    border="1px"
                    borderColor="gray.300"
                  />
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    bg="blackAlpha.600"
                    color="white"
                    fontSize="xs"
                    p={1}
                    borderBottomRadius="md"
                    noOfLines={1}
                  >
                    {file.name}
                  </Box>
                  {!disabled && (
                    <IconButton
                      icon={<FiX />}
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top={-2}
                      right={-2}
                      opacity={0}
                      transition="opacity 0.2s"
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                    />
                  )}
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default MultiImageUploadChakra;
