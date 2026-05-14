import React, { useState, useEffect } from 'react';

const YouTubeVideoModal = ({ isOpen, onClose, onSubmit, title: modalTitle, initialData }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setYoutubeUrl(initialData.videoUrl || '');
      setTitle(initialData.title || '');
    } else {
      setYoutubeUrl('');
      setTitle('');
    }
  }, [initialData, isOpen]);

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getVideoThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        alert('Please enter a valid YouTube URL');
        setLoading(false);
        return;
      }

      const videoData = {
        title: title || `YouTube Video ${videoId}`,
        description: `YouTube video: ${youtubeUrl}`,
        videoUrl: youtubeUrl,
        videoId: videoId,
        thumbnailUrl: getVideoThumbnail(videoId),
        category: initialData?.category || 'Foundation Overview',
        status: initialData?.status || 'active',
        platform: 'youtube',
        duration: initialData?.duration || '',
        uploadDate: initialData?.uploadDate || new Date().toISOString().split('T')[0],
        views: initialData?.views || 0
      };

      // Include ID if editing
      if (initialData?.id) {
        videoData.id = initialData.id;
      }

      await onSubmit(videoData);
      
      // Reset form
      setYoutubeUrl('');
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error adding YouTube video:', error);
      alert('Error adding video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setYoutubeUrl('');
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{modalTitle || "Add YouTube Video"}</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* YouTube URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL or ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtu.be/XXXXXXXXXXX or VIDEO_ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              disabled={loading || !youtubeUrl.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
            >
              {loading ? (initialData ? 'Updating...' : 'Adding...') : (initialData ? 'Update Video' : 'Add Video')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default YouTubeVideoModal;
