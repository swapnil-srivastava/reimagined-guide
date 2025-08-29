'use client';

import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faCalendar,
  faClock,
  faMapMarkerAlt,
  faSave,
  faCancel,
  faImage,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import Image from 'next/image';
import moment from 'moment';

import { supaClient } from '../supa-client';
import { useSession } from '../lib/use-session';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  image_url: ''
};

function EventManagement() {
  const intl = useIntl();
  const userInfo = useSession();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Check if user is authorized admin
  const isAuthorized = userInfo.session?.user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID;

  // Convert 24-hour time to 12-hour format for display
  const formatTimeFor12Hour = (time: string) => {
    if (!time) return '';
    
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const timeParts = time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    if (hours === 0) {
      return `12:${minutes} AM`;
    } else if (hours < 12) {
      return `${hours}:${minutes} AM`;
    } else if (hours === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hours - 12}:${minutes} PM`;
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchEvents();
    }
  }, [isAuthorized]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supaClient
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        toast.error(intl.formatMessage({
          id: "admin-events-fetch-error",
          description: "Error fetching events",
          defaultMessage: "Failed to load events"
        }));
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(intl.formatMessage({
        id: "admin-events-unexpected-error",
        description: "Unexpected error",
        defaultMessage: "An unexpected error occurred"
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthorized) {
      toast.error(intl.formatMessage({
        id: "admin-events-unauthorized",
        description: "Unauthorized access",
        defaultMessage: "You are not authorized to perform this action"
      }));
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      const payload = editingEvent 
        ? { ...formData, id: editingEvent.id, organizer_id: userInfo.session?.user?.id }
        : { ...formData, organizer_id: userInfo.session?.user?.id };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(intl.formatMessage({
          id: editingEvent ? "admin-events-update-success" : "admin-events-create-success",
          description: editingEvent ? "Event updated successfully" : "Event created successfully",
          defaultMessage: editingEvent ? "Event updated successfully!" : "Event created successfully!"
        }));
        
        setFormData(initialFormData);
        setShowForm(false);
        setEditingEvent(null);
        fetchEvents();
      } else {
        toast.error(result.error || intl.formatMessage({
          id: "admin-events-submit-error",
          description: "Error submitting event",
          defaultMessage: "Failed to save event"
        }));
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      toast.error(intl.formatMessage({
        id: "admin-events-submit-unexpected-error",
        description: "Unexpected error submitting event",
        defaultMessage: "An unexpected error occurred while saving the event"
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: moment(event.date).format('YYYY-MM-DD'),
      time: formatTimeFor12Hour(event.time),
      location: event.location,
      image_url: event.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!isAuthorized) {
      toast.error(intl.formatMessage({
        id: "admin-events-unauthorized",
        description: "Unauthorized access",
        defaultMessage: "You are not authorized to perform this action"
      }));
      return;
    }

    const confirmDelete = window.confirm(intl.formatMessage({
      id: "admin-events-delete-confirm",
      description: "Confirm delete event",
      defaultMessage: "Are you sure you want to delete this event? This action cannot be undone."
    }));

    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: eventId, 
          organizer_id: userInfo.session?.user?.id 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(intl.formatMessage({
          id: "admin-events-delete-success",
          description: "Event deleted successfully",
          defaultMessage: "Event deleted successfully!"
        }));
        fetchEvents();
      } else {
        toast.error(result.error || intl.formatMessage({
          id: "admin-events-delete-error",
          description: "Error deleting event",
          defaultMessage: "Failed to delete event"
        }));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(intl.formatMessage({
        id: "admin-events-delete-unexpected-error",
        description: "Unexpected error deleting event",
        defaultMessage: "An unexpected error occurred while deleting the event"
      }));
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setShowForm(false);
    setEditingEvent(null);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-fun-blue-600 rounded-2xl p-8 drop-shadow-lg text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
          <h2 className="text-2xl font-bold text-blog-black dark:text-blog-white mb-4">
            <FormattedMessage
              id="admin-events-access-denied-title"
              description="Access denied title"
              defaultMessage="Access Denied"
            />
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            <FormattedMessage
              id="admin-events-access-denied-message"
              description="Access denied message"
              defaultMessage="You are not authorized to access this page. Only the admin user can manage events."
            />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-blog-black dark:text-blog-white mb-2">
            <FormattedMessage
              id="admin-events-title"
              description="Event Management title"
              defaultMessage="Event Management"
            />
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            <FormattedMessage
              id="admin-events-subtitle"
              description="Event Management subtitle"
              defaultMessage="Create and manage events for your community"
            />
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 shadow-sm"
        >
          <FontAwesomeIcon icon={faPlus} />
          <FormattedMessage
            id="admin-events-create-button"
            description="Create new event button"
            defaultMessage="Create Event"
          />
        </button>
      </div>

      {/* Event Form */}
      {showForm && (
        <div className="bg-white dark:bg-fun-blue-600 rounded-2xl p-8 drop-shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-blog-black dark:text-blog-white mb-6">
            {editingEvent ? (
              <FormattedMessage
                id="admin-events-edit-title"
                description="Edit event title"
                defaultMessage="Edit Event"
              />
            ) : (
              <FormattedMessage
                id="admin-events-create-title"
                description="Create event title"
                defaultMessage="Create New Event"
              />
            )}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blog-black dark:text-blog-white mb-2">
                  <FormattedMessage
                    id="admin-events-form-title-label"
                    description="Event title label"
                    defaultMessage="Event Title *"
                  />
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-fun-blue-600 border border-gray-200 dark:border-fun-blue-600 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent"
                  placeholder={intl.formatMessage({
                    id: "admin-events-form-title-placeholder",
                    description: "Event title placeholder",
                    defaultMessage: "Enter event title"
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blog-black dark:text-blog-white mb-2">
                  <FormattedMessage
                    id="admin-events-form-location-label"
                    description="Event location label"
                    defaultMessage="Location *"
                  />
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-fun-blue-600 border border-gray-200 dark:border-fun-blue-600 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent"
                  placeholder={intl.formatMessage({
                    id: "admin-events-form-location-placeholder",
                    description: "Event location placeholder",
                    defaultMessage: "Enter event location"
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blog-black dark:text-blog-white mb-2">
                  <FormattedMessage
                    id="admin-events-form-date-label"
                    description="Event date label"
                    defaultMessage="Date *"
                  />
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-fun-blue-600 border border-gray-200 dark:border-fun-blue-600 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blog-black dark:text-blog-white mb-2">
                  <FormattedMessage
                    id="admin-events-form-time-label"
                    description="Event time label"
                    defaultMessage="Time *"
                  />
                </label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-fun-blue-600 border border-gray-200 dark:border-fun-blue-600 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent"
                  placeholder={intl.formatMessage({
                    id: "admin-events-form-time-placeholder",
                    description: "Event time placeholder",
                    defaultMessage: "e.g., 7:00 PM"
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blog-black dark:text-blog-white mb-2">
                <FormattedMessage
                  id="admin-events-form-image-label"
                  description="Event image label"
                  defaultMessage="Image URL (Optional)"
                />
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white dark:bg-fun-blue-600 border border-gray-200 dark:border-fun-blue-600 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent"
                placeholder={intl.formatMessage({
                  id: "admin-events-form-image-placeholder",
                  description: "Event image placeholder",
                  defaultMessage: "https://example.com/image.jpg"
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blog-black dark:text-blog-white mb-2">
                <FormattedMessage
                  id="admin-events-form-description-label"
                  description="Event description label"
                  defaultMessage="Description (Optional)"
                />
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-fun-blue-600 border border-gray-200 dark:border-fun-blue-600 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:border-transparent resize-vertical"
                placeholder={intl.formatMessage({
                  id: "admin-events-form-description-placeholder",
                  description: "Event description placeholder",
                  defaultMessage: "Enter event description..."
                })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-hit-pink-500 text-blog-black rounded-lg px-4 py-2 m-2 transition-filter duration-500 hover:filter hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {submitting ? (
                  <FormattedMessage
                    id="admin-events-form-saving"
                    description="Saving event"
                    defaultMessage="Saving..."
                  />
                ) : editingEvent ? (
                  <FormattedMessage
                    id="admin-events-form-update"
                    description="Update event"
                    defaultMessage="Update Event"
                  />
                ) : (
                  <FormattedMessage
                    id="admin-events-form-create"
                    description="Create event"
                    defaultMessage="Create Event"
                  />
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="bg-gray-500 text-white rounded-lg px-4 py-2 m-2 transition-filter duration-500 hover:filter hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faCancel} className="mr-2" />
                <FormattedMessage
                  id="admin-events-form-cancel"
                  description="Cancel"
                  defaultMessage="Cancel"
                />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-blog-black dark:text-blog-white">
          <FormattedMessage
            id="admin-events-list-title"
            description="Events list title"
            defaultMessage="Existing Events"
          />
        </h2>

        {loading ? (
          <div className="bg-white dark:bg-fun-blue-600 rounded-2xl p-8 drop-shadow-lg text-center">
            <FormattedMessage
              id="admin-events-loading"
              description="Loading events"
              defaultMessage="Loading events..."
            />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white dark:bg-fun-blue-600 rounded-2xl p-8 drop-shadow-lg text-center">
            <FontAwesomeIcon icon={faCalendar} className="text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              <FormattedMessage
                id="admin-events-no-events"
                description="No events found"
                defaultMessage="No events found. Create your first event to get started!"
              />
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white dark:bg-fun-blue-600 rounded-2xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125 transition-all duration-300 overflow-hidden">
                {/* Event Image */}
                {event.image_url && (
                  <div className="relative h-48">
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                {/* Event Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-blog-black dark:text-blog-white">
                      {event.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] bg-fun-blue-300 dark:text-blog-black p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] bg-red-300 text-red-800 p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FontAwesomeIcon icon={faCalendar} className="text-fun-blue-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FontAwesomeIcon icon={faClock} className="text-fun-blue-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-fun-blue-500" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventManagement;
