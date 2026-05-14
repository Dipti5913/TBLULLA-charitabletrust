import React, { useState, useEffect } from 'react';

const TestimonialModal = ({ isOpen, onClose, onSubmit, title, initialData }) => {
  const [formData, setFormData] = useState({
    videoUrl: '',
    thumbnailUrl: '',
    platform: 'youtube',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const platforms = [
    { value: 'youtube', label: 'YouTube Video', icon: '📺' },
    { value: 'youtube-shorts', label: 'YouTube Shorts', icon: '🩳' },
    { value: 'instagram-reel', label: 'Instagram Reel', icon: '📱' },
    { value: 'instagram-video', label: 'Instagram Video', icon: '📹' },
    { value: 'facebook', label: 'Facebook Video', icon: '👥' },
    { value: 'twitter', label: 'Twitter/X Video', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn Video', icon: '💼' },
    { value: 'tiktok', label: 'TikTok Video', icon: '🎵' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        videoUrl: initialData.videoUrl || '',
        thumbnailUrl: initialData.thumbnailUrl || '',
        platform: initialData.platform || 'youtube',
        title: initialData.title || '',
        description: initialData.description || ''
      });
    } else {
      setFormData({
        videoUrl: '',
        thumbnailUrl: '',
        platform: 'youtube',
        title: '',
        description: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const testimonialData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await onSubmit(testimonialData);
      onClose();
    } catch (error) {
      console.error('Error submitting testimonial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      videoUrl: '',
      thumbnailUrl: '',
      platform: 'youtube',
      title: '',
      description: ''
    });
    onClose();
  };

  const getPlaceholderUrl = (platform) => {
    switch (platform) {
      case 'youtube':
        return 'https://www.youtube.com/embed/VIDEO_ID';
      case 'youtube-shorts':
        return 'https://www.youtube.com/shorts/VIDEO_ID';
      case 'instagram-reel':
        return 'https://www.instagram.com/reel/REEL_ID/';
      case 'instagram-video':
        return 'https://www.instagram.com/p/POST_ID/';
      case 'facebook':
        return 'https://www.facebook.com/watch/?v=VIDEO_ID';
      case 'twitter':
        return 'https://twitter.com/user/status/TWEET_ID';
      case 'linkedin':
        return 'https://www.linkedin.com/posts/activity-ID';
      case 'tiktok':
        return 'https://www.tiktok.com/@username/video/VIDEO_ID';
      default:
        return 'https://example.com/video-url';
    }
  };

  const getUrlHelperText = (platform) => {
    switch (platform) {
      case 'youtube':
        return 'Use YouTube embed URL or regular video URL';
      case 'youtube-shorts':
        return 'Use YouTube Shorts URL (will be converted to embed)';
      case 'instagram-reel':
        return 'Use Instagram Reel URL';
      case 'instagram-video':
        return 'Use Instagram post URL with video';
      case 'facebook':
        return 'Use Facebook video watch URL';
      case 'twitter':
        return 'Use Twitter/X post URL with video';
      case 'linkedin':
        return 'Use LinkedIn post URL with video';
      case 'tiktok':
        return 'Use TikTok video URL';
      default:
        return 'Enter the video URL from the platform';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col mx-2 sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Video' : 'Add Video Testimonial'}
          </h2>
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
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Platform <span className="text-red-500">*</span>
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                {platforms.map(platform => (
                  <option key={platform.value} value={platform.value}>
                    {platform.icon} {platform.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testimonial Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Customer Success Story, Project Impact, etc."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Add a title to describe this testimonial
              </p>
            </div>

            {/* Video URL Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder={getPlaceholderUrl(formData.platform)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {getUrlHelperText(formData.platform)}
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the testimonial content..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-vertical"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Add context about this testimonial
              </p>
            </div>

            {/* Thumbnail URL Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/thumbnail.jpg (optional)"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Custom thumbnail image. If not provided, platform thumbnail will be used automatically
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.videoUrl.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
              >
                {loading ? (initialData ? 'Updating...' : 'Adding...') : (initialData ? 'Update Video' : 'Add Video')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestimonialModal;