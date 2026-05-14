import { Layout } from "@/components/layout/Layout";
import { EnhancedCard } from "@/components/ui/EnhancedCard";
import { ProfessionalSection, SectionHeader } from "@/components/ui/ProfessionalSection";
import { FileText, ArrowRight, X } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

// Helper function to format year as academic year (e.g., 2025 -> 2025-26)
const formatAcademicYear = (year: string | number) => {
  if (!year) return 'N/A';
  const currentYear = parseInt(year.toString());
  if (isNaN(currentYear)) return year.toString();
  const nextYear = String(currentYear + 1).slice(-2);
  return `${currentYear}-${nextYear}`;
};

export default function AnnualReports() {
  type ReportDoc = { id: string; year: string; label: string; url: string; kind?: 'pdf' | 'image'; contentType?: string; createdAt?: any };

  // Demo fallback data (shown when no reports are uploaded yet)
  const demoReports: ReportDoc[] = [
    { id: "demo-2024-1", year: "2024", label: "Annual Report 2024-25 (Sample)", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    { id: "demo-2024-2", year: "2024", label: "Financial Statement 2024-25 (Sample)", url: "https://www.africau.edu/images/default/sample.pdf" },
    { id: "demo-2023-1", year: "2023", label: "Annual Report 2023-24 (Sample)", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    { id: "demo-2023-2", year: "2023", label: "Audit Report 2023-24 (Sample)", url: "https://www.africau.edu/images/default/sample.pdf" },
    { id: "demo-2022-1", year: "2022", label: "Annual Report 2022-23 (Sample)", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  ];

  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load reports from Firestore (uploaded via admin panel)
  useEffect(() => {
    if (!db) {
      // Use demo data when Firebase is not configured
      setReports(demoReports);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      const q = query(collection(db, "annualReports"), orderBy("year", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ReportDoc[];
          setReports(items.length ? items : demoReports);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("AnnualReports: fetch error", err);
          setError("Failed to load annual reports");
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Unknown error");
      setLoading(false);
    }
  }, []);

  const reportsByYear = useMemo(() => {
    type PdfItem = { label: string; href: string };
    type ImgItem = { label: string; href: string };
    const map = new Map<string, { pdfs: PdfItem[]; images: ImgItem[] }>();
    
    // Process reports data
    for (const r of reports) {
      const y = (r.year || "").toString();
      if (!y) continue;
      const isPdf = (r as any).kind === 'pdf' || (r.url || '').toLowerCase().endsWith('.pdf');
      const isImage = (r as any).kind === 'image' || (!!r.url && !r.url.toLowerCase().endsWith('.pdf'));
      if (!map.has(y)) map.set(y, { pdfs: [], images: [] });
      const entry = { label: r.label || (isPdf ? "Document" : "Image"), href: r.url };
      if (isPdf) map.get(y)!.pdfs.push(entry);
      else if (isImage) map.get(y)!.images.push(entry);
    }
    
    // Convert to final format with academic years
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([year, { pdfs, images }]) => ({
        year: formatAcademicYear(year),
        originalYear: year,
        pdfs,
        images
      }));
  }, [reports]);

  // Mount animation for staggered fade-up
  const [mounted, setMounted] = useState(false);
  // PDF modal state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [fitMode, setFitMode] = useState<'width' | 'page'>('width');
  // Image modal state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageOpen, setImageOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);


  // Close on ESC and lock scroll when open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPdfOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!pdfOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const compute = () => {
      const ratio = window.innerWidth / window.innerHeight;
      setFitMode(ratio < 1 ? 'page' : 'width');
    };
    compute();
    window.addEventListener('resize', compute);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('resize', compute);
    };
  }, [pdfOpen]);

  return (
    <Layout>
      <ProfessionalSection variant="gradient">
        <SectionHeader
          badge="Transparency"
          title="Annual Reports"
          subtitle="Download center"
          description="Browse yearly reports and financial disclosures organized by academic year (e.g., 2025-26)."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-sm text-muted-foreground">
              Loading reports…
            </div>
          ) : reportsByYear.length === 0 ? (
            <div className="col-span-full text-center text-sm text-muted-foreground">
              No reports available yet.
            </div>
          ) : reportsByYear.map((group, i) => (
            <div
              key={group.originalYear}
              className={`transform transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <EnhancedCard
                title={group.year}
                subtitle="Annual Reports & Documents"
                badge={`${group.pdfs.length + group.images.length} item${(group.pdfs.length + group.images.length) !== 1 ? 's' : ''}`}
                variant="featured"
                className="h-full"
              >
                <div className="space-y-4">
                  {/* Year header */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {group.year}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {group.pdfs.length} PDF{group.pdfs.length !== 1 ? 's' : ''} • {group.images.length} Image{group.images.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {/* Images grid */}
                  {group.images.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Images</div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {group.images.map((img) => (
                          <button
                            key={img.href}
                            className="group relative rounded-md overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            onClick={() => { setImageUrl(img.href); setImageOpen(true); }}
                            aria-label={`Open ${img.label}`}
                          >
                            <img src={img.href} alt={img.label} className="w-full h-20 object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PDFs list */}
                  {group.pdfs.length > 0 && (
                    <ul className="divide-y divide-border">
                      {group.pdfs.map((file) => (
                        <li key={file.href} className="py-2">
                          <a
                            href={file.href}
                            onClick={(e) => { e.preventDefault(); setPdfUrl(file.href); setPdfOpen(true); }}
                            className="group flex items-center justify-between gap-3 px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                            aria-label={`Open ${file.label}`}
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                              <span className="relative text-sm after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-gradient-to-r from-primary to-hope after:transition-all after:duration-300 group-hover:after:w-full">
                                {file.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">PDF</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </EnhancedCard>
            </div>
          ))}
        </div>
      </ProfessionalSection>
      {/* Image Preview Modal */}
      {imageOpen && imageUrl && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setImageOpen(false)} />
          <div className="relative flex h-full w-full items-center justify-center p-4">
            <div className="relative mx-auto w-[95vw] md:w-[90vw] lg:w-[85vw] h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-medium">Image Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setImageOpen(false)} aria-label="Close" className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="h-[calc(100%-44px)] bg-white flex items-center justify-center">
                <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* PDF Preview Modal */}
      {pdfOpen && pdfUrl && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPdfOpen(false)} />
          <div className="relative flex h-full w-full items-center justify-center p-4">
            <div className={`relative mx-auto ${fitMode === 'width' ? 'w-[95vw] md:w-[90vw] lg:w-[85vw] h-[85vh]' : 'w-[85vw] md:w-[80vw] lg:w-[70vw] h-[90vh]'} bg-white rounded-xl shadow-2xl overflow-hidden`}>
              <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">PDF Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPdfOpen(false)} aria-label="Close" className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="h-[calc(100%-44px)] bg-white">
                <iframe
                  title="PDF preview"
                  src={`${pdfUrl}#zoom=${fitMode === 'width' ? 'page-width' : 'page-fit'}`}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
