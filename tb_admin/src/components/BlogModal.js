import React, { useState, useEffect } from 'react';
import { uploadFile } from '../services/firebaseService';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MultiImageUpload from './MultiImageUpload';

const BlogModal = ({ isOpen, onClose, onSubmit, title, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    images: [],
    description: ''
  });
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        date: initialData.publishDate || new Date().toISOString().split('T')[0],
        images: [],
        description: initialData.content || initialData.excerpt || ''
      });
      // Set existing images if editing
      const existingImageUrls = [];
      if (initialData.image) existingImageUrls.push(initialData.image);
      if (initialData.imageUrl) existingImageUrls.push(initialData.imageUrl);
      if (initialData.images && Array.isArray(initialData.images)) {
        existingImageUrls.push(...initialData.images);
      }
      setExistingImages([...new Set(existingImageUrls)]); // Remove duplicates
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        images: [],
        description: ''
      });
      setExistingImages([]);
    }

    // Test Firebase Storage when modal opens
    if (isOpen) {
      console.log('BlogModal: Testing Firebase Storage configuration...');
      console.log('BlogModal: Storage instance:', !!storage);
      if (storage) {
        // In modular SDK, these properties may differ; basic truthy check is sufficient
        try { console.log('BlogModal: Storage initialized (modular)'); } catch (_) {}
      }
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

  // Enhanced images change handler with existing image removal
  const handleImagesChangeWithRemoval = (newImages) => {
    handleImagesChange(newImages);
  };

  handleImagesChangeWithRemoval.removeExisting = (index) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('BlogModal: Starting blog submission...', formData);
      
      let imageUrls = [];
      
      // Upload new images if provided
      if (formData.images && formData.images.length > 0) {
        console.log('BlogModal: Starting images upload process...');
        console.log('BlogModal: Images count:', formData.images.length);
        
        try {
          // Upload each image
          for (let i = 0; i < formData.images.length; i++) {
            const image = formData.images[i];
            const imagePath = `blogs/${Date.now()}_${i}_${image.name}`;
            console.log('BlogModal: Upload path:', imagePath);
            
            // Validate file before upload
            if (image.size > 10 * 1024 * 1024) { // 10MB limit
              throw new Error(`Image file ${image.name} is too large. Please choose a file smaller than 10MB.`);
            }
            
            if (!image.type.startsWith('image/')) {
              throw new Error(`Please select a valid image file for ${image.name}.`);
            }
            
            console.log('BlogModal: File validation passed, proceeding with upload...');
            
            let imageUrl;
            // Try direct Firebase Storage upload as fallback
            try {
              imageUrl = await uploadFile(image, imagePath);
            } catch (uploadError) {
              console.error('BlogModal: Standard upload failed, trying direct Firebase upload...');
              
              // Direct Firebase Storage upload (v9 modular)
              const storageRef = ref(storage, imagePath);
              const snapshot = await uploadBytes(storageRef, image);
              imageUrl = await getDownloadURL(storageRef);
              console.log('BlogModal: Direct Firebase upload successful:', imageUrl);
            }
            
            if (imageUrl && typeof imageUrl === 'string') {
              console.log('BlogModal: Image uploaded successfully!');
              console.log('BlogModal: Image URL:', imageUrl);
              imageUrls.push(imageUrl);
            } else {
              console.error('BlogModal: Upload returned invalid URL:', imageUrl);
              throw new Error(`Invalid image URL returned from upload for ${image.name}`);
            }
          }
        } catch (uploadError) {
          console.error('BlogModal: Images upload failed:', uploadError);
          const continueWithoutImages = window.confirm(
            `Images upload failed: ${uploadError.message}\n\nWould you like to save the blog without the new images?`
          );
          
          if (!continueWithoutImages) {
            throw uploadError;
          }
          
          console.log('BlogModal: Continuing without new images...');
          imageUrls = [];
        }
      } else {
        console.log('BlogModal: No new images provided');
      }

      // Combine existing images with newly uploaded images
      const allImages = [...existingImages, ...imageUrls];
      const primaryImage = allImages.length > 0 ? allImages[0] : null;

      const blogData = {
        title: formData.title,
        content: formData.description,
        description: formData.description, // Client fallback field
        excerpt: formData.description.substring(0, 200) + '...',
        publishDate: formData.date,
        date: formData.date, // Client fallback field
        image: primaryImage, // Primary image for backward compatibility
        imageUrl: primaryImage, // Client fallback field
        images: allImages, // All images array
        author: 'Admin', // Default author
        category: 'General', // Default category
        status: 'published', // Always published
        readTime: '5 min read', // Default read time
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Include ID if editing
      if (initialData?.id) {
        blogData.id = initialData.id;
      }

      console.log('BlogModal: Final blog data being saved:', {
        ...blogData,
        imageUrl: blogData.imageUrl,
        imageType: typeof blogData.imageUrl,
        imageLength: blogData.imageUrl ? blogData.imageUrl.length : 0,
        imagesCount: blogData.images ? blogData.images.length : 0
      });

      console.log('BlogModal: Saving blog data:', blogData);
      await onSubmit(blogData);
      onClose();
    } catch (error) {
      console.error('Error submitting blog:', error);
      alert('Error saving blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      images: [],
      description: ''
    });
    setExistingImages([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
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
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="Enter blog post title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Multiple Images Upload Field */}
          <div>
            <MultiImageUpload
              images={formData.images}
              onImagesChange={handleImagesChangeWithRemoval}
              existingImages={existingImages}
              maxImages={5}
              maxSizeMB={10}
              disabled={loading}
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
              placeholder="Enter blog post description or content"
              rows={6}
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
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
            >
              {loading ? 'Adding...' : 'Add Blog Post'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;
