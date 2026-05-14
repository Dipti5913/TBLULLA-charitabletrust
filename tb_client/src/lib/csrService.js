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
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase.js';

// CSR Proposals Service
export const csrProposalService = {
  // Create a new CSR proposal
  async create(proposalData) {
    try {
      const docRef = await addDoc(collection(db, 'csrProposals'), {
        ...proposalData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('CSR proposal created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating CSR proposal:', error);
      throw error;
    }
  },

  // Get all CSR proposals
  async getAll() {
    try {
      const q = query(collection(db, 'csrProposals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching CSR proposals:', error);
      throw error;
    }
  },

  // Get proposals by status
  async getByStatus(status) {
    try {
      const q = query(
        collection(db, 'csrProposals'), 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching CSR proposals by status:', error);
      throw error;
    }
  },

  // Update proposal status
  async updateStatus(proposalId, status, notes = '') {
    try {
      const proposalRef = doc(db, 'csrProposals', proposalId);
      await updateDoc(proposalRef, {
        status,
        notes,
        updatedAt: serverTimestamp()
      });
      console.log('CSR proposal status updated:', proposalId);
    } catch (error) {
      console.error('Error updating CSR proposal status:', error);
      throw error;
    }
  },

  // Delete a proposal
  async delete(proposalId) {
    try {
      await deleteDoc(doc(db, 'csrProposals', proposalId));
      console.log('CSR proposal deleted:', proposalId);
    } catch (error) {
      console.error('Error deleting CSR proposal:', error);
      throw error;
    }
  },

  // Listen to real-time updates
  onSnapshot(callback, errorCallback) {
    const q = query(collection(db, 'csrProposals'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, callback, errorCallback);
  }
};

// CSR Focus Areas Service
export const csrFocusAreaService = {
  // Create a new focus area
  async create(focusAreaData) {
    try {
      const docRef = await addDoc(collection(db, 'csrFocusAreas'), {
        ...focusAreaData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('CSR focus area created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating CSR focus area:', error);
      throw error;
    }
  },

  // Get all focus areas
  async getAll() {
    try {
      const q = query(collection(db, 'csrFocusAreas'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching CSR focus areas:', error);
      throw error;
    }
  },

  // Update a focus area
  async update(focusAreaId, updateData) {
    try {
      const focusAreaRef = doc(db, 'csrFocusAreas', focusAreaId);
      await updateDoc(focusAreaRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      console.log('CSR focus area updated:', focusAreaId);
    } catch (error) {
      console.error('Error updating CSR focus area:', error);
      throw error;
    }
  },

  // Delete a focus area
  async delete(focusAreaId) {
    try {
      await deleteDoc(doc(db, 'csrFocusAreas', focusAreaId));
      console.log('CSR focus area deleted:', focusAreaId);
    } catch (error) {
      console.error('Error deleting CSR focus area:', error);
      throw error;
    }
  },

  // Listen to real-time updates
  onSnapshot(callback, errorCallback) {
    const q = query(collection(db, 'csrFocusAreas'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, callback, errorCallback);
  }
};

// CSR Certificates Service
export const csrCertificateService = {
  // Create a new certificate
  async create(certificateData) {
    try {
      const docRef = await addDoc(collection(db, 'csrCertificates'), {
        ...certificateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('CSR certificate created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating CSR certificate:', error);
      throw error;
    }
  },

  // Get all certificates
  async getAll() {
    try {
      const q = query(collection(db, 'csrCertificates'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching CSR certificates:', error);
      throw error;
    }
  },

  // Update a certificate
  async update(certificateId, updateData) {
    try {
      const certificateRef = doc(db, 'csrCertificates', certificateId);
      await updateDoc(certificateRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      console.log('CSR certificate updated:', certificateId);
    } catch (error) {
      console.error('Error updating CSR certificate:', error);
      throw error;
    }
  },

  // Delete a certificate
  async delete(certificateId) {
    try {
      await deleteDoc(doc(db, 'csrCertificates', certificateId));
      console.log('CSR certificate deleted:', certificateId);
    } catch (error) {
      console.error('Error deleting CSR certificate:', error);
      throw error;
    }
  },

  // Listen to real-time updates
  onSnapshot(callback, errorCallback) {
    const q = query(collection(db, 'csrCertificates'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, callback, errorCallback);
  }
};

// CSR Statistics Service
export const csrStatsService = {
  // Get CSR statistics
  async getStats() {
    try {
      const [proposals, focusAreas] = await Promise.all([
        csrProposalService.getAll(),
        csrFocusAreaService.getAll()
      ]);

      const stats = {
        totalProposals: proposals.length,
        pendingProposals: proposals.filter(p => p.status === 'pending').length,
        approvedProposals: proposals.filter(p => p.status === 'approved').length,
        rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
        totalFocusAreas: focusAreas.length,
        totalProposedAmount: proposals.reduce((sum, p) => sum + (parseFloat(p.proposedAmount) || 0), 0),
        companiesInterested: new Set(proposals.map(p => p.companyName)).size
      };

      return stats;
    } catch (error) {
      console.error('Error fetching CSR statistics:', error);
      throw error;
    }
  }
};

export default {
  proposals: csrProposalService,
  focusAreas: csrFocusAreaService,
  certificates: csrCertificateService,
  stats: csrStatsService
};
