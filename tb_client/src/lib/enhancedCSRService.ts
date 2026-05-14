import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  onSnapshot,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Enhanced types for better type safety
export interface CSRProposal {
  id?: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  focusArea?: string;
  proposedAmount?: string;
  message: string;
  city?: string;
  website?: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isTestData?: boolean;
}

export interface CSRFocusArea {
  id?: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  impact?: string;
  projects?: number;
  beneficiaries?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CSRCertificate {
  id?: string;
  name: string;
  number: string;
  type: string;
  url?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CSRStats {
  totalProposals: number;
  pendingProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  inReviewProposals: number;
  totalFocusAreas: number;
  totalCertificates: number;
  totalProposedAmount: number;
  companiesInterested: number;
  recentProposals: CSRProposal[];
}

// Enhanced CSR Service with better error handling and caching
class EnhancedCSRService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Cache management
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // CSR Proposals
  async createProposal(proposalData: Omit<CSRProposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const docRef = await addDoc(collection(db, 'csrProposals'), {
        ...proposalData,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('CSR proposal created with ID:', docRef.id);
      this.cache.delete('proposals'); // Invalidate cache
      return docRef.id;
    } catch (error) {
      console.error('Error creating CSR proposal:', error);
      throw new Error(`Failed to create proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllProposals(useCache: boolean = true): Promise<CSRProposal[]> {
    const cacheKey = 'proposals';
    
    if (useCache && this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const q = query(collection(db, 'csrProposals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const proposals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CSRProposal[];

      this.setCache(cacheKey, proposals);
      return proposals;
    } catch (error) {
      console.error('Error fetching CSR proposals:', error);
      throw new Error(`Failed to fetch proposals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProposalsByStatus(status: CSRProposal['status']): Promise<CSRProposal[]> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const q = query(
        collection(db, 'csrProposals'), 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CSRProposal[];
    } catch (error) {
      console.error('Error fetching proposals by status:', error);
      throw new Error(`Failed to fetch proposals by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // CSR Focus Areas
  async getAllFocusAreas(useCache: boolean = true): Promise<CSRFocusArea[]> {
    const cacheKey = 'focusAreas';
    
    if (useCache && this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const q = query(collection(db, 'csrFocusAreas'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const focusAreas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CSRFocusArea[];

      this.setCache(cacheKey, focusAreas);
      return focusAreas;
    } catch (error) {
      console.error('Error fetching CSR focus areas:', error);
      throw new Error(`Failed to fetch focus areas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // CSR Certificates
  async getAllCertificates(useCache: boolean = true): Promise<CSRCertificate[]> {
    const cacheKey = 'certificates';
    
    if (useCache && this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      const q = query(collection(db, 'csrCertificates'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const certificates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CSRCertificate[];

      this.setCache(cacheKey, certificates);
      return certificates;
    } catch (error) {
      console.error('Error fetching CSR certificates:', error);
      throw new Error(`Failed to fetch certificates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Enhanced Statistics
  async getCSRStats(): Promise<CSRStats> {
    try {
      const [proposals, focusAreas, certificates] = await Promise.all([
        this.getAllProposals(),
        this.getAllFocusAreas(),
        this.getAllCertificates()
      ]);

      const stats: CSRStats = {
        totalProposals: proposals.length,
        pendingProposals: proposals.filter(p => p.status === 'pending').length,
        approvedProposals: proposals.filter(p => p.status === 'approved').length,
        rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
        inReviewProposals: proposals.filter(p => p.status === 'in-review').length,
        totalFocusAreas: focusAreas.length,
        totalCertificates: certificates.length,
        totalProposedAmount: proposals.reduce((sum, p) => sum + (parseFloat(p.proposedAmount || '0') || 0), 0),
        companiesInterested: new Set(proposals.map(p => p.companyName)).size,
        recentProposals: proposals.slice(0, 5)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching CSR statistics:', error);
      throw new Error(`Failed to fetch statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Real-time listeners
  onProposalsChange(callback: (proposals: CSRProposal[]) => void, errorCallback?: (error: Error) => void): () => void {
    if (!db) {
      const error = new Error('Firebase not initialized');
      if (errorCallback) errorCallback(error);
      return () => {};
    }

    const q = query(collection(db, 'csrProposals'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q, 
      (snapshot) => {
        const proposals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CSRProposal[];
        callback(proposals);
      },
      (error) => {
        console.error('Error in proposals listener:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  }

  onFocusAreasChange(callback: (focusAreas: CSRFocusArea[]) => void, errorCallback?: (error: Error) => void): () => void {
    if (!db) {
      const error = new Error('Firebase not initialized');
      if (errorCallback) errorCallback(error);
      return () => {};
    }

    const q = query(collection(db, 'csrFocusAreas'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const focusAreas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CSRFocusArea[];
        callback(focusAreas);
      },
      (error) => {
        console.error('Error in focus areas listener:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  }

  onCertificatesChange(callback: (certificates: CSRCertificate[]) => void, errorCallback?: (error: Error) => void): () => void {
    if (!db) {
      const error = new Error('Firebase not initialized');
      if (errorCallback) errorCallback(error);
      return () => {};
    }

    const q = query(collection(db, 'csrCertificates'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const certificates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CSRCertificate[];
        callback(certificates);
      },
      (error) => {
        console.error('Error in certificates listener:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      // Try to read from a collection
      const q = query(collection(db, 'csrProposals'), limit(1));
      await getDocs(q);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Format helpers
  formatAmount(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num) || num === 0) return 'Not specified';
    
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)}Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  }

  formatDate(timestamp: Timestamp | null): string {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }
}

// Export singleton instance
export const enhancedCSRService = new EnhancedCSRService();
export default enhancedCSRService;
