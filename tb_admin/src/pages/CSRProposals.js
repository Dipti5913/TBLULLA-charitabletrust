import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const CSRProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('CSRProposals: Setting up Firebase listener');
    
    if (!db) {
      console.error('CSRProposals: Firebase not initialized');
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'csrProposals'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log('CSRProposals: Received', snapshot.docs.length, 'proposals');
            const proposalsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setProposals(proposalsData);
            setLoading(false);
          },
          (error) => {
            console.error('CSRProposals: Error fetching proposals:', error);
            setLoading(false);
          }
        );

      return () => unsubscribe();
    } catch (error) {
      console.error('CSRProposals: Error setting up listener:', error);
      setLoading(false);
    }
  }, []);

  const handleStatusUpdate = async (proposalId, newStatus, notes = '') => {
    try {
      await updateDoc(doc(db, 'csrProposals', proposalId), {
        status: newStatus,
        notes: notes,
        updatedAt: serverTimestamp()
      });
      console.log('CSRProposals: Status updated successfully');
    } catch (error) {
      console.error('CSRProposals: Error updating status:', error);
      alert('Error updating proposal status');
    }
  };

  const handleDelete = async (proposalId) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await deleteDoc(doc(db, 'csrProposals', proposalId));
        console.log('CSRProposals: Proposal deleted successfully');
      } catch (error) {
        console.error('CSRProposals: Error deleting proposal:', error);
        alert('Error deleting proposal');
      }
    }
  };

  const openModal = (proposal) => {
    setSelectedProposal(proposal);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProposal(null);
    setShowModal(false);
  };


  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (timestamp) => {
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
  };

  const formatAmount = (amount) => {
    if (!amount) return 'Not specified';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CSR Proposals</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage corporate partnership proposals</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {proposals.length} proposals
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="Search by company, contact person, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Total Proposals', value: proposals.length, color: 'blue' },
            { label: 'Total Amount', value: `₹${proposals.reduce((sum, p) => sum + (parseFloat(p.proposedAmount) || 0), 0).toLocaleString('en-IN')}`, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
            </div>
          ))}
        </div>

      {/* Proposals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Company Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Focus Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No proposals found
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {proposal.companyName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {proposal.contactPerson}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {proposal.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {proposal.focusArea || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatAmount(proposal.proposedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(proposal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openModal(proposal)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedProposal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  CSR Proposal Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedProposal.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedProposal.contactPerson}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedProposal.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedProposal.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedProposal.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedProposal.website || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Focus Area</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedProposal.focusArea || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proposed Amount</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatAmount(selectedProposal.proposedAmount)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedProposal.message}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={selectedProposal.status || 'pending'}
                    onChange={(e) => handleStatusUpdate(selectedProposal.id, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {selectedProposal.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {selectedProposal.notes}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Submitted: {formatDate(selectedProposal.createdAt)}</p>
                  {selectedProposal.updatedAt && (
                    <p>Last Updated: {formatDate(selectedProposal.updatedAt)}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSRProposals;
