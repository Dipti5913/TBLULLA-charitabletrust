import React, { useState, useEffect } from 'react';
import BlogModal from '../components/BlogModal';
import { blogService, uploadFile } from '../services/firebaseService';
import { serverTimestamp } from 'firebase/firestore';

const OurBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const blogsData = await blogService.getAll();
      console.log('Admin: Loaded blogs data:', blogsData);
      blogsData.forEach((blog, index) => {
        console.log(`Admin: Blog ${index + 1}:`, {
          id: blog.id,
          title: blog.title,
          image: blog.image,
          imageUrl: blog.imageUrl,
          imageType: typeof (blog.imageUrl || blog.image),
          hasImage: !!(blog.imageUrl || blog.image)
        });
      });
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('OurBlogs: Starting blog submission...', formData);
      
      let imageUrl = null;
      if (formData.image && formData.image instanceof File) {
        console.log('OurBlogs: Uploading image...', formData.image.name);
        const imagePath = `blogs/${Date.now()}_${formData.image.name}`;
        imageUrl = await uploadFile(formData.image, imagePath);
        console.log('OurBlogs: Image uploaded successfully:', imageUrl);
      } else if (typeof formData.imageUrl === 'string' && formData.imageUrl.trim()) {
        imageUrl = formData.imageUrl.trim();
        console.log('OurBlogs: Reusing provided imageUrl:', imageUrl);
      } else if (typeof formData.image === 'string' && formData.image.trim()) {
        imageUrl = formData.image.trim();
        console.log('OurBlogs: Reusing provided image (url string):', imageUrl);
      }
      console.log('OurBlogs: Selected image URL for save:', imageUrl);

      const baseData = {
        title: formData.title,
        content: formData.description,
        description: formData.description, // Client fallback
        excerpt: formData.description.substring(0, 200) + '...',
        publishDate: formData.date,
        date: formData.date, // Client fallback
        author: formData.author || 'Admin',
        category: formData.category || 'General',
        status: 'published', // Always published
        readTime: '5 min read',
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const blogData = imageUrl
        ? { ...baseData, image: imageUrl, imageUrl }
        : { ...baseData };
      
      console.log('OurBlogs: Final blog data:', blogData);

      if (editingBlog) {
        await blogService.update(editingBlog.id, blogData);
      } else {
        await blogService.create(blogData);
      }

      await loadBlogs();
      setEditingBlog(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving blog:', error);
      throw error; // Re-throw error so BlogModal can handle it
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogService.delete(id);
        await loadBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Blogs Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Blog Post
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Blog Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Author
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
              {blogs.map((blog) => {
                const chosenImage = (typeof blog.imageUrl === 'string' && blog.imageUrl.trim())
                  ? blog.imageUrl.trim()
                  : (typeof blog.image === 'string' && blog.image.trim())
                    ? blog.image.trim()
                    : '';
                return (
                <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {chosenImage ? (
                        <img 
                          src={chosenImage}
                          alt={blog.title}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            console.error('Admin: Blog image failed to load:', { imageUrl: blog.imageUrl, image: blog.image, chosen: chosenImage });
                            const img = e.currentTarget;
                            // Retry once with no-referrer
                            if (!img.dataset.retry) {
                              img.dataset.retry = '1';
                              img.setAttribute('referrerpolicy', 'no-referrer');
                              img.src = chosenImage; // retry once
                              return;
                            }
                            // Stop infinite loops by removing onerror after retry
                            img.onerror = null;
                            // Show placeholder
                            img.style.display = 'none';
                            const placeholder = img.nextElementSibling;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('Admin: Blog image loaded:', chosenImage);
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 mr-3 flex items-center justify-center text-slate-500">
                          N/A
                        </div>
                      )}
                      <div className="w-12 h-12 rounded-lg bg-gray-200 mr-3 flex items-center justify-center" style={{display: chosenImage ? 'none' : 'flex'}}>
                        <span className="text-xs text-gray-500">No img</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {blog.title}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {blog.excerpt?.substring(0, 100)}...
                        </div>
                        <div className="text-xs text-slate-400">
                          {blog.publishDate} • {blog.readTime}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                    {blog.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <BlogModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBlog(null);
        }}
        onSubmit={handleSubmit}
        title={editingBlog ? 'Edit Blog Post' : 'Add Blog Post'}
        initialData={editingBlog}
      />
    </div>
  );
};

export default OurBlogs;
