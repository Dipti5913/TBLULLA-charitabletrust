/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  SimpleGrid,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Icon,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Heading,
  Spinner,
  Center,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useState, useEffect, useRef } from "react";
import { MdEmail, MdPhone, MdLocationOn, MdDelete, MdVisibility, MdRefresh } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default function ContactUs() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const brandColor = useColorModeValue("brand.500", "white");
  const bg = useColorModeValue("white", "navy.700");
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  // Fetch contacts from Firebase
  useEffect(() => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contact submissions",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    onViewOpen();
    
    // Mark as read if not already read
    if (!contact.isRead) {
      const contactRef = doc(db, 'contacts', contact.id);
      updateDoc(contactRef, { isRead: true }).catch(console.error);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContact) return;
    
    try {
      await deleteDoc(doc(db, 'contacts', deleteContact.id));
      toast({
        title: "Success",
        description: "Contact submission deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      setDeleteContact(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact submission",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleRefresh = () => {
    setLoading(true);
    // The useEffect will automatically refetch data
  };

  // Calculate statistics
  const unreadCount = contacts.filter(contact => !contact.isRead).length;
  const readCount = contacts.filter(contact => contact.isRead).length;

  if (loading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center h="400px" flexDirection="column">
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text fontSize="lg" color={textColor} mt="4">Loading contact submissions...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Header Section */}
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={textColor}>Contact Us</Heading>
          <Text color="gray.500">Manage contact form submissions and inquiries.</Text>
        </VStack>
      </HStack>
      
      <HStack justify="space-between" mb={6} align="start">
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
            New: {unreadCount}
          </Badge>
          <Badge colorScheme="green" variant="subtle" px={3} py={1}>
            Read: {readCount}
          </Badge>
          <Text fontSize="sm" color="gray.500">
            Total: {contacts.length}
          </Text>
        </HStack>
      </HStack>

      <Card px='0px' mb='20px'>
        <Flex px='25px' justify='space-between' mb='20px' align='center'>
          <Text
            color={textColor}
            fontSize='22px'
            fontWeight='700'
            lineHeight='100%'>
            Contact Submissions ({contacts.length})
          </Text>
        </Flex>
            
        {contacts.length === 0 ? (
          <Flex justify="center" align="center" h="300px" px="25px" flexDirection="column">
            <Icon as={MdEmail} boxSize="60px" color="gray.300" mb="4" />
            <Text fontSize="xl" fontWeight="semibold" color={textColor} mb="2">
              No Contact Submissions Yet
            </Text>
            <Text fontSize="md" color="gray.500" textAlign="center" maxW="400px">
              Contact form submissions from your website will appear here. 
              Make sure your contact form is properly configured to send data to Firebase.
            </Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 2, xl: 3 }} spacing="20px" px="25px" pb="25px">
            {contacts.map((contact) => (
              <Card key={contact.id} p="20px" bg={bg}>
                <VStack align="start" spacing="15px">
                  <HStack justify="space-between" w="100%">
                    <Badge 
                      colorScheme={contact.isRead ? "green" : "blue"}
                      variant="subtle"
                    >
                      {contact.isRead ? "Read" : "New"}
                    </Badge>
                    <HStack spacing="2">
                      <IconButton
                        aria-label="View contact"
                        icon={<Icon as={MdVisibility} />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleViewContact(contact)}
                      />
                      <IconButton
                        aria-label="Delete contact"
                        icon={<Icon as={MdDelete} />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          setDeleteContact(contact);
                          onDeleteOpen();
                        }}
                      />
                    </HStack>
                  </HStack>
                  
                  <VStack align="start" spacing="8px" w="100%">
                    <Text fontSize="lg" fontWeight="bold" color={textColor} noOfLines={1}>
                      {contact.name}
                    </Text>
                    
                    <HStack>
                      <Icon as={MdEmail} color="gray.500" />
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {contact.email}
                      </Text>
                    </HStack>
                    
                    {contact.phone && (
                      <HStack>
                        <Icon as={MdPhone} color="gray.500" />
                        <Text fontSize="sm" color="gray.500">
                          {contact.phone}
                        </Text>
                      </HStack>
                    )}
                    
                    {contact.city && (
                      <HStack>
                        <Icon as={MdLocationOn} color="gray.500" />
                        <Text fontSize="sm" color="gray.500">
                          {contact.city}
                        </Text>
                      </HStack>
                    )}
                    
                    {contact.subject && (
                      <Text fontSize="sm" fontWeight="semibold" color={textColorBrand} noOfLines={1}>
                        Subject: {contact.subject}
                      </Text>
                    )}
                    
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {contact.message}
                    </Text>
                    
                    <Text fontSize="xs" color="gray.400">
                      {formatDate(contact.createdAt)}
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Card>

      {/* View Contact Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contact Submission Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedContact && (
              <VStack align="start" spacing="20px">
                <HStack justify="space-between" w="100%">
                  <Text fontSize="xl" fontWeight="bold">
                    {selectedContact.name}
                  </Text>
                  <Badge 
                    colorScheme={selectedContact.isRead ? "green" : "blue"}
                    variant="subtle"
                  >
                    {selectedContact.isRead ? "Read" : "New"}
                  </Badge>
                </HStack>
                
                <VStack align="start" spacing="15px" w="100%">
                  <HStack>
                    <Icon as={MdEmail} color="blue.500" />
                    <Text><strong>Email:</strong> {selectedContact.email}</Text>
                  </HStack>
                  
                  {selectedContact.phone && (
                    <HStack>
                      <Icon as={MdPhone} color="green.500" />
                      <Text><strong>Phone:</strong> {selectedContact.phone}</Text>
                    </HStack>
                  )}
                  
                  {selectedContact.city && (
                    <HStack>
                      <Icon as={MdLocationOn} color="red.500" />
                      <Text><strong>City:</strong> {selectedContact.city}</Text>
                    </HStack>
                  )}
                  
                  {selectedContact.subject && (
                    <Box w="100%">
                      <Text fontWeight="bold" mb="2">Subject:</Text>
                      <Text bg={boxBg} p="3" borderRadius="md">
                        {selectedContact.subject}
                      </Text>
                    </Box>
                  )}
                  
                  <Box w="100%">
                    <Text fontWeight="bold" mb="2">Message:</Text>
                    <Text bg={boxBg} p="3" borderRadius="md" whiteSpace="pre-wrap">
                      {selectedContact.message}
                    </Text>
                  </Box>
                  
                  <Text fontSize="sm" color="gray.500">
                    <strong>Submitted:</strong> {formatDate(selectedContact.createdAt)}
                  </Text>
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onViewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Contact Submission
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this contact submission from{" "}
              <strong>{deleteContact?.name}</strong>? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteContact} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
