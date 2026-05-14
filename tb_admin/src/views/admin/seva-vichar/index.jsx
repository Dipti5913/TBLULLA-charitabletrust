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
  Image,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiTrash2, FiRefreshCw, FiFileText, FiImage } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase";
import AddSevaVicharModal from "./AddSevaVicharModal";

export default function SevaVichar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const toast = useToast();
  const [sevaVichars, setSevaVichars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const cancelRef = React.useRef();

  useEffect(() => {
    if (!db) {
      toast({
        title: "Firebase not connected",
        description: "Cannot load Seva Vichar entries. Please check Firebase configuration.",
        status: "error",
      });
      setLoading(false);
      return;
    }

    const q = query(collection(db, "sevaVichar"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const sevaVicharData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSevaVichars(sevaVicharData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching Seva Vichar entries:", error);
        toast({
          title: "Error loading Seva Vichar entries",
          description: error.message,
          status: "error",
        });
        setLoading(false);
      }
    );

    return () => unsub();
  }, [toast]);

  const handleDelete = useCallback(
    async (item) => {
      try {
        // Delete files from storage
        if (item.files && item.files.length > 0) {
          const deletePromises = item.files.map(async (file) => {
            if (file.storagePath) {
              try {
                await deleteObject(ref(storage, file.storagePath));
              } catch (error) {
                console.warn(`Failed to delete file ${file.storagePath}:`, error);
              }
            }
          });
          await Promise.all(deletePromises);
        }

        // Delete document from Firestore
        await deleteDoc(doc(db, "sevaVichar", item.id));
        toast({ title: "Seva Vichar entry deleted successfully", status: "success" });
        onDeleteClose();
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting Seva Vichar entry:", error);
        toast({
          title: "Error deleting entry",
          description: error.message,
          status: "error",
        });
      }
    },
    [toast, onDeleteClose, storage]
  );

  const openDeleteDialog = (item) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const getMonthName = (monthNum) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNum - 1] || monthNum;
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <FiImage />;
    }
    return <FiFileText />;
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Seva Vichar</Heading>
          <Text color="gray.500">Manage Seva Vichar publications and documents.</Text>
        </VStack>
      </HStack>
      
      
      <HStack justify="space-between" mb={6} align="start">
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Seva Vichar
          </Button>
        </HStack>
      </HStack>

      {loading ? (
        <Text>Loading Seva Vichar entries...</Text>
      ) : sevaVichars.length === 0 ? (
        <Box textAlign="center" py={10}>
          <FiFileText size={48} color="gray" style={{ margin: "0 auto 16px" }} />
          <Heading size="md" color="gray.500" mb={2}>
            No Seva Vichar Entries Yet
          </Heading>
          <Text color="gray.400" mb={4}>
            Start by adding your first Seva Vichar publication.
          </Text>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Seva Vichar
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {sevaVichars.map((item) => (
            <Card key={item.id} variant="outline">
              <CardBody>
                <HStack justify="space-between" align="start" mb={3}>
                  <VStack align="start" spacing={1}>
                    <Badge colorScheme="blue" fontSize="sm">
                      {getMonthName(item.month)} {item.year}
                    </Badge>
                    <Heading size="sm" color="brand.500">
                      Seva Vichar
                    </Heading>
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
                        onClick={() => openDeleteDialog(item)}
                        color="red.500"
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
                
                {/* Files Display */}
                {item.files && item.files.length > 0 && (
                  <VStack align="start" spacing={3}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                      Files ({item.files.length})
                    </Text>
                    <Wrap spacing={2}>
                      {item.files.slice(0, 6).map((file, index) => (
                        <WrapItem key={index}>
                          <HStack
                            spacing={2}
                            p={2}
                            bg="gray.50"
                            rounded="md"
                            fontSize="xs"
                            maxW="120px"
                          >
                            {getFileIcon(file.name)}
                            <Text noOfLines={1} title={file.name}>
                              {file.name}
                            </Text>
                          </HStack>
                        </WrapItem>
                      ))}
                      {item.files.length > 6 && (
                        <WrapItem>
                          <Text fontSize="xs" color="gray.500" p={2}>
                            +{item.files.length - 6} more
                          </Text>
                        </WrapItem>
                      )}
                    </Wrap>
                  </VStack>
                )}
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AddSevaVicharModal isOpen={isOpen} onClose={onClose} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Seva Vichar Entry
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the Seva Vichar entry for {itemToDelete && `${getMonthName(itemToDelete.month)} ${itemToDelete.year}`}? This will also delete all associated files. This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDelete(itemToDelete)}
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
