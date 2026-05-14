import React, { useMemo, useState } from "react";
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
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

function extractYouTubeId(input) {
  if (!input) return null;
  // Accept URLs like https://www.youtube.com/watch?v=VIDEOID, youtu.be/VIDEOID, or raw IDs
  const urlMatch = input.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i);
  if (urlMatch && urlMatch[1]) return urlMatch[1];
  // If it's exactly 11-char ID
  if (/^[\w-]{11}$/.test(input)) return input;
  return null;
}

export default function AddVideoModal({ isOpen, onClose }) {
  const toast = useToast();
  const [urlOrId, setUrlOrId] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const youtubeId = useMemo(() => extractYouTubeId(urlOrId), [urlOrId]);
  const thumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

  const onSave = async () => {
    if (!youtubeId) {
      toast({ title: "Enter a valid YouTube URL or ID", status: "warning" });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "videos"), {
        youtubeId,
        title: title || null,
        thumbnailUrl: thumbnail,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Video added", status: "success" });
      setUrlOrId("");
      setTitle("");
      onClose?.();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to add video", description: e.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !loading && onClose?.()} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add YouTube Video</ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>YouTube URL or ID</FormLabel>
              <Input placeholder="https://youtu.be/XXXXXXXXXXX or VIDEO_ID" value={urlOrId} onChange={(e) => setUrlOrId(e.target.value)} />
              {!youtubeId && urlOrId && (
                <Text color="red.400" fontSize="sm" mt={1}>Could not parse a valid YouTube ID.</Text>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
            </FormControl>
            {thumbnail && (
              <VStack>
                <Text fontSize="sm" color="gray.500">Preview</Text>
                <img src={thumbnail} alt="thumbnail" style={{ width: 320, borderRadius: 8 }} />
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={() => onClose?.()} isDisabled={loading}>Cancel</Button>
          <Button colorScheme="brand" onClick={onSave} isLoading={loading} loadingText="Saving">Add Video</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
