import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  useDisclosure,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Link,
} from "@chakra-ui/react";
import { AddIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiTrash2, FiRefreshCw, FiUsers, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import AddNGOModal from "./AddNGOModal";

export default function NGOs() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const toast = useToast();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoToDelete, setNgoToDelete] = useState(null);
  const cancelRef = React.useRef();

  useEffect(() => {
    if (!db) {
      toast({
        title: "Firebase not connected",
        description: "Cannot load NGOs. Please check Firebase configuration.",
        status: "error",
      });
      setLoading(false);
      return;
    }

    const q = query(collection(db, "ngos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const ngosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNgos(ngosData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching NGOs:", error);
        toast({
          title: "Error loading NGOs",
          description: error.message,
          status: "error",
        });
        setLoading(false);
      }
    );

    return () => unsub();
  }, [toast]);

  const handleDelete = useCallback(
    async (ngo) => {
      try {
        // Delete document from Firestore
        await deleteDoc(doc(db, "ngos", ngo.id));
        toast({ title: "NGO deleted successfully", status: "success" });
        onDeleteClose();
        setNgoToDelete(null);
      } catch (error) {
        console.error("Error deleting NGO:", error);
        toast({
          title: "Error deleting NGO",
          description: error.message,
          status: "error",
        });
      }
    },
    [toast, onDeleteClose]
  );

  const openDeleteDialog = (ngo) => {
    setNgoToDelete(ngo);
    onDeleteOpen();
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg">NGOs</Heading>
          <Text color="gray.500">Manage NGO partnerships and directory.</Text>
        </VStack>
      </HStack>
      
      
      <HStack justify="space-between" mb={6} align="start">
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add NGO
          </Button>
        </HStack>
      </HStack>

      {loading ? (
        <Text>Loading NGOs...</Text>
      ) : ngos.length === 0 ? (
        <Box textAlign="center" py={10}>
          <FiUsers size={48} color="gray" style={{ margin: "0 auto 16px" }} />
          <Heading size="md" color="gray.500" mb={2}>
            No NGOs Yet
          </Heading>
          <Text color="gray.400" mb={4}>
            Start by adding your first NGO partner.
          </Text>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add NGO
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {ngos.map((ngo) => (
            <Card key={ngo.id} variant="outline">
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <Heading size="sm" noOfLines={2}>
                        {ngo.organizationName}
                      </Heading>
                      {ngo.fieldOfWork && (
                        <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                          {ngo.fieldOfWork}
                        </Badge>
                      )}
                    </VStack>
                    <Menu placement="bottom-end">
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        size="sm"
                        variant="ghost"
                        aria-label="More options"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<FiTrash2 />}
                          onClick={() => openDeleteDialog(ngo)}
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                  
                  <VStack align="start" spacing={2} fontSize="sm">
                    {ngo.concernPerson && (
                      <HStack>
                        <FiUsers size={14} />
                        <Text>{ngo.concernPerson}</Text>
                      </HStack>
                    )}
                    
                    {ngo.city && (
                      <HStack>
                        <FiMapPin size={14} />
                        <Text>{ngo.city}</Text>
                      </HStack>
                    )}
                    
                    {ngo.email && (
                      <HStack>
                        <FiMail size={14} />
                        <Link href={`mailto:${ngo.email}`} color="blue.500">
                          {ngo.email}
                        </Link>
                      </HStack>
                    )}
                    
                    {ngo.contactNumber && (
                      <HStack>
                        <FiPhone size={14} />
                        <Link href={`tel:${ngo.contactNumber}`} color="blue.500">
                          {ngo.contactNumber}
                        </Link>
                      </HStack>
                    )}
                    
                    {ngo.website && (
                      <HStack>
                        <ExternalLinkIcon boxSize={3} />
                        <Link href={ngo.website} isExternal color="blue.500">
                          Website
                        </Link>
                      </HStack>
                    )}
                  </VStack>
                  
                  {ngo.address && (
                    <Text color="gray.600" fontSize="xs" noOfLines={2}>
                      📍 {ngo.address}
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AddNGOModal isOpen={isOpen} onClose={onClose} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete NGO
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{ngoToDelete?.organizationName}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDelete(ngoToDelete)}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
