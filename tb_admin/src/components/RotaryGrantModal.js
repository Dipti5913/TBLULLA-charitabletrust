import React, { useState, useEffect } from 'react';

const RotaryGrantModal = ({ isOpen, onClose, onSubmit, title, initialData }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    rotaryGlobalGrantNo: '',
    totalProjectCost: '',
    contributionByKishorLulla: '',
    hostClub: '',
    foreignPartner: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        projectName: initialData.projectName || initialData.title || '',
        rotaryGlobalGrantNo: initialData.rotaryGlobalGrantNo || '',
        totalProjectCost: initialData.totalProjectCost || '',
        contributionByKishorLulla: initialData.contributionByKishorLulla || '',
        hostClub: initialData.hostClub || '',
        foreignPartner: initialData.foreignPartner || ''
      });
    } else {
      setFormData({
        projectName: '',
        rotaryGlobalGrantNo: '',
        totalProjectCost: '',
        contributionByKishorLulla: '',
        hostClub: '',
        foreignPartner: ''
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
      const grantData = {
        projectName: formData.projectName,
        rotaryGlobalGrantNo: formData.rotaryGlobalGrantNo,
        totalProjectCost: formData.totalProjectCost,
        contributionByKishorLulla: formData.contributionByKishorLulla,
        hostClub: formData.hostClub,
        foreignPartner: formData.foreignPartner,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await onSubmit(grantData);
      onClose();
    } catch (error) {
      console.error('Error submitting grant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      projectName: '',
      rotaryGlobalGrantNo: '',
      totalProjectCost: '',
      contributionByKishorLulla: '',
      hostClub: '',
      foreignPartner: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col mx-2 sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add Rotary Global Grant</h2>
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
          {/* Project Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="Enter project name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>

          {/* Rotary Global Grant No Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rotary Global Grant No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="rotaryGlobalGrantNo"
              value={formData.rotaryGlobalGrantNo}
              onChange={handleInputChange}
              placeholder="e.g., GG1634682"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>

          {/* Total Project Cost and Contribution Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Project Cost Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Project Cost <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="totalProjectCost"
                value={formData.totalProjectCost}
                onChange={handleInputChange}
                placeholder="e.g., $34,185"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* Contribution by Kishor Lulla Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contribution by Rtn. Kishor Lulla <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contributionByKishorLulla"
                value={formData.contributionByKishorLulla}
                onChange={handleInputChange}
                placeholder="e.g., $25,000"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Host Club and Foreign Partner Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Host Club Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Host Club <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hostClub"
                value={formData.hostClub}
                onChange={handleInputChange}
                placeholder="e.g., Sangli Krishna Valley"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>

            {/* Foreign Partner Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foreign Partner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="foreignPartner"
                value={formData.foreignPartner}
                onChange={handleInputChange}
                placeholder="e.g., RC King of Prussia (USA)"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
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
              disabled={loading || !formData.projectName.trim() || !formData.rotaryGlobalGrantNo.trim() || !formData.totalProjectCost.trim() || !formData.contributionByKishorLulla.trim() || !formData.hostClub.trim() || !formData.foreignPartner.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
            >
              {loading ? 'Adding...' : 'Add Global Grant'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RotaryGrantModal;
