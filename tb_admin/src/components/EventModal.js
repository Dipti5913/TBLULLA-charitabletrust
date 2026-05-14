import React, { useState, useEffect } from 'react';
import MultiImageUpload from './MultiImageUpload';

const EventModal = ({ isOpen, onClose, onSubmit, title, initialData }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: '',
    description: '',
    images: []
  });
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        year: initialData.year || new Date().getFullYear(),
        title: initialData.title || '',
        description: initialData.description || '',
        images: []
      });
      
      // Set existing images if editing - handle multiple possible fields
      const existingImageUrls = [];
      
      // Check for multiple images array
      if (initialData.images && Array.isArray(initialData.images)) {
        existingImageUrls.push(...initialData.images);
      } else if (initialData.imageUrls && Array.isArray(initialData.imageUrls)) {
        existingImageUrls.push(...initialData.imageUrls);
      } else if (initialData.imageUrl && typeof initialData.imageUrl === 'string') {
        // Handle single image URL
        existingImageUrls.push(initialData.imageUrl);
      }
      
      console.log('EVENT_MODAL: Setting existing images:', existingImageUrls);
      setExistingImages(existingImageUrls);
    } else {
      setFormData({
        year: new Date().getFullYear(),
        title: '',
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
    console.log('EVENT_MODAL: New images changed:', newImages.length);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Handle removal of existing images
  const handleRemoveExistingImage = (index) => {
    console.log('EVENT_MODAL: Removing existing image at index:', index);
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        existingImages: existingImages, // Pass existing images
        date: new Date().toISOString().split('T')[0], // Current date
        time: new Date().toLocaleTimeString('en-US', { hour12: false }), // Current time
        location: 'To be announced', // Default location
        status: 'upcoming', // Default status
        attendees: 0
      };

      await onSubmit(eventData);
      onClose();
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      year: new Date().getFullYear(),
      title: '',
      description: '',
      images: []
    });
    setExistingImages([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
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
          {/* Year Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                required
              >
                {Array.from({ length: new Date().getFullYear() - 2000 + 6 }, (_, i) => {
                  const year = new Date().getFullYear() + 5 - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Event Images Field */}
          <div>
            <MultiImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              onRemoveExisting={handleRemoveExistingImage}
              existingImages={existingImages}
              maxImages={10}
              maxSizeMB={5}
              disabled={loading}
              showExistingImages={true}
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
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
