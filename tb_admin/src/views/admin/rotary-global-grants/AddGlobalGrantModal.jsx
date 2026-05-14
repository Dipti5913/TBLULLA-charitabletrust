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
  HStack,
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
  InputGroup,
  InputLeftAddon,
  Box,
  Text,
} from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

export default function AddGlobalGrantModal({ isOpen, onClose }) {
  const toast = useToast();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState("");
  const [globalGrantValue, setGlobalGrantValue] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setProjectName("");
    setDescription("");
    setYear(new Date().getFullYear());
    setLocation("");
    setGlobalGrantValue("");
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      toast({ title: "Please enter a project name", status: "warning" });
      return;
    }
    
    if (!description.trim()) {
      toast({ title: "Please enter a description", status: "warning" });
      return;
    }

    if (!location.trim()) {
      toast({ title: "Please enter a location", status: "warning" });
      return;
    }

    if (!globalGrantValue.trim()) {
      toast({ title: "Please enter a Global Grant value", status: "warning" });
      return;
    }

    if (!year || year < 1900 || year > 2100) {
      toast({ title: "Please enter a valid year", status: "warning" });
      return;
    }

    console.log('ADMIN GLOBAL GRANT: Starting grant creation...');
    console.log('ADMIN GLOBAL GRANT: Firebase services check:', { 
      db: !!db,
      dbType: typeof db
    });

    if (!db) {
      console.error('ADMIN GLOBAL GRANT: Firebase Firestore not initialized:', { db });
      toast({
        title: "Firebase not connected",
        description: "Firestore is not initialized. Check Firebase configuration and reload the app.",
        status: "error",
        duration: 10000,
      });
      return;
    }

    setLoading(true);
    try {
      // Concatenate "Global Grant GG -" with the user input
      const fullGlobalGrant = `Global Grant GG - ${globalGrantValue.trim()}`;

      const grantData = {
        projectName: projectName.trim(),
        description: description.trim(),
        year: parseInt(year),
        location: location.trim(),
        globalGrant: fullGlobalGrant,
        globalGrantValue: globalGrantValue.trim(), // Store the value separately for potential future use
        createdAt: serverTimestamp(),
      };

      console.log('ADMIN GLOBAL GRANT: Saving to Firestore:', grantData);
      
      const docRef = await addDoc(collection(db, 'globalGrants'), grantData);
      console.log('ADMIN GLOBAL GRANT: Document saved with ID:', docRef.id);

      toast({ title: "Global Grant added successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error('ADMIN GLOBAL GRANT: Error adding grant:', e);
      toast({ 
        title: "Failed to add Global Grant", 
        description: `${e.code || ''} ${e.message || ''}`.trim(), 
        status: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i + 10); // Current year + 10 years back to 40 years back

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => { if (!loading) { reset(); onClose?.(); } }} 
      size={{ base: "full", sm: "md", md: "lg" }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent 
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: 8 }}
        maxH={{ base: "100vh", sm: "90vh" }}
      >
        <ModalHeader>Add Rotary Global Grant</ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Project Name</FormLabel>
              <Input 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)} 
                placeholder="Enter project name"
                maxLength={200}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter project description"
                rows={4}
                maxLength={1000}
                resize="vertical"
              />
            </FormControl>

            <HStack spacing={4}>
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
                <FormLabel>Location</FormLabel>
                <Input 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Enter project location"
                  maxLength={100}
                />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel>Global Grant</FormLabel>
              <VStack align="stretch" spacing={2}>
                <Box p={3} bg="blue.50" rounded="md" border="1px" borderColor="blue.200">
                  <Text fontSize="sm" color="blue.600" fontWeight="medium">
                    Prefix: <Text as="span" fontWeight="bold">Global Grant GG -</Text> (Permanent)
                  </Text>
                </Box>
                <InputGroup>
                  <InputLeftAddon bg="gray.100" color="gray.600" fontWeight="medium">
                    Global Grant GG -
                  </InputLeftAddon>
                  <Input 
                    value={globalGrantValue} 
                    onChange={(e) => setGlobalGrantValue(e.target.value)} 
                    placeholder="Enter grant number/value"
                    maxLength={50}
                  />
                </InputGroup>
                <Text fontSize="xs" color="gray.500">
                  Example: If you enter "2024001", it will be saved as "Global Grant GG - 2024001"
                </Text>
              </VStack>
            </FormControl>
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
            loadingText="Adding Grant"
          >
            Add Global Grant
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
