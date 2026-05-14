import React, { useState, useEffect } from 'react';
import ProjectModal from '../components/ProjectModal';
import { projectService, uploadFile } from '../services/firebaseService';

const OurProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectsData = await projectService.getAll();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('OUR_PROJECTS: Starting handleSubmit with formData:', formData);
      
      let uploadedImageUrls = [];
      let existingImageUrls = formData.existingImages || [];
      
      // Handle multiple new image uploads
      if (formData.images && formData.images.length > 0) {
        console.log('OUR_PROJECTS: Uploading', formData.images.length, 'new images');
        
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          try {
            const fileName = `projects/${Date.now()}_${i}_${file.name}`;
            console.log('OUR_PROJECTS: Uploading file:', fileName);
            const downloadURL = await uploadFile(file, fileName);
            console.log('OUR_PROJECTS: Successfully uploaded:', downloadURL);
            uploadedImageUrls.push(downloadURL);
          } catch (uploadError) {
            console.error('OUR_PROJECTS: Error uploading image:', uploadError);
            alert(`Failed to upload image ${file.name}. Please try again.`);
            return;
          }
        }
      }
      
      // Combine existing and new images
      const allImages = [...existingImageUrls, ...uploadedImageUrls];
      console.log('OUR_PROJECTS: All images combined:', allImages);
      
      // Set primary image for backward compatibility
      const primaryImage = allImages.length > 0 ? allImages[0] : '';
      
      const projectData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        status: formData.status || 'planning',
        budget: formData.budget || '$0',
        progress: formData.progress || 0,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        location: formData.location || 'To be determined',
        beneficiaries: formData.beneficiaries || 0,
        imageUrl: primaryImage, // Keep for backward compatibility
        images: allImages // New multiple images array
      };

      console.log('OUR_PROJECTS: Final project data:', projectData);

      if (editingProject) {
        console.log('OUR_PROJECTS: Updating existing project:', editingProject.id);
        await projectService.update(editingProject.id, projectData);
      } else {
        console.log('OUR_PROJECTS: Creating new project');
        await projectService.create(projectData);
      }

      console.log('OUR_PROJECTS: Project saved successfully');
      await loadProjects();
      setEditingProject(null);
      setShowModal(false);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('OUR_PROJECTS: Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(id);
        await loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Project
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Project Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {project.imageUrl && (
                        <img 
                          src={project.imageUrl} 
                          alt={project.title}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {project.title}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {project.description?.substring(0, 100)}...
                        </div>
                        <div className="text-xs text-slate-400">
                          {project.location} • {project.beneficiaries} beneficiaries
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProject(null);
        }}
        onSubmit={handleSubmit}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        initialData={editingProject}
      />
    </div>
  );
};

export default OurProjects;
