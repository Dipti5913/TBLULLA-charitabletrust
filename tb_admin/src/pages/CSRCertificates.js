import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const CSRCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    type: '',
    file: null
  });

  const certificateTypes = [
    'CSR Registration',
    '12A Registration',
    '80G Certificate',
    'FCRA Registration',
    'Trust Deed',
    'PAN Card',
    'Other'
  ];

  useEffect(() => {
    console.log('CSRCertificates: Setting up Firebase listener');
    
    if (!db) {
      console.error('CSRCertificates: Firebase not initialized');
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'csrCertificates'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log('CSRCertificates: Received', snapshot.docs.length, 'certificates');
            const certificatesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setCertificates(certificatesData);
            setLoading(false);
          },
          (error) => {
            console.error('CSRCertificates: Error fetching certificates:', error);
            setLoading(false);
          }
        );

      return () => unsubscribe();
    } catch (error) {
      console.error('CSRCertificates: Error setting up listener:', error);
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, JPEG, or PNG file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const uploadFile = async (file) => {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    const timestamp = Date.now();
    const fileName = `csr-certificates/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    console.log('CSRCertificates: Uploading file to:', fileName);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      url: downloadURL,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      storagePath: fileName
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.number.trim() || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      let certificateData = {
        name: formData.name.trim(),
        number: formData.number.trim(),
        type: formData.type,
        updatedAt: serverTimestamp()
      };

      // Handle file upload if new file is selected
      if (formData.file) {
        const fileData = await uploadFile(formData.file);
        certificateData = {
          ...certificateData,
          ...fileData
        };
      }

      if (editingCertificate) {
        // Update existing certificate
        await updateDoc(doc(db, 'csrCertificates', editingCertificate.id), certificateData);
        console.log('CSRCertificates: Certificate updated successfully');
      } else {
        // Create new certificate
        await addDoc(collection(db, 'csrCertificates'), {
          ...certificateData,
          createdAt: serverTimestamp()
        });
        console.log('CSRCertificates: Certificate created successfully');
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('CSRCertificates: Error saving certificate:', error);
      alert('Error saving certificate: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      name: certificate.name || '',
      number: certificate.number || '',
      type: certificate.type || '',
      file: null
    });
    setShowModal(true);
  };

  const handleDelete = async (certificate) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        // Delete file from storage if it exists
        if (certificate.storagePath && storage) {
          try {
            const fileRef = ref(storage, certificate.storagePath);
            await deleteObject(fileRef);
            console.log('CSRCertificates: File deleted from storage');
          } catch (storageError) {
            console.warn('CSRCertificates: Could not delete file from storage:', storageError);
          }
        }

        // Delete document from Firestore
        await deleteDoc(doc(db, 'csrCertificates', certificate.id));
        console.log('CSRCertificates: Certificate deleted successfully');
      } catch (error) {
        console.error('CSRCertificates: Error deleting certificate:', error);
        alert('Error deleting certificate');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      type: '',
      file: null
    });
    setEditingCertificate(null);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CSR Certificates</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage legal certificates and registrations</p>
        </div>
        <button
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Certificate
        </button>
      </div>

      {/* Certificates Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Certificate Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  File Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Certificates</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Upload your first certificate to get started.</p>
                    <button
                      onClick={openModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Certificate
                    </button>
                  </td>
                </tr>
              ) : (
                certificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {certificate.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {certificate.number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {certificate.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {certificate.fileName ? (
                        <div>
                          <div>{certificate.fileName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(certificate.fileSize)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(certificate.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {certificate.url && (
                        <a
                          href={certificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 dark:text-green-400"
                        >
                          Download
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(certificate)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(certificate)}
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
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
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
                    Certificate Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., CSR Registration Certificate"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificate Number *
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., CSR00001234"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificate Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Type</option>
                    {certificateTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificate File {!editingCertificate && '*'}
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={!editingCertificate}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supported formats: PDF, JPEG, PNG (Max 5MB)
                  </p>
                  {editingCertificate && editingCertificate.fileName && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Current file: {editingCertificate.fileName}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Uploading...
                      </>
                    ) : (
                      editingCertificate ? 'Update Certificate' : 'Add Certificate'
                    )}
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

export default CSRCertificates;
