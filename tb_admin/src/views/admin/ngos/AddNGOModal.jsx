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
} from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

export default function AddNGOModal({ isOpen, onClose }) {
  const toast = useToast();
  const [organizationName, setOrganizationName] = useState("");
  const [fieldOfWork, setFieldOfWork] = useState("");
  const [concernPerson, setConcernPerson] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setOrganizationName("");
    setFieldOfWork("");
    setConcernPerson("");
    setCity("");
    setAddress("");
    setEmail("");
    setWebsite("");
    setContactNumber("");
    setUploading(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateWebsite = (website) => {
    try {
      new URL(website);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!organizationName.trim()) {
      toast({ title: "Please enter organization name", status: "warning" });
      return;
    }
    
    if (!fieldOfWork.trim()) {
      toast({ title: "Please enter field of work", status: "warning" });
      return;
    }

    if (!concernPerson.trim()) {
      toast({ title: "Please enter concern person name", status: "warning" });
      return;
    }

    if (!city.trim()) {
      toast({ title: "Please enter city", status: "warning" });
      return;
    }

    if (email.trim() && !validateEmail(email.trim())) {
      toast({ title: "Please enter a valid email address", status: "warning" });
      return;
    }

    if (website.trim() && !validateWebsite(website.trim())) {
      toast({ title: "Please enter a valid website URL (include http:// or https://)", status: "warning" });
      return;
    }

    console.log('ADMIN NGOs: Starting NGO creation...');
    console.log('ADMIN NGOs: Firebase services check:', { 
      db: !!db,
      dbType: typeof db
    });

    if (!db) {
      console.error('ADMIN NGOs: Firebase services not initialized:', { db });
      toast({
        title: "Firebase not connected",
        description: "Firestore is not initialized. Check Firebase configuration and reload the app.",
        status: "error",
        duration: 10000,
      });
      return;
    }

    setUploading(true);
    try {
      // Save NGO to Firestore
      const ngoData = {
        organizationName: organizationName.trim(),
        fieldOfWork: fieldOfWork.trim(),
        concernPerson: concernPerson.trim(),
        city: city.trim(),
        address: address.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        contactNumber: contactNumber.trim() || null,
        createdAt: serverTimestamp(),
      };

      console.log('ADMIN NGOs: Saving to Firestore:', ngoData);
      
      const docRef = await addDoc(collection(db, 'ngos'), ngoData);
      console.log('ADMIN NGOs: Document saved with ID:', docRef.id);

      toast({ title: "NGO added successfully", status: "success" });
      reset();
      onClose?.();
    } catch (e) {
      console.error('ADMIN NGOs: Error adding NGO:', e);
      toast({ 
        title: "Failed to add NGO", 
        description: `${e.code || ''} ${e.message || ''}`.trim(), 
        status: "error" 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!uploading) { reset(); onClose?.(); } }} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add NGO</ModalHeader>
        <ModalCloseButton isDisabled={uploading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name of Organisation</FormLabel>
                <Input 
                  value={organizationName} 
                  onChange={(e) => setOrganizationName(e.target.value)} 
                  placeholder="Enter organization name"
                  maxLength={200}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Field Of Work</FormLabel>
                <Input 
                  value={fieldOfWork} 
                  onChange={(e) => setFieldOfWork(e.target.value)} 
                  placeholder="e.g., Education, Healthcare, Environment"
                  maxLength={100}
                />
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Concern Person</FormLabel>
                <Input 
                  value={concernPerson} 
                  onChange={(e) => setConcernPerson(e.target.value)} 
                  placeholder="Contact person name"
                  maxLength={100}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>City</FormLabel>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="City name"
                  maxLength={50}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Complete address"
                rows={3}
                maxLength={500}
                resize="vertical"
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="contact@organization.com"
                  maxLength={100}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input 
                  value={website} 
                  onChange={(e) => setWebsite(e.target.value)} 
                  placeholder="https://www.organization.com"
                  maxLength={200}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Contact Number</FormLabel>
              <Input 
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)} 
                placeholder="Phone number"
                maxLength={20}
              />
            </FormControl>
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
            loadingText="Adding NGO"
          >
            Add NGO
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
