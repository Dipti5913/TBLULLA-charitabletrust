import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  VStack,
  Text,
  SimpleGrid,
  Image,
  IconButton,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiPlay, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import AddVideoModal from "./AddVideoModal";
import { db } from "../../../firebase";

function YouTubePlayerModal({ isOpen, onClose, youtubeId, title }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title || "Play video"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {youtubeId && (
            <Box position="relative" paddingTop="56.25%">
              <Box position="absolute" top={0} left={0} right={0} bottom={0}>
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={title || "YouTube video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ borderRadius: 8 }}
                />
              </Box>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default function VideoGallery() {
  const { isOpen, onOpen, onClose } = useDisclosure(); // add video modal
  const player = useDisclosure(); // player modal
  const toast = useToast();

  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVideos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (e) => {
        console.error(e);
        toast({ title: "Failed to load videos", status: "error" });
      }
    );
    return () => unsub();
  }, [toast]);

  const openPlayer = (v) => {
    setCurrent(v);
    player.onOpen();
  };

  const handleDelete = async (v) => {
    try {
      await deleteDoc(doc(db, "videos", v.id));
      toast({ title: "Video removed", status: "success" });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to delete video", status: "error" });
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <HStack justify="space-between" mb={6} align="start">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Video Gallery</Heading>
          <Text color="gray.500">List and manage embedded YouTube videos for your client's website.</Text>
        </VStack>
        <HStack>
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>
            Add Video
          </Button>
        </HStack>
      </HStack>

      {videos.length === 0 ? (
        <Box borderWidth="1px" borderStyle="dashed" rounded="lg" p={10} textAlign="center" color="gray.500">
          <Heading size="md" mb={2}>No videos yet</Heading>
          <Text mb={4}>Click "Add Video" to insert your first YouTube video.</Text>
          <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={onOpen}>Add Video</Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing={5}>
          {videos.map((v) => (
            <Box key={v.id} borderWidth="1px" rounded="lg" overflow="hidden" bg="white" _dark={{ bg: "navy.700" }}>
              <Box position="relative" cursor="pointer" onClick={() => openPlayer(v)}>
                <Image src={v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`} alt={v.title || "Video"} objectFit="cover" w="100%" h="220px" />
                <IconButton aria-label="Play" icon={<FiPlay />} size="sm" position="absolute" bottom={2} right={2} rounded="full" />
                <Menu placement="bottom-end">
                  <MenuButton as={IconButton} icon={<FiMoreVertical />} size="sm" position="absolute" top={2} right={2} aria-label="More" onClick={(e)=> e.stopPropagation()} />
                  <MenuList>
                    <MenuItem icon={<FiTrash2 />} onClick={(e)=> { e.stopPropagation(); handleDelete(v); }}>Delete</MenuItem>
                  </MenuList>
                </Menu>
              </Box>
              <Box p={4}>
                <Heading size="sm" noOfLines={1}>{v.title || "Untitled"}</Heading>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <AddVideoModal isOpen={isOpen} onClose={onClose} />
      <YouTubePlayerModal isOpen={player.isOpen} onClose={player.onClose} youtubeId={current?.youtubeId} title={current?.title} />
    </Box>
  );
}
