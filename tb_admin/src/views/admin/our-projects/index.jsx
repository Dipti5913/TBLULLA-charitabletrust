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
  SimpleGrid as ChakraImageGrid,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiTrash2, FiRefreshCw, FiBriefcase, FiEdit2 } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase";
import AddProjectModal from "./AddProjectModal";
import AddProjectModalFixed from "./AddProjectModalFixed";
import SimpleProjectModal from "./SimpleProjectModal";
import EditProjectModal from "./EditProjectModal";
import FirebaseDebugger from "../../../components/FirebaseDebugger";
import QuickFirebaseTest from "../../../components/QuickFirebaseTest";

export default function OurProjects() {
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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const cancelRef = React.useRef();

  useEffect(() => {
    console.log('PROJECTS INDEX: Starting projects fetch...', {
      db: !!db,
      storage: !!storage
    });

    if (!db) {
      console.error('PROJECTS INDEX: Firebase not connected');
      toast({
        title: "Firebase not connected",
        description: "Cannot load projects. Please check Firebase configuration.",
        status: "error",
      });
      setLoading(false);
      return;
    }

    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log('PROJECTS INDEX: Received snapshot:', {
          size: snapshot.size,
          empty: snapshot.empty,
          docs: snapshot.docs.length
        });

        const projectsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log(`PROJECTS INDEX: Project ${doc.id}:`, {
            title: data.title,
            category: data.category,
            hasImages: !!data.images,
            imagesCount: data.images?.length || 0,
            hasImageUrl: !!data.imageUrl,
            imageUrl: data.imageUrl,
            images: data.images
          });

          return {
            id: doc.id,
            ...data,
          };
        });

        console.log('PROJECTS INDEX: Final projects data:', projectsData);
        setProjects(projectsData);
        setLoading(false);
      },
      (error) => {
        console.error("PROJECTS INDEX: Error fetching projects:", error);
        toast({
          title: "Error loading projects",
          description: error.message,
          status: "error",
        });
        setLoading(false);
      }
    );

    return () => unsub();
  }, [toast]);

  const handleDelete = useCallback(
    async (project) => {
      try {
        console.log('PROJECTS: Deleting project and associated images:', project);
        
        // Delete images from Firebase Storage
        const imagesToDelete = [];
        
        // Add legacy single image path
        if (project.imagePath) {
          imagesToDelete.push(project.imagePath);
        }
        
        // Add multiple image paths
        if (project.imagePaths && Array.isArray(project.imagePaths)) {
          imagesToDelete.push(...project.imagePaths);
        }
        
        // Delete images from storage
        for (const imagePath of imagesToDelete) {
          if (imagePath && imagePath.trim()) {
            try {
              const imageRef = ref(storage, imagePath);
              await deleteObject(imageRef);
              console.log('PROJECTS: Successfully deleted image:', imagePath);
            } catch (imageError) {
              console.warn('PROJECTS: Failed to delete image:', imagePath, imageError);
              // Continue with project deletion even if image deletion fails
            }
          }
        }
        
        // Delete document from Firestore
        await deleteDoc(doc(db, "projects", project.id));
        console.log('PROJECTS: Successfully deleted project document');
        
        toast({ title: "Project deleted successfully", status: "success" });
        onDeleteClose();
        setProjectToDelete(null);
      } catch (error) {
        console.error("PROJECTS: Error deleting project:", error);
        toast({
          title: "Error deleting project",
          description: error.message,
          status: "error",
        });
      }
    },
    [toast, onDeleteClose]
  );

  const openDeleteDialog = (project) => {
    setProjectToDelete(project);
    onDeleteOpen();
  };

  const openEditDialog = (project) => {
    console.log('PROJECTS: Opening edit dialog for project:', project);
    setProjectToEdit(project);
    onEditOpen();
  };

  const handleEditClose = () => {
    setProjectToEdit(null);
    onEditClose();
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Our Projects</Heading>
          <Text color="gray.500">Manage project portfolio and showcase.</Text>
        </VStack>
      </HStack>
      
      
      <HStack justify="space-between" mb={6} align="start">
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Project
          </Button>
        </HStack>
      </HStack>

      {/* Quick Firebase Test - Remove after fixing */}
      {import.meta.env.DEV && (
        <Box mb={6}>
          <QuickFirebaseTest />
        </Box>
      )}

      {loading ? (
        <Text>Loading projects...</Text>
      ) : projects.length === 0 ? (
        <Box textAlign="center" py={10}>
          <FiBriefcase size={48} color="gray" style={{ margin: "0 auto 16px" }} />
          <Heading size="md" color="gray.500" mb={2}>
            No Projects Yet
          </Heading>
          <Text color="gray.400" mb={4}>
            Start by adding your first project.
          </Text>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Project
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {projects.map((project) => (
            <Card key={project.id} variant="outline">
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <Heading size="sm" noOfLines={2}>
                        {project.title}
                      </Heading>
                      {project.category && (
                        <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                          {project.category}
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
                          icon={<FiEdit2 />}
                          onClick={() => openEditDialog(project)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<FiTrash2 />}
                          onClick={() => openDeleteDialog(project)}
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                  
                  {/* Images Display - Enhanced */}
                  {((project.images && project.images.length > 0) || project.imageUrl) && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={2}>
                        {project.images?.length || 1} Photo{(project.images?.length || 1) > 1 ? 's' : ''}
                      </Text>
                      <SimpleGrid columns={2} spacing={2}>
                        {/* Display multiple images if available */}
                        {project.images && project.images.length > 0 ? (
                          project.images.slice(0, 4).map((img, idx) => (
                            <Box key={`${project.id}-img-${idx}`} position="relative">
                              <Image
                                src={img}
                                alt={`${project.title} photo ${idx + 1}`}
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.100"
                                objectFit="cover"
                                height="80px"
                                width="100%"
                                fallbackSrc="https://via.placeholder.com/150?text=Loading"
                                onError={(e) => {
                                  console.log('Image load error:', img);
                                  e.target.src = "https://via.placeholder.com/150?text=Error";
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', img);
                                }}
                              />
                              {idx === 3 && project.images.length > 4 && (
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
                                    +{project.images.length - 4}
                                  </Text>
                                </Box>
                              )}
                            </Box>
                          ))
                        ) : (
                          /* Fallback to single imageUrl */
                          project.imageUrl && (
                            <Box gridColumn="span 2">
                              <Image
                                src={project.imageUrl}
                                alt={`${project.title} photo`}
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.100"
                                objectFit="cover"
                                height="80px"
                                width="100%"
                                fallbackSrc="https://via.placeholder.com/150?text=Loading"
                                onError={(e) => {
                                  console.log('Single image load error:', project.imageUrl);
                                  e.target.src = "https://via.placeholder.com/150?text=Error";
                                }}
                              />
                            </Box>
                          )
                        )}
                      </SimpleGrid>
                    </Box>
                  )}
                  
                  {/* Debug Info - Show in development */}
                  {import.meta.env.DEV && (
                    <Box fontSize="xs" color="gray.400" bg="gray.50" p={2} borderRadius="md">
                      <Text>Debug: ID={project.id}</Text>
                      <Text>Images: {project.images?.length || 0}</Text>
                      <Text>ImageUrl: {project.imageUrl ? '✅' : '❌'}</Text>
                      {project.images?.length > 0 && (
                        <Text>First URL: {project.images[0]?.substring(0, 30)}...</Text>
                      )}
                    </Box>
                  )}

                  <Text color="gray.600" fontSize="sm" noOfLines={4}>
                    {project.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <SimpleProjectModal isOpen={isOpen} onClose={onClose} />
      <EditProjectModal isOpen={isEditOpen} onClose={handleEditClose} project={projectToEdit} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Project
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDelete(projectToDelete)}
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
