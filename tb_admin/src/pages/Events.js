import React, { useState, useEffect } from 'react';
import EventModal from '../components/EventModal';
import { eventService, uploadFile } from '../services/firebaseService';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await eventService.getAll();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('EVENTS: Starting handleSubmit with formData:', formData);
      
      let uploadedImageUrls = [];
      let existingImageUrls = formData.existingImages || [];
      
      // Handle multiple new image uploads
      if (formData.images && formData.images.length > 0) {
        console.log('EVENTS: Uploading', formData.images.length, 'new images');
        
        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i];
          try {
            const imagePath = `events/${Date.now()}_${i}_${image.name}`;
            console.log('EVENTS: Uploading image:', imagePath);
            const imageUrl = await uploadFile(image, imagePath);
            console.log('EVENTS: Successfully uploaded:', imageUrl);
            uploadedImageUrls.push(imageUrl);
          } catch (uploadError) {
            console.error('EVENTS: Error uploading image:', uploadError);
            alert(`Failed to upload image ${image.name}. Please try again.`);
            return;
          }
        }
      }
      
      // Combine existing and new images
      const allImages = [...existingImageUrls, ...uploadedImageUrls];
      console.log('EVENTS: All images combined:', allImages);
      
      // Set primary image for backward compatibility
      const primaryImage = allImages.length > 0 ? allImages[0] : '';

      const eventData = {
        year: formData.year,
        title: formData.title,
        description: formData.description,
        date: formData.date || new Date().toISOString().split('T')[0],
        time: formData.time || new Date().toLocaleTimeString('en-US', { hour12: false }),
        location: formData.location || 'To be announced',
        status: formData.status || 'upcoming',
        attendees: formData.attendees || 0,
        imageUrl: primaryImage, // Keep for backward compatibility
        images: allImages // New multiple images array
      };

      console.log('EVENTS: Final event data:', eventData);

      if (editingEvent) {
        console.log('EVENTS: Updating existing event:', editingEvent.id);
        await eventService.update(editingEvent.id, eventData);
      } else {
        console.log('EVENTS: Creating new event');
        await eventService.create(eventData);
      }

      console.log('EVENTS: Event saved successfully');
      await loadEvents();
      setEditingEvent(null);
      setShowModal(false);
      alert('Event saved successfully!');
    } catch (error) {
      console.error('EVENTS: Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.delete(id);
        await loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Events Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add New Event
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {/* Display first image from multiple images or single imageUrl */}
                      {((event.images && event.images.length > 0) || event.imageUrl) && (
                        <div className="relative mr-3">
                          <img 
                            src={(event.images && event.images.length > 0) ? event.images[0] : event.imageUrl} 
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          {/* Show image count badge if multiple images */}
                          {event.images && event.images.length > 1 && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {event.images.length}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {event.title}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {event.description?.substring(0, 100)}...
                        </div>
                        <div className="text-xs text-slate-400">
                          Year: {event.year} • {event.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 dark:text-white">{event.date}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{event.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
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

      <EventModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmit}
        title={editingEvent ? 'Edit Event' : 'Add New Event'}
        initialData={editingEvent}
      />
    </div>
  );
};

export default Events;
