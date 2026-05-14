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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiTrash2, FiRefreshCw, FiCalendar, FiEdit2 } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase";
import AddEventModal from "./AddEventModal";
import EditEventModal from "./EditEventModal";

export default function Events() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const cancelRef = React.useRef();

  useEffect(() => {
    if (!db) {
      toast({
        title: "Firebase not connected",
        description: "Cannot load events. Please check Firebase configuration.",
        status: "error",
      });
      setLoading(false);
      return;
    }

    const q = query(collection(db, "events"), orderBy("year", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching events:", error);
        toast({
          title: "Error loading events",
          description: error.message,
          status: "error",
        });
        setLoading(false);
      }
    );

    return () => unsub();
  }, [toast]);

  const handleDelete = useCallback(
    async (event) => {
      try {
        console.log('EVENTS: Deleting event and associated images:', event);
        
        // Delete images from Firebase Storage
        const imagesToDelete = [];
        
        // Add image paths
        if (event.imagePaths && Array.isArray(event.imagePaths)) {
          imagesToDelete.push(...event.imagePaths);
        }
        
        // Delete images from storage
        for (const imagePath of imagesToDelete) {
          if (imagePath && imagePath.trim()) {
            try {
              const imageRef = ref(storage, imagePath);
              await deleteObject(imageRef);
              console.log('EVENTS: Successfully deleted image:', imagePath);
            } catch (imageError) {
              console.warn('EVENTS: Failed to delete image:', imagePath, imageError);
              // Continue with event deletion even if image deletion fails
            }
          }
        }
        
        // Delete document from Firestore
        await deleteDoc(doc(db, "events", event.id));
        console.log('EVENTS: Successfully deleted event document');
        
        toast({ title: "Event deleted successfully", status: "success" });
        onDeleteClose();
        setEventToDelete(null);
      } catch (error) {
        console.error("EVENTS: Error deleting event:", error);
        toast({
          title: "Error deleting event",
          description: error.message,
          status: "error",
        });
      }
    },
    [toast, onDeleteClose]
  );

  const openDeleteDialog = (event) => {
    setEventToDelete(event);
    onDeleteOpen();
  };

  const openEditDialog = (event) => {
    console.log('EVENTS: Opening edit dialog for event:', event);
    setEventToEdit(event);
    onEditOpen();
  };

  const handleEditClose = () => {
    setEventToEdit(null);
    onEditClose();
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Events</Heading>
          <Text color="gray.500">Manage events and their details.</Text>
        </VStack>
      </HStack>
      
      
      <HStack justify="space-between" mb={6} align="start">
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Event
          </Button>
        </HStack>
      </HStack>

      {loading ? (
        <Text>Loading events...</Text>
      ) : events.length === 0 ? (
        <Box textAlign="center" py={10}>
          <FiCalendar size={48} color="gray" style={{ margin: "0 auto 16px" }} />
          <Heading size="md" color="gray.500" mb={2}>
            No Events Yet
          </Heading>
          <Text color="gray.400" mb={4}>
            Start by adding your first event.
          </Text>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Event
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {events.map((event) => (
            <Card key={event.id} variant="outline">
              <CardBody>
                <HStack justify="space-between" align="start" mb={3}>
                  <Badge colorScheme="blue" fontSize="sm">
                    {event.year}
                  </Badge>
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
                        icon={<FiEdit2 />}
                        onClick={() => openEditDialog(event)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => openDeleteDialog(event)}
                        color="red.500"
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
                
                <VStack align="start" spacing={2}>
                  <Heading size="md" noOfLines={2}>
                    {event.title}
                  </Heading>
                  <Text color="gray.600" fontSize="sm" noOfLines={3}>
                    {event.description}
                  </Text>
                  {event.images && event.images.length > 0 && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={2}>
                        {event.images.length} Photo{event.images.length > 1 ? 's' : ''}
                      </Text>
                      <SimpleGrid columns={event.images.length > 1 ? 2 : 1} spacing={2}>
                        {event.images.slice(0, 4).map((imgUrl, idx) => (
                          <Box key={idx} position="relative">
                            <Image
                              src={imgUrl}
                              alt={`${event.title} photo ${idx + 1}`}
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.100"
                              objectFit="cover"
                              height="80px"
                              width="100%"
                              fallbackSrc="https://via.placeholder.com/150?text=Image"
                            />
                            {idx === 3 && event.images.length > 4 && (
                              <Box
                                position="absolute"
                                inset={0}
                                bg="blackAlpha.600"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text color="white" fontSize="sm" fontWeight="bold">
                                  +{event.images.length - 4}
                                </Text>
                              </Box>
                            )}
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AddEventModal isOpen={isOpen} onClose={onClose} />
      <EditEventModal isOpen={isEditOpen} onClose={handleEditClose} event={eventToEdit} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDelete(eventToDelete)}
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
