import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Button,
  Icon,
  Image,
  VStack,
  HStack,
  useDisclosure,
  useToast,
  Badge,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase";
import UploadPhotosModal from "./UploadPhotosModal";

export default function PhotoGallery() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPhotos(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast({ title: "Failed to load photos", status: "error" });
        setLoading(false);
      }
    );
    return () => unsub();
  }, [toast]);

  const handleDelete = useCallback(
    async (p) => {
      try {
        // delete storage object first
        if (p.storagePath) {
          await deleteObject(ref(storage, p.storagePath));
        }
        // delete firestore doc
        await deleteDoc(doc(db, "photos", p.id));
        toast({ title: "Photo removed", status: "success" });
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to delete photo", status: "error" });
      }
    },
    [toast]
  );

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Photo Gallery</Heading>
          <Text color="gray.500">List and manage photos for your client's website.</Text>
        </VStack>
      </HStack>
      
      
      <HStack justify="space-between" mb={6} align="start">
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Photos
          </Button>
        </HStack>
      </HStack>

      {loading ? (
        <HStack justify="center" py={20}>
          <Spinner />
          <Text>Loading photos…</Text>
        </HStack>
      ) : photos.length === 0 ? (
        <Box
          borderWidth="1px"
          borderStyle="dashed"
          rounded="lg"
          p={10}
          textAlign="center"
          color="gray.500"
        >
          <Heading size="md" mb={2}>No photos yet</Heading>
          <Text mb={4}>Click "Add Photos" to upload your first images.</Text>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>Add Photos</Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing={5}>
          {photos.map((p) => (
            <Box key={p.id} borderWidth="1px" rounded="lg" overflow="hidden" bg="white" _dark={{ bg: "navy.700" }}>
              <Box position="relative">
                <Image src={p.url} alt={p.title || "Photo"} objectFit="cover" w="100%" h="220px" />
                <Badge position="absolute" top={2} left={2} colorScheme="purple" rounded="md">
                  {p.category || "General"}
                </Badge>
                <Menu placement="bottom-end">
                  <MenuButton as={IconButton} icon={<FiMoreVertical />} size="sm" position="absolute" top={2} right={2} aria-label="More" />
                  <MenuList>
                    <MenuItem icon={<FiTrash2 />} onClick={() => handleDelete(p)}>Delete</MenuItem>
                  </MenuList>
                </Menu>
              </Box>
              <Box p={4}>
                <Heading size="sm" noOfLines={1}>{p.title || "Untitled"}</Heading>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <UploadPhotosModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}
