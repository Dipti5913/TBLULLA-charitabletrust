import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  IconButton,
  Badge,
  Progress,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { addDoc, collection, serverTimestamp, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { storage, db } from "../../../firebase";

export default function AnnualReports() {
  const toast = useToast();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [label, setLabel] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load existing annual reports from Firestore
  useEffect(() => {
    if (!db) {
      setLoading(false);
      toast({ title: "Firebase not connected", status: "error" });
      return;
    }
    try {
      const q = query(collection(db, "annualReports"), orderBy("year", "desc"));
      const unsub = onSnapshot(
        q,
        (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setReports(items);
          setLoading(false);
        },
        (err) => {
          console.error("AnnualReports: fetch error", err);
          toast({ title: "Failed to load reports", description: err.message, status: "error" });
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [toast]);

  // Helper function to format year as academic year (e.g., 2025 -> 2025-26)
  const formatAcademicYear = (year) => {
    const currentYear = parseInt(year);
    const nextYear = (currentYear + 1).toString().slice(-2);
    return `${currentYear}-${nextYear}`;
  };

  const grouped = useMemo(() => {
    const map = new Map();
    reports.forEach((r) => {
      const y = (r.year || "").toString();
      if (!y) return;
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(r);
    });
    // sort entries within each year by createdAt if present
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });
    }
    // sort years desc
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([year, items]) => ({ year: formatAcademicYear(year), originalYear: year, items }));
  }, [reports]);

  const onFileChange = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  };

  const resetForm = () => {
    setFiles([]);
    setLabel("");
    setProgress(0);
    setUploading(false);
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast({ title: "Select at least one PDF", status: "warning" });
      return;
    }
    if (!year) {
      toast({ title: "Enter a year", status: "warning" });
      return;
    }
    if (!storage || !db) {
      toast({ title: "Firebase not initialized", status: "error" });
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      let done = 0;
      for (const file of files) {
        const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        const isImage = file.type?.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
        if (!isPdf && !isImage) {
          toast({ title: `${file.name} is not a supported type (PDF or image)`, status: "warning" });
          continue;
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]+/g, "-");
        const folder = isPdf ? 'pdfs' : 'images';
        const storagePath = `annual-reports/${folder}/${year}/${Date.now()}-${uuidv4()}-${safeName}`;
        const storageRef = ref(storage, storagePath);
        const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

        await new Promise((resolve, reject) => {
          task.on(
            "state_changed",
            (snap) => {
              const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
              const total = ((done + pct / 100) / files.length) * 100;
              setProgress(total);
            },
            (err) => reject(err),
            () => resolve()
          );
        });

        const url = await getDownloadURL(storageRef);
        const baseName = file.name.replace(/\.(pdf|png|jpe?g|webp|gif)$/i, "");
        const finalLabel = label?.trim() ? `${label.trim()} - ${baseName}` : baseName;
        const docData = {
          year: year.toString(),
          kind: isPdf ? 'pdf' : 'image',
          label: finalLabel,
          url,
          storagePath,
          contentType: file.type || (isPdf ? 'application/pdf' : ''),
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "annualReports"), docData);
        done += 1;
        setProgress((done / files.length) * 100);
      }

      toast({ title: "Uploaded successfully", status: "success" });
      resetForm();
    } catch (e) {
      console.error(e);
      toast({ title: "Upload failed", description: e.message, status: "error" });
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      if (!db || !storage) throw new Error("Firebase not initialized");
      if (item.storagePath) {
        await deleteObject(ref(storage, item.storagePath));
      }
      await deleteDoc(doc(db, "annualReports", item.id));
      toast({ title: "Deleted", status: "success" });
    } catch (e) {
      console.error(e);
      toast({ title: "Delete failed", description: e.message, status: "error" });
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Heading size="lg" mb={2}>
        Annual Reports
      </Heading>
      <Text color="gray.500" mb={6}>
        Upload PDF documents by year. These will appear on the client Annual Reports page.
      </Text>

      <VStack align="stretch" spacing={4} mb={8}>
        <HStack align="end" spacing={4}>
          <FormControl maxW="200px">
            <FormLabel>Year</FormLabel>
            <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Will display as {formatAcademicYear(year || new Date().getFullYear())}
            </Text>
          </FormControl>
          <FormControl>
            <FormLabel>Label prefix (optional)</FormLabel>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Annual Report" />
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>PDFs or Images</FormLabel>
          <Input type="file" accept="application/pdf,image/*" multiple onChange={onFileChange} />
          {files.length > 0 && (
            <Text mt={2} fontSize="sm" color="gray.600">{files.length} file(s) selected</Text>
          )}
        </FormControl>

        {uploading && (
          <VStack align="stretch" spacing={1}>
            <Text fontSize="sm" color="gray.600">Uploading…</Text>
            <Progress value={progress} size="sm" colorScheme="blue" rounded="full" />
          </VStack>
        )}

        <HStack>
          <Button leftIcon={<FiUploadCloud />} colorScheme="brand" onClick={handleUpload} isLoading={uploading} loadingText="Uploading">
            Upload PDFs
          </Button>
          <Button variant="outline" onClick={resetForm} isDisabled={uploading}>Clear</Button>
        </HStack>
      </VStack>

      <Box>
        {loading ? (
          <Text>Loading reports…</Text>
        ) : grouped.length === 0 ? (
          <Text color="gray.500">No reports uploaded yet.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {grouped.map((group) => (
              <Card key={group.originalYear} variant="outline">
                <CardBody>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Badge colorScheme="blue">{group.year}</Badge>
                      <Text fontWeight="semibold">{group.items.length} document(s)</Text>
                    </HStack>
                  </HStack>
                  <VStack align="stretch" spacing={3}>
                    {/* Images grid */}
                    {group.items.filter((it) => (it.kind === 'image') || (it.url && !it.url.toLowerCase().endsWith('.pdf'))).length > 0 && (
                      <VStack align="stretch" spacing={2}>
                        <Text fontWeight="medium">Images</Text>
                        <SimpleGrid columns={{ base: 3, md: 4 }} spacing={2}>
                          {group.items.filter((it) => (it.kind === 'image') || (it.url && !it.url.toLowerCase().endsWith('.pdf'))).map((item) => (
                            <Box key={item.id} position="relative">
                              <a href={item.url} target="_blank" rel="noreferrer">
                                <img src={item.url} alt={item.label || 'Image'} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                              </a>
                              <IconButton aria-label="Delete" icon={<FiTrash2 />} size="xs" colorScheme="red" variant="solid" onClick={() => handleDelete(item)} style={{ position: 'absolute', top: 4, right: 4 }} />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    )}

                    {/* PDF list */}
                    {group.items.filter((it) => (it.kind === 'pdf') || (it.url && it.url.toLowerCase().endsWith('.pdf'))).length > 0 && (
                      <VStack align="stretch" spacing={2}>
                        <Text fontWeight="medium">Documents</Text>
                        {group.items.filter((it) => (it.kind === 'pdf') || (it.url && it.url.toLowerCase().endsWith('.pdf'))).map((item) => (
                          <HStack key={item.id} justify="space-between" align="center" borderWidth="1px" rounded="md" p={2}>
                            <a href={item.url} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
                              <Text noOfLines={1}>{item.label || "Document"}</Text>
                            </a>
                            <IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDelete(item)} />
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
