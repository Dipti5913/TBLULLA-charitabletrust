import React, { useState, useEffect } from 'react';
import RotaryGrantModal from '../components/RotaryGrantModal';
import { rotaryGrantService } from '../services/firebaseService';

const RotaryGlobalGrant = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingGrant, setEditingGrant] = useState(null);

  useEffect(() => {
    loadGrants();
  }, []);

  const loadGrants = async () => {
    try {
      const grantsData = await rotaryGrantService.getAll();
      setGrants(grantsData);
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (grantData) => {
    try {
      if (editingGrant) {
        await rotaryGrantService.update(editingGrant.id, grantData);
      } else {
        await rotaryGrantService.create(grantData);
      }

      await loadGrants();
      setEditingGrant(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving grant:', error);
    }
  };

  const handleDeleteGrant = async (grantId) => {
    if (window.confirm('Are you sure you want to delete this grant? This action cannot be undone.')) {
      try {
        await rotaryGrantService.delete(grantId);
        await loadGrants();
      } catch (error) {
        console.error('Error deleting grant:', error);
      }
    }
  };

  const handleEditGrant = (grant) => {
    setEditingGrant(grant);
    setShowModal(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading grants...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white break-words">Rotary Global Grant</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">Manage Rotary Global Grant projects and funding</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Add Rotary Global Grant
        </button>
      </div>


      <div className="grid gap-4 sm:gap-6">
        {grants.map((grant) => (
          <div key={grant.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white break-words">{grant.projectName || grant.title || 'Untitled Grant'}</h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400 break-all">#{grant.rotaryGlobalGrantNo || grant.globalGrant || grant.grantNumber || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => handleEditGrant(grant)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Edit Grant"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteGrant(grant.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete Grant"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="min-w-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">Total Project Cost</span>
                <p className="font-medium text-slate-900 dark:text-white break-words">{grant.totalProjectCost || 'Not specified'}</p>
              </div>
              <div className="min-w-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">Contribution by Rtn. Kishor Lulla</span>
                <p className="font-medium text-slate-900 dark:text-white break-words">{grant.contributionByKishorLulla || 'Not specified'}</p>
              </div>
              <div className="min-w-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">Host Club</span>
                <p className="font-medium text-slate-900 dark:text-white break-words">{grant.hostClub || 'Not specified'}</p>
              </div>
              <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                <span className="text-sm text-slate-500 dark:text-slate-400">Foreign Partner</span>
                <p className="font-medium text-slate-900 dark:text-white break-words">{grant.foreignPartner || 'Not specified'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RotaryGrantModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGrant(null);
        }}
        onSubmit={handleSubmit}
        title={editingGrant ? 'Edit Rotary Global Grant' : 'Add Rotary Global Grant'}
        initialData={editingGrant}
      />
    </div>
  );
};

export default RotaryGlobalGrant;
