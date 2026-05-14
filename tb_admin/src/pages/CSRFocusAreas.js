import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const CSRFocusAreas = () => {
  const [focusAreas, setFocusAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Target',
    impact: '',
    projects: '',
    beneficiaries: ''
  });

  const iconOptions = [
    'GraduationCap',
    'Stethoscope', 
    'Leaf',
    'Users',
    'Heart',
    'Building2',
    'Target',
    'Globe',
    'Shield',
    'Zap'
  ];

  useEffect(() => {
    console.log('CSRFocusAreas: Setting up Firebase listener');
    
    if (!db) {
      console.error('CSRFocusAreas: Firebase not initialized');
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'csrFocusAreas'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log('CSRFocusAreas: Received', snapshot.docs.length, 'focus areas');
            const areasData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setFocusAreas(areasData);
            setLoading(false);
          },
          (error) => {
            console.error('CSRFocusAreas: Error fetching focus areas:', error);
            setLoading(false);
          }
        );

      return () => unsubscribe();
    } catch (error) {
      console.error('CSRFocusAreas: Error setting up listener:', error);
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const areaData = {
        ...formData,
        projects: parseInt(formData.projects) || 0,
        beneficiaries: parseInt(formData.beneficiaries) || 0,
        updatedAt: serverTimestamp()
      };

      if (editingArea) {
        // Update existing area
        await updateDoc(doc(db, 'csrFocusAreas', editingArea.id), areaData);
        console.log('CSRFocusAreas: Focus area updated successfully');
      } else {
        // Create new area
        await addDoc(collection(db, 'csrFocusAreas'), {
          ...areaData,
          createdAt: serverTimestamp()
        });
        console.log('CSRFocusAreas: Focus area created successfully');
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('CSRFocusAreas: Error saving focus area:', error);
      alert('Error saving focus area');
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      title: area.title || '',
      description: area.description || '',
      icon: area.icon || 'Target',
      impact: area.impact || '',
      projects: area.projects?.toString() || '',
      beneficiaries: area.beneficiaries?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (areaId) => {
    if (window.confirm('Are you sure you want to delete this focus area?')) {
      try {
        await deleteDoc(doc(db, 'csrFocusAreas', areaId));
        console.log('CSRFocusAreas: Focus area deleted successfully');
      } catch (error) {
        console.error('CSRFocusAreas: Error deleting focus area:', error);
        alert('Error deleting focus area');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'Target',
      impact: '',
      projects: '',
      beneficiaries: ''
    });
    setEditingArea(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CSR Focus Areas</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage CSR partnership focus areas</p>
        </div>
        <button
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Focus Area
        </button>
      </div>

      {/* Focus Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {focusAreas.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Focus Areas</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first CSR focus area.</p>
            <button
              onClick={openModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Focus Area
            </button>
          </div>
        ) : (
          focusAreas.map((area) => (
            <div key={area.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 text-xl">
                      {area.icon === 'GraduationCap' ? '🎓' :
                       area.icon === 'Stethoscope' ? '🩺' :
                       area.icon === 'Leaf' ? '🌱' :
                       area.icon === 'Users' ? '👥' :
                       area.icon === 'Heart' ? '❤️' :
                       area.icon === 'Building2' ? '🏢' :
                       area.icon === 'Globe' ? '🌍' :
                       area.icon === 'Shield' ? '🛡️' :
                       area.icon === 'Zap' ? '⚡' : '🎯'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{area.title}</h3>
                    {area.impact && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">{area.impact}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(area)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {area.description}
              </p>

              {(area.projects > 0 || area.beneficiaries > 0) && (
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {area.projects > 0 && (
                    <span>🎯 {area.projects} Projects</span>
                  )}
                  {area.beneficiaries > 0 && (
                    <span>👥 {area.beneficiaries.toLocaleString()} Beneficiaries</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingArea ? 'Edit Focus Area' : 'Add New Focus Area'}
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Education for All"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe the focus area and its objectives..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon
                    </label>
                    <select
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>
                          {icon === 'GraduationCap' ? '🎓 Education' :
                           icon === 'Stethoscope' ? '🩺 Healthcare' :
                           icon === 'Leaf' ? '🌱 Environment' :
                           icon === 'Users' ? '👥 Community' :
                           icon === 'Heart' ? '❤️ Welfare' :
                           icon === 'Building2' ? '🏢 Infrastructure' :
                           icon === 'Globe' ? '🌍 Global' :
                           icon === 'Shield' ? '🛡️ Protection' :
                           icon === 'Zap' ? '⚡ Energy' : '🎯 General'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Impact Statement
                    </label>
                    <input
                      type="text"
                      name="impact"
                      value={formData.impact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 50,000+ children educated"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number of Projects
                    </label>
                    <input
                      type="number"
                      name="projects"
                      value={formData.projects}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="25"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number of Beneficiaries
                    </label>
                    <input
                      type="number"
                      name="beneficiaries"
                      value={formData.beneficiaries}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                  >
                    {editingArea ? 'Update' : 'Create'} Focus Area
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSRFocusAreas;
