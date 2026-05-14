import React, { useState, useEffect } from 'react';
import { uploadFile } from '../services/firebaseService';

const AnnualReportModal = ({ isOpen, onClose, onSubmit, title, initialData }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    labelPrefix: '',
    files: []
  });
  const [loading, setLoading] = useState(false);

  // Helper function to format year as academic year (e.g., 2025 -> 2025-26)
  const formatAcademicYear = (year) => {
    const currentYear = parseInt(year);
    const nextYear = (currentYear + 1).toString().slice(-2);
    return `${currentYear}-${nextYear}`;
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        year: initialData.year || new Date().getFullYear(),
        labelPrefix: initialData.labelPrefix || '',
        files: []
      });
    } else {
      setFormData({
        year: new Date().getFullYear(),
        labelPrefix: '',
        files: []
      });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: files
    }));
  };

  const handleClear = () => {
    setFormData({
      year: new Date().getFullYear(),
      labelPrefix: '',
      files: []
    });
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload files to Firebase Storage and create individual report entries
      if (formData.files.length === 0) {
        alert('Please select at least one file to upload.');
        setLoading(false);
        return;
      }

      for (let i = 0; i < formData.files.length; i++) {
        const file = formData.files[i];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);
        const isPdf = fileExtension === 'pdf';
        
        // Upload file to Firebase Storage
        const filePath = `annual-reports/${formData.year}/${Date.now()}_${file.name}`;
        const downloadURL = await uploadFile(file, filePath);
        
        // Create report entry in format expected by client
        const academicYear = formatAcademicYear(formData.year);
        const reportData = {
          year: formData.year.toString(),
          label: formData.labelPrefix ? 
            `${formData.labelPrefix} ${academicYear}${formData.files.length > 1 ? ` (${i + 1})` : ''}` : 
            `Annual Report ${academicYear}${formData.files.length > 1 ? ` (${i + 1})` : ''}`,
          url: downloadURL,
          kind: isPdf ? 'pdf' : 'image',
          contentType: file.type,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          // Legacy fields for admin compatibility
          title: formData.labelPrefix ? `${formData.labelPrefix} ${academicYear}` : `Annual Report ${academicYear}`,
          labelPrefix: formData.labelPrefix,
          description: formData.labelPrefix ? `${formData.labelPrefix} for the year ${academicYear}` : `Annual report for the year ${academicYear}`,
          status: 'published', // Set to published so it shows in client
          downloadCount: 0,
          uploadDate: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await onSubmit(reportData);
      }

      // Reset form and close modal
      handleClear();
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    handleClear();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Year and Label Prefix Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Year Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2000"
                max="2100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Will be displayed as {formatAcademicYear(formData.year)} (e.g., 2025 becomes 2025-26)
              </p>
            </div>

            {/* Label Prefix Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label prefix (optional)
              </label>
              <input
                type="text"
                name="labelPrefix"
                value={formData.labelPrefix}
                onChange={handleInputChange}
                placeholder="e.g. Annual Report"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* PDFs or Images Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDFs or Images
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.files.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {formData.files.length} file(s) selected
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {loading ? 'Uploading...' : 'Upload PDFs'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnualReportModal;
