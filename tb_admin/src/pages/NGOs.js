import React, { useState, useEffect } from 'react';
import NGOModal from '../components/NGOModal';
import { ngoService } from '../services/firebaseService';

const NGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingNgo, setEditingNgo] = useState(null);

  const focusAreas = ['Education', 'Healthcare', 'Environment', 'Water & Sanitation', 'Women Empowerment', 'Child Welfare', 'Elderly Care'];

  useEffect(() => {
    loadNgos();
  }, []);

  const loadNgos = async () => {
    try {
      const ngosData = await ngoService.getAll();
      setNgos(ngosData);
    } catch (error) {
      console.error('Error loading NGOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (ngoData) => {
    try {
      if (editingNgo) {
        await ngoService.update(editingNgo.id, ngoData);
      } else {
        await ngoService.create(ngoData);
      }

      await loadNgos();
      setEditingNgo(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving NGO:', error);
    }
  };

  const handleDeleteNgo = async (id) => {
    if (window.confirm('Are you sure you want to delete this NGO?')) {
      try {
        await ngoService.delete(id);
        await loadNgos();
      } catch (error) {
        console.error('Error deleting NGO:', error);
      }
    }
  };

  const handleEditNgo = (ngo) => {
    setEditingNgo(ngo);
    setShowModal(true);
  };



  const getFocusAreaColor = (focusArea) => {
    const colors = {
      'Education': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Healthcare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Environment': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Water & Sanitation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Women Empowerment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Child Welfare': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Elderly Care': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return colors[focusArea] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading NGOs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">NGO Partners</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage partnerships with NGOs and organizations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add NGO
        </button>
      </div>

      <div className="grid gap-6">
        {ngos.map((ngo) => (
          <div key={ngo.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{ngo.organizationName || ngo.name || 'Unknown NGO'}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFocusAreaColor(ngo.fieldOfWork || ngo.focusArea || 'General')}`}>
                    {ngo.fieldOfWork || ngo.focusArea || 'General'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">{ngo.description || 'No description available'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Contact Person</span>
                <p className="font-medium text-slate-900 dark:text-white">{ngo.concernPerson || ngo.contactPerson || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Location</span>
                <p className="font-medium text-slate-900 dark:text-white">{ngo.city || ngo.location || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Projects</span>
                <p className="font-medium text-slate-900 dark:text-white">{ngo.projectsCount || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Email: </span>
                {ngo.email ? (
                  <a href={`mailto:${ngo.email}`} className="text-primary hover:text-primary/80">{ngo.email}</a>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Phone: </span>
                {(ngo.contactNumber || ngo.phone) ? (
                  <a href={`tel:${ngo.contactNumber || ngo.phone}`} className="text-primary hover:text-primary/80">{ngo.contactNumber || ngo.phone}</a>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Joined: {ngo.joinDate || 'Not specified'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditNgo(ngo)}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNgo(ngo.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NGOModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingNgo(null);
        }}
        onSubmit={handleSubmit}
        title={editingNgo ? 'Edit NGO' : 'Add NGO'}
        initialData={editingNgo}
      />
    </div>
  );
};

export default NGOs;
