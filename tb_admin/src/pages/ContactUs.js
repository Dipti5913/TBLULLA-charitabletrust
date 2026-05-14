import React, { useState, useEffect } from 'react';
import { contactService } from '../services/firebaseService';

const ContactUs = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const messagesData = await contactService.getAll();
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await contactService.update(id, { status: newStatus });
      await loadMessages();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    try {
      await contactService.update(id, { priority: newPriority });
      await loadMessages();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await contactService.delete(id);
        await loadMessages();
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const handleReply = (e) => {
    e.preventDefault();
    // In a real app, this would send an email
    console.log('Reply sent:', replyText);
    handleStatusChange(selectedMessage.id, 'replied');
    setShowReplyForm(false);
    setReplyText('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'replied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Contact Messages</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage inquiries and messages from website visitors</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
            {messages.length} Total Messages
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all hover:shadow-xl ${
                selectedMessage && selectedMessage.id === message.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMessage(message)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{message.name || 'Unknown'}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      {message.priority || 'medium'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{message.email || 'No email'}</p>
                  <p className="font-medium text-slate-900 dark:text-white mb-2">{message.subject || 'No subject'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(message.status)}`}>
                  {message.status ? message.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
                </span>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                {message.message || 'No message content'}
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-500">{message.date || 'No date'}</span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(message.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Detail Panel */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">From</label>
                  <p className="text-slate-900 dark:text-white">{selectedMessage.name || 'Unknown'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                  <p className="text-slate-900 dark:text-white">{selectedMessage.email || 'No email'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone</label>
                  <p className="text-slate-900 dark:text-white">{selectedMessage.phone || 'No phone'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Subject</label>
                  <p className="text-slate-900 dark:text-white">{selectedMessage.subject || 'No subject'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Message</label>
                  <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 p-3 rounded-lg mt-1">
                    {selectedMessage.message || 'No message content'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedMessage.priority || 'medium'}
                    onChange={(e) => handlePriorityChange(selectedMessage.id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReplyForm(true)}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                    className="flex-1 bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                  >
                    Email
                  </button>
                </div>
              </div>
              
              {showReplyForm && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <form onSubmit={handleReply} className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
                      rows="4"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        Send Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReplyForm(false)}
                        className="flex-1 bg-slate-500 text-white px-3 py-2 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-slate-500 dark:text-slate-400">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
