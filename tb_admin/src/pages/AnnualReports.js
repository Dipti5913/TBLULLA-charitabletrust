import React, { useState, useEffect } from 'react';
import AnnualReportModal from '../components/AnnualReportModal';
import { reportService } from '../services/firebaseService';

const AnnualReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format year as academic year (e.g., 2025 -> 2025-26)
  const formatAcademicYear = (year) => {
    const currentYear = parseInt(year);
    const nextYear = (currentYear + 1).toString().slice(-2);
    return `${currentYear}-${nextYear}`;
  };

  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const reportsData = await reportService.getAll();
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (reportData) => {
    try {
      if (editingReport) {
        await reportService.update(editingReport.id, reportData);
      } else {
        await reportService.create(reportData);
      }

      await loadReports();
      setEditingReport(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportService.delete(id);
        await loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowModal(true);
  };

  const handleStatusChange = (id, newStatus) => {
    setReports(reports.map(report => 
      report.id === id ? { ...report, status: newStatus } : report
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Annual Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage foundation annual reports and publications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add New Report
        </button>
      </div>


      <div className="grid gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white break-words">{report.label || report.title || 'Untitled Report'}</h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400 break-all">({report.year ? formatAcademicYear(report.year) : 'N/A'})</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">{report.description || 'No description available'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'Draft'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">File Size</span>
                <p className="font-medium text-slate-900 dark:text-white">{report.fileSize || '0 MB'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Downloads</span>
                <p className="font-medium text-slate-900 dark:text-white">{(report.downloadCount || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Upload Date</span>
                <p className="font-medium text-slate-900 dark:text-white">{report.uploadDate || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Actions</span>
                <div className="flex gap-2">
                  {report.url && (
                    <a 
                      href={report.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Download
                    </a>
                  )}
                  <button 
                    onClick={() => handleEditReport(report)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={report.status}
                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <button
                onClick={() => handleDeleteReport(report.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnnualReportModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingReport(null);
        }}
        onSubmit={handleSubmit}
        title={editingReport ? 'Edit Annual Report' : 'Add Annual Report'}
        initialData={editingReport}
      />
    </div>
  );
};

export default AnnualReports;
