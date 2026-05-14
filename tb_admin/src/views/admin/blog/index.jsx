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
import { FiMoreVertical, FiTrash2, FiRefreshCw, FiEdit, FiCalendar } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase";
import AddBlogModal from "./AddBlogModal";

export default function Blog() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const toast = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const cancelRef = React.useRef();

  useEffect(() => {
    if (!db) {
      toast({
        title: "Firebase not connected",
        description: "Cannot load blog posts. Please check Firebase configuration.",
        status: "error",
      });
      setLoading(false);
      return;
    }

    const q = query(collection(db, "blogs"), orderBy("date", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const blogsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlogs(blogsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching blog posts:", error);
        toast({
          title: "Error loading blog posts",
          description: error.message,
          status: "error",
        });
        setLoading(false);
      }
    );

    return () => unsub();
  }, [toast]);

  const handleDelete = useCallback(
    async (blog) => {
      try {
        // Delete image from storage if exists
        if (blog.imageUrl && blog.imagePath) {
          try {
            await deleteObject(ref(storage, blog.imagePath));
          } catch (error) {
            console.warn(`Failed to delete image ${blog.imagePath}:`, error);
          }
        }

        // Delete document from Firestore
        await deleteDoc(doc(db, "blogs", blog.id));
        toast({ title: "Blog post deleted successfully", status: "success" });
        onDeleteClose();
        setBlogToDelete(null);
      } catch (error) {
        console.error("Error deleting blog post:", error);
        toast({
          title: "Error deleting blog post",
          description: error.message,
          status: "error",
        });
      }
    },
    [toast, onDeleteClose, storage]
  );

  const openDeleteDialog = (blog) => {
    setBlogToDelete(blog);
    onDeleteOpen();
  };

  const formatDate = (date) => {
    if (!date) return "No date";
    
    let dateObj;
    
    // Handle Firestore timestamp
    if (date.toDate) {
      dateObj = date.toDate();
    }
    // Handle regular date string or Date object
    else if (typeof date === 'string' || date instanceof Date) {
      dateObj = new Date(date);
    }
    else {
      return "Invalid date";
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    
    // Format date in Date-Month-Year format (e.g., "20-Sep-2024")
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Our Blog</Heading>
          <Text color="gray.500">Manage blog posts and articles.</Text>
        </VStack>
      </HStack>
      
      
      <HStack justify="space-between" mb={6} align="start">
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Blog Post
          </Button>
        </HStack>
      </HStack>

      {loading ? (
        <Text>Loading blog posts...</Text>
      ) : blogs.length === 0 ? (
        <Box textAlign="center" py={10}>
          <FiEdit size={48} color="gray" style={{ margin: "0 auto 16px" }} />
          <Heading size="md" color="gray.500" mb={2}>
            No Blog Posts Yet
          </Heading>
          <Text color="gray.400" mb={4}>
            Start by adding your first blog post.
          </Text>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Blog Post
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {blogs.map((blog) => (
            <Card key={blog.id} variant="outline">
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {/* Blog Image */}
                  {blog.imageUrl && (
                    <Box>
                      <Image
                        src={blog.imageUrl}
                        alt={blog.title}
                        borderRadius="md"
                        objectFit="cover"
                        w="100%"
                        h="200px"
                        fallbackSrc="https://via.placeholder.com/400x200?text=Blog+Image"
                      />
                    </Box>
                  )}
                  
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <Badge colorScheme="blue" fontSize="xs" leftIcon={<FiCalendar />}>
                        {formatDate(blog.date)}
                      </Badge>
                      <Heading size="sm" noOfLines={2}>
                        {blog.title}
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
                          onClick={() => openDeleteDialog(blog)}
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                  
                  <Text color="gray.600" fontSize="sm" noOfLines={3}>
                    {blog.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <AddBlogModal isOpen={isOpen} onClose={onClose} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Blog Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{blogToDelete?.title}"? This will also delete the associated image. This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => handleDelete(blogToDelete)}
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
