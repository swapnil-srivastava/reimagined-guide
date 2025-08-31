'use client';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

import EventManagement from '../../components/EventManagement';
import { useSession } from '../../lib/use-session';

function AdminEventsPage() {
  const userInfo = useSession();

  return (
    <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500">
      {/* Header Section */}
      <div className="bg-white dark:bg-fun-blue-600 border-b border-gray-200 dark:border-fun-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fun-blue-100 dark:bg-fun-blue-800 rounded-lg">
              <FontAwesomeIcon icon={faCalendar} className="w-6 h-6 text-fun-blue-600 dark:text-fun-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blog-black dark:text-blog-white">
                <FormattedMessage
                  id="admin-events-page-title"
                  description="Admin Events"
                  defaultMessage="Admin Events"
                />
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                <FormattedMessage
                  id="admin-events-page-subtitle"
                  description="Manage events and RSVPs"
                  defaultMessage="Manage events and RSVPs"
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventManagement />
      </div>
    </div>
  );
}

export default AdminEventsPage;
