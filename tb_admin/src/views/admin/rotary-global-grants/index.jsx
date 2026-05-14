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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiTrash2, FiRefreshCw, FiGlobe, FiMapPin } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import AddGlobalGrantModal from "./AddGlobalGrantModal";

export default function RotaryGlobalGrants() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const toast = useToast();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grantToDelete, setGrantToDelete] = useState(null);
  const cancelRef = React.useRef();

  useEffect(() => {
    if (!db) {
      toast({
        title: "Firebase not connected",
        description: "Cannot load Global Grants. Please check Firebase configuration.",
        status: "error",
      });
      setLoading(false);
      return;
    }

    const q = query(collection(db, "globalGrants"), orderBy("year", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const grantsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGrants(grantsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching Global Grants:", error);
        toast({
          title: "Error loading Global Grants",
          description: error.message,
          status: "error",
        });
        setLoading(false);
      }
    );

    return () => unsub();
  }, [toast]);

  const handleDelete = useCallback(
    async (grant) => {
      try {
        await deleteDoc(doc(db, "globalGrants", grant.id));
        toast({ title: "Global Grant deleted successfully", status: "success" });
        onDeleteClose();
        setGrantToDelete(null);
      } catch (error) {
        console.error("Error deleting Global Grant:", error);
        toast({
          title: "Error deleting grant",
          description: error.message,
          status: "error",
        });
      }
    },
    [toast, onDeleteClose]
  );

  const openDeleteDialog = (grant) => {
    setGrantToDelete(grant);
    onDeleteOpen();
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Rotary Global Grants</Heading>
          <Text color="gray.500">Manage Rotary Global Grant projects and their details.</Text>
        </VStack>
      </HStack>
      
      
      <HStack justify="space-between" mb={6} align="start">
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Global Grant
          </Button>
        </HStack>
      </HStack>

      {loading ? (
        <Text>Loading Global Grants...</Text>
      ) : grants.length === 0 ? (
        <Box textAlign="center" py={10}>
          <FiGlobe size={48} color="gray" style={{ margin: "0 auto 16px" }} />
          <Heading size="md" color="gray.500" mb={2}>
            No Global Grants Yet
          </Heading>
          <Text color="gray.400" mb={4}>
            Start by adding your first Rotary Global Grant project.
          </Text>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Global Grant
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {grants.map((grant) => (
            <Card key={grant.id} variant="outline" maxW="100%" overflow="hidden">
              <CardBody p={4}>
                <HStack justify="space-between" align="start" mb={3}>
                  <VStack align="start" spacing={1} flex="1" minW="0">
                    <Badge colorScheme="blue" fontSize="sm">
                      {grant.year}
                    </Badge>
                    <Badge colorScheme="green" fontSize="xs" noOfLines={1} maxW="100%">
                      {grant.globalGrant}
                    </Badge>
                  </VStack>
                  <Menu placement="bottom-end">
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      size="sm"
                      variant="ghost"
                      aria-label="More options"
                      flexShrink={0}
                    />
                    <MenuList>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => openDeleteDialog(grant)}
                        color="red.500"
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
                
                <VStack align="start" spacing={3} minH="120px">
                  <Heading size="md" noOfLines={2} wordBreak="break-word">
                    {grant.projectName}
                  </Heading>
                  
                  <HStack spacing={1} fontSize="sm" color="gray.600" minW="0" w="100%">
                    <FiMapPin flexShrink={0} />
                    <Text noOfLines={1} wordBreak="break-word">{grant.location}</Text>
                  </HStack>
                  
                  <Text color="gray.600" fontSize="sm" noOfLines={3} wordBreak="break-word">
                    {grant.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AddGlobalGrantModal isOpen={isOpen} onClose={onClose} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Global Grant
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{grantToDelete?.projectName}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDelete(grantToDelete)}
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
