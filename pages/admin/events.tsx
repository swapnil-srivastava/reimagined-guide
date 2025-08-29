'use client';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

import EventManagement from '../../components/EventManagement';
import { useSession } from '../../lib/use-session';

function AdminEventsPage() {
  const userInfo = useSession();

  return (
    <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-fun-blue-500 to-fun-blue-700 dark:from-fun-blue-600 dark:to-fun-blue-800 py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Layout */}
          <div className="block md:hidden text-center mb-6">
            <div className="flex justify-center mb-4">
              <FontAwesomeIcon icon={faShieldAlt} className="text-hit-pink-500 text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-blog-white mb-4">
              <FormattedMessage
                id="admin-events-page-title"
                description="Admin Events page title"
                defaultMessage="Admin Panel"
              />
            </h1>
            <div className="flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faCalendarPlus} className="text-hit-pink-400 text-sm" />
              <p className="text-sm text-blog-white">
                <FormattedMessage
                  id="admin-events-page-subtitle"
                  description="Admin Events page subtitle"
                  defaultMessage="Manage events and invitations for your community"
                />
              </p>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="flex items-center gap-4 mb-6">
              <FontAwesomeIcon icon={faShieldAlt} className="text-hit-pink-500 text-3xl" />
              <h1 className="text-4xl font-bold text-blog-white">
                <FormattedMessage
                  id="admin-events-page-title"
                  description="Admin Events page title"
                  defaultMessage="Admin Panel"
                />
              </h1>
            </div>
            <div className="flex items-center gap-3 text-blog-white">
              <FontAwesomeIcon icon={faCalendarPlus} className="text-hit-pink-400" />
              <p className="text-lg text-blog-white">
                <FormattedMessage
                  id="admin-events-page-subtitle"
                  description="Admin Events page subtitle"
                  defaultMessage="Manage events and invitations for your community"
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Management Component */}
      <EventManagement />
    </div>
  );
}

export default AdminEventsPage;
