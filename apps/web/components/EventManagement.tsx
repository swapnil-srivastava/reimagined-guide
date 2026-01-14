'use client';

import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faCalendar,
  faMapMarkerAlt,
  faClock,
  faUsers,
  faEye,
  faEyeSlash,
  faSave,
  faTimes,
  faSearch,
  faFilter,
  faSort,
  faChevronDown,
  faChevronUp,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
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
  max_attendees?: number;
  is_public?: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  max_attendees: string;
  is_public: boolean;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  image_url: '',
  max_attendees: '',
  is_public: true
};

function EventManagement() {
  const intl = useIntl();
  const userInfo = useSession();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Check if user is authorized admin
  const isAuthorized = userInfo.session?.user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID;

  useEffect(() => {
    if (isAuthorized) {
      fetchEvents();
    }
  }, [isAuthorized]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supaClient
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        toast.error(intl.formatMessage({
          id: 'admin-events-fetch-error',
          description: 'Failed to load events',
          defaultMessage: 'Failed to load events'
        }));
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(intl.formatMessage({
        id: 'admin-events-unexpected-error',
        description: 'Unexpected error',
        defaultMessage: 'An unexpected error occurred'
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingEvent(null);
    setShowForm(false);
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
        id: 'admin-events-unauthorized',
        description: 'Unauthorized access',
        defaultMessage: 'You are not authorized to perform this action'
      }));
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const payload = editingEvent
        ? { ...formData, max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null, id: editingEvent.id }
        : { ...formData, max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null };

      // Get the access token from the session
      const { data: { session } } = await supaClient.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        toast.error(intl.formatMessage({
          id: 'admin-events-no-session',
          description: 'No session found',
          defaultMessage: 'No authentication session found. Please log in again.'
        }));
        setSubmitting(false);
        return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(intl.formatMessage({
          id: editingEvent ? 'admin-events-update-success' : 'admin-events-create-success',
          description: editingEvent ? 'Event updated successfully' : 'Event created successfully',
          defaultMessage: editingEvent ? 'Event updated successfully!' : 'Event created successfully!'
        }));

        resetForm();
        fetchEvents();
      } else {
        toast.error(result.error || intl.formatMessage({
          id: 'admin-events-submit-error',
          description: 'Error submitting event',
          defaultMessage: 'Failed to save event'
        }));
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      toast.error(intl.formatMessage({
        id: 'admin-events-submit-unexpected-error',
        description: 'Unexpected error submitting event',
        defaultMessage: 'An unexpected error occurred while saving the event'
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
      date: event.date,
      time: event.time,
      location: event.location,
      image_url: event.image_url || '',
      max_attendees: event.max_attendees?.toString() || '',
      is_public: event.is_public ?? true
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!isAuthorized) {
      toast.error(intl.formatMessage({
        id: 'admin-events-unauthorized',
        description: 'Unauthorized access',
        defaultMessage: 'You are not authorized to perform this action'
      }));
      return;
    }

    const confirmDelete = window.confirm(intl.formatMessage({
      id: 'admin-events-delete-confirm',
      description: 'Confirm delete event',
      defaultMessage: 'Are you sure you want to delete this event? This action cannot be undone.'
    }));

    if (!confirmDelete) return;

    try {
      // Get the access token from the session
      const { data: { session } } = await supaClient.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        toast.error(intl.formatMessage({
          id: 'admin-events-no-session',
          description: 'No session found',
          defaultMessage: 'No authentication session found. Please log in again.'
        }));
        return;
      }

      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id: eventId
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(intl.formatMessage({
          id: 'admin-events-delete-success',
          description: 'Event deleted successfully',
          defaultMessage: 'Event deleted successfully!'
        }));
        fetchEvents();
      } else {
        toast.error(result.error || intl.formatMessage({
          id: 'admin-events-delete-error',
          description: 'Error deleting event',
          defaultMessage: 'Failed to delete event'
        }));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(intl.formatMessage({
        id: 'admin-events-delete-unexpected-error',
        description: 'Unexpected error deleting event',
        defaultMessage: 'An unexpected error occurred while deleting the event'
      }));
    }
  };

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());

      const eventDate = new Date(event.date);
      const now = new Date();
      const matchesFilter = filterStatus === 'all' ||
                          (filterStatus === 'upcoming' && eventDate >= now) ||
                          (filterStatus === 'past' && eventDate < now);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(intl.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
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
          <p className="text-gray-600 dark:text-blog-white">
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fun-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blog-black dark:text-blog-white">
              <FormattedMessage
                id="admin-events-title"
                description="Event Management"
                defaultMessage="Event Management"
              />
            </h1>
            <p className="text-gray-600 dark:text-blog-white mt-2">
              <FormattedMessage
                id="admin-events-subtitle"
                description="Create and manage your events"
                defaultMessage="Create and manage your events"
              />
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fun-blue-500 to-fun-blue-600 hover:from-fun-blue-600 hover:to-fun-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <FormattedMessage
              id="admin-events-create-new"
              description="Create New Event"
              defaultMessage="Create New Event"
            />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-fun-blue-600 rounded-lg p-4 border border-gray-200 dark:border-fun-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-blog-white">
                  <FormattedMessage
                    id="admin-events-total"
                    description="Total Events"
                    defaultMessage="Total Events"
                  />
                </p>
                <p className="text-2xl font-bold text-blog-black dark:text-blog-white">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-fun-blue-600 rounded-lg p-4 border border-gray-200 dark:border-fun-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-blog-white">
                  <FormattedMessage
                    id="admin-events-upcoming"
                    description="Upcoming"
                    defaultMessage="Upcoming"
                  />
                </p>
                <p className="text-2xl font-bold text-blog-black dark:text-blog-white">
                  {events.filter(event => !isEventPast(event.date)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-fun-blue-600 rounded-lg p-4 border border-gray-200 dark:border-fun-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-blog-white">
                  <FormattedMessage
                    id="admin-events-public"
                    description="Public Events"
                    defaultMessage="Public Events"
                  />
                </p>
                <p className="text-2xl font-bold text-blog-black dark:text-blog-white">
                  {events.filter(event => event.is_public).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <input
              type="text"
              placeholder={intl.formatMessage({
                id: 'admin-events-search-placeholder',
                description: 'Search events...',
                defaultMessage: 'Search events...'
              })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-fun-blue-600 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-white dark:bg-fun-blue-600 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white hover:bg-gray-50 dark:hover:bg-fun-blue-700 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
            <FormattedMessage
              id="admin-events-filters"
              description="Filters"
              defaultMessage="Filters"
            />
            <FontAwesomeIcon
              icon={showFilters ? faChevronUp : faChevronDown}
              className="w-3 h-3"
            />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white dark:bg-fun-blue-600 rounded-lg border border-gray-200 dark:border-fun-blue-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                  <FormattedMessage
                    id="admin-events-filter-status"
                    description="Status"
                    defaultMessage="Status"
                  />
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-500"
                >
                  <option value="all">
                    <FormattedMessage
                      id="admin-events-filter-all"
                      description="All Events"
                      defaultMessage="All Events"
                    />
                  </option>
                  <option value="upcoming">
                    <FormattedMessage
                      id="admin-events-filter-upcoming"
                      description="Upcoming"
                      defaultMessage="Upcoming"
                    />
                  </option>
                  <option value="past">
                    <FormattedMessage
                      id="admin-events-filter-past"
                      description="Past Events"
                      defaultMessage="Past Events"
                    />
                  </option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                  <FormattedMessage
                    id="admin-events-sort-by"
                    description="Sort By"
                    defaultMessage="Sort By"
                  />
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-500"
                >
                  <option value="date">
                    <FormattedMessage
                      id="admin-events-sort-date"
                      description="Date"
                      defaultMessage="Date"
                    />
                  </option>
                  <option value="title">
                    <FormattedMessage
                      id="admin-events-sort-title"
                      description="Title"
                      defaultMessage="Title"
                    />
                  </option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                  <FormattedMessage
                    id="admin-events-sort-order"
                    description="Order"
                    defaultMessage="Order"
                  />
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-500"
                >
                  <option value="desc">
                    <FormattedMessage
                      id="admin-events-sort-desc"
                      description="Newest First"
                      defaultMessage="Newest First"
                    />
                  </option>
                  <option value="asc">
                    <FormattedMessage
                      id="admin-events-sort-asc"
                      description="Oldest First"
                      defaultMessage="Oldest First"
                    />
                  </option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-fun-blue-600 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blog-black dark:text-blog-white">
                  {editingEvent ? (
                    <FormattedMessage
                      id="admin-events-edit-title"
                      description="Edit Event"
                      defaultMessage="Edit Event"
                    />
                  ) : (
                    <FormattedMessage
                      id="admin-events-create-title"
                      description="Create New Event"
                      defaultMessage="Create New Event"
                    />
                  )}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-fun-blue-700 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-500 dark:text-blog-white" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                    <FormattedMessage
                      id="admin-events-form-title"
                      description="Event Title *"
                      defaultMessage="Event Title *"
                    />
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent"
                    placeholder={intl.formatMessage({
                      id: 'admin-events-title-placeholder',
                      description: 'Enter event title',
                      defaultMessage: 'Enter event title'
                    })}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                    <FormattedMessage
                      id="admin-events-form-description"
                      description="Description"
                      defaultMessage="Description"
                    />
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent resize-none"
                    placeholder={intl.formatMessage({
                      id: 'admin-events-description-placeholder',
                      description: 'Enter event description',
                      defaultMessage: 'Enter event description'
                    })}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                      <FormattedMessage
                        id="admin-events-form-date"
                        description="Date *"
                        defaultMessage="Date *"
                      />
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                      <FormattedMessage
                        id="admin-events-form-time"
                        description="Time *"
                        defaultMessage="Time *"
                      />
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Location and Max Attendees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FormattedMessage
                        id="admin-events-form-location"
                        description="Location *"
                        defaultMessage="Location *"
                      />
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent"
                      placeholder={intl.formatMessage({
                        id: 'admin-events-location-placeholder',
                        description: 'Enter event location',
                        defaultMessage: 'Enter event location'
                      })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                      <FormattedMessage
                        id="admin-events-form-max-attendees"
                        description="Max Attendees"
                        defaultMessage="Max Attendees"
                      />
                    </label>
                    <input
                      type="number"
                      name="max_attendees"
                      value={formData.max_attendees}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent"
                      placeholder={intl.formatMessage({
                        id: 'admin-events-max-attendees-placeholder',
                        description: 'Optional',
                        defaultMessage: 'Optional'
                      })}
                      min="1"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-blog-white mb-2">
                    <FormattedMessage
                      id="admin-events-form-image"
                      description="Image URL"
                      defaultMessage="Image URL"
                    />
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-fun-blue-700 border border-gray-300 dark:border-fun-blue-400 rounded-lg text-blog-black dark:text-blog-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fun-blue-500 focus:border-transparent"
                    placeholder={intl.formatMessage({
                      id: 'admin-events-image-placeholder',
                      description: 'https://example.com/image.jpg',
                      defaultMessage: 'https://example.com/image.jpg'
                    })}
                  />
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                    className="h-4 w-4 text-fun-blue-600 focus:ring-fun-blue-500 border-gray-300 dark:border-fun-blue-400 rounded"
                  />
                  <label htmlFor="is_public" className="ml-2 text-sm text-gray-700 dark:text-blog-white">
                    <FormattedMessage
                      id="admin-events-form-public"
                      description="Make this event public"
                      defaultMessage="Make this event public"
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fun-blue-500 to-fun-blue-600 hover:from-fun-blue-600 hover:to-fun-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                    {submitting ? (
                      <FormattedMessage
                        id="admin-events-saving"
                        description="Saving..."
                        defaultMessage="Saving..."
                      />
                    ) : editingEvent ? (
                      <FormattedMessage
                        id="admin-events-update-btn"
                        description="Update Event"
                        defaultMessage="Update Event"
                      />
                    ) : (
                      <FormattedMessage
                        id="admin-events-create-btn"
                        description="Create Event"
                        defaultMessage="Create Event"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="px-6 py-3 bg-gray-100 dark:bg-fun-blue-700 text-gray-700 dark:text-blog-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-fun-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FormattedMessage
                      id="admin-events-cancel-btn"
                      description="Cancel"
                      defaultMessage="Cancel"
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {filteredAndSortedEvents.length > 0 ? (
          filteredAndSortedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-fun-blue-600 rounded-xl shadow-sm border border-gray-200 dark:border-fun-blue-500 p-6 hover:shadow-md transition-all duration-200 hover:brightness-105"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-blog-black dark:text-blog-white mb-2">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-gray-600 dark:text-blog-white mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.is_public ?? true
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-blog-white'
                      }`}>
                        {event.is_public ?? true ? (
                          <FontAwesomeIcon icon={faEye} className="w-3 h-3 mr-1" />
                        ) : (
                          <FontAwesomeIcon icon={faEyeSlash} className="w-3 h-3 mr-1" />
                        )}
                        {event.is_public ?? true ? 'Public' : 'Private'}
                      </span>

                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isEventPast(event.date)
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-blog-white'
                          : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200' 
                      }`}>
                        {isEventPast(event.date) ? 'Past' : 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-blog-white">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>

                    {event.max_attendees && (
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                        <span>Max {event.max_attendees}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                    <FormattedMessage
                      id="admin-events-edit-btn"
                      description="Edit"
                      defaultMessage="Edit"
                    />
                  </button>

                  <button
                    onClick={() => handleDelete(event.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    <FormattedMessage
                      id="admin-events-delete-btn"
                      description="Delete"
                      defaultMessage="Delete"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCalendar} className="w-12 h-12 text-gray-400 dark:text-blog-white" />
            </div>
            <h3 className="text-lg font-medium text-blog-black dark:text-blog-white mb-2">
              {searchTerm || filterStatus !== 'all' ? (
                <FormattedMessage
                  id="admin-events-no-results-title"
                  description="No events found"
                  defaultMessage="No events found"
                />
              ) : (
                <FormattedMessage
                  id="admin-events-empty-title"
                  description="No events yet"
                  defaultMessage="No events yet"
                />
              )}
            </h3>
            <p className="text-gray-500 dark:text-blog-white mb-6">
              {searchTerm || filterStatus !== 'all' ? (
                <FormattedMessage
                  id="admin-events-no-results-description"
                  description="Try adjusting your search or filters"
                  defaultMessage="Try adjusting your search or filters"
                />
              ) : (
                <FormattedMessage
                  id="admin-events-empty-description"
                  description="Get started by creating your first event"
                  defaultMessage="Get started by creating your first event"
                />
              )}
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fun-blue-500 to-fun-blue-600 hover:from-fun-blue-600 hover:to-fun-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 shadow-sm"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                <FormattedMessage
                  id="admin-events-create-first"
                  description="Create Your First Event"
                  defaultMessage="Create Your First Event"
                />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventManagement;
