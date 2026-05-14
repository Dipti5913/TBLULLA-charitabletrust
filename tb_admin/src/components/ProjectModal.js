import React, { useState, useEffect } from 'react';
import MultiImageUpload from './MultiImageUpload';

const ProjectModal = ({ isOpen, onClose, onSubmit, title, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    images: []
  });
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Default categories from your image
  const [categories, setCategories] = useState([
    'Shiku Anande',
    'Literacy',
    'Rotary WASH',
    'Natural Calamities',
    'Health Care'
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || '',
        description: initialData.description || '',
        images: []
      });
      // Set existing images if editing
      const existingImageUrls = [];
      if (initialData.imageUrl) existingImageUrls.push(initialData.imageUrl);
      if (initialData.images && Array.isArray(initialData.images)) {
        existingImageUrls.push(...initialData.images);
      }
      setExistingImages([...new Set(existingImageUrls)]); // Remove duplicates
    } else {
      setFormData({
        title: '',
        category: '',
        description: '',
        images: []
      });
      setExistingImages([]);
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Handle removal of existing images
  const handleRemoveExistingImage = (index) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category: category
    }));
    setShowCategoryDropdown(false);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      const newCategory = newCategoryName.trim();
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({
        ...prev,
        category: newCategory
      }));
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      setShowCategoryDropdown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('PROJECT_MODAL: Submitting project with data:', {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        newImages: formData.images.length,
        existingImages: existingImages.length
      });

      const projectData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        images: formData.images, // Pass the files for upload
        existingImages: existingImages, // Pass existing images
        status: 'planning', // Default status
        budget: '$0', // Default budget
        progress: 0, // Default progress
        startDate: new Date().toISOString().split('T')[0], // Current date
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // One year from now
        location: 'To be determined', // Default location
        beneficiaries: 0 // Default beneficiaries
      };

      console.log('PROJECT_MODAL: Calling onSubmit with projectData');
      await onSubmit(projectData);
      
      console.log('PROJECT_MODAL: Project submitted successfully');
      onClose();
    } catch (error) {
      console.error('PROJECT_MODAL: Error submitting project:', error);
      alert('Error submitting project: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      images: []
    });
    setExistingImages([]);
    setShowCategoryDropdown(false);
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
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

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter project title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category Field */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
              >
                <span className={formData.category ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.category || 'Select category'}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="py-1 max-h-60 overflow-auto">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                      Select category
                    </div>
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-900"
                      >
                        {category}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategoryInput(true);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-600 font-medium"
                    >
                      + Add New Category
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Category Input */}
          {showNewCategoryInput && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                New Category Name
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                  }}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Multiple Project Images Upload */}
          <div>
            <MultiImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              onRemoveExisting={handleRemoveExistingImage}
              existingImages={existingImages}
              maxImages={8}
              maxSizeMB={5}
              disabled={loading}
            />
          </div>

          {/* Project Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the project details, objectives, and outcomes"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.category || !formData.description.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
            >
              {loading ? 'Adding...' : 'Add Project'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
