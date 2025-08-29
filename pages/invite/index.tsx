'use client';

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendar, 
  faClock, 
  faMapMarkerAlt, 
  faUsers, 
  faHeart,
  faChevronDown,
  faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage, useIntl } from "react-intl";
import Image from "next/image";

import { supaClient } from "../../supa-client";

import { RootState } from "../../lib/interfaces/interface";
import { fetchInviteEvents } from "../../redux/actions/actions";

// CSS
import styles from "../../styles/Admin.module.css";
import RSVPForm from "../../components/RSVPForm";

function Invite() {
  const intl = useIntl();
  const dispatch = useDispatch();
  
  const selectInviteEvents = (state: RootState) => state.inviteEventsReducer;
  const { inviteEvents } = useSelector(selectInviteEvents);
  
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const { data: eventsData, error } = await supaClient
          .from('events')
          .select('*')
          .order('date', { ascending: true });
  
        if (error) throw error;
  
        if (eventsData && eventsData.length > 0) {
          dispatch(fetchInviteEvents(eventsData));
          toast.success(intl.formatMessage({
            id: "invite-events-retrieved",
            description: "Retrieved Events",
            defaultMessage: "Events loaded successfully"
          }));
        } else {
          toast.success(intl.formatMessage({
            id: "invite-no-events-data",
            description: "No events found",
            defaultMessage: "No upcoming events found"
          }));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error(intl.formatMessage({
          id: "invite-error-fetching-events",
          description: "Error fetching events",
          defaultMessage: "Error loading events: {error}"
        }, { error: error.message }));
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [dispatch, intl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500 flex items-center justify-center">
        <div className="animate-pulse text-blog-black dark:text-blog-white font-poppins">
          <FormattedMessage
            id="invite-loading"
            description="Loading events..."
            defaultMessage="Loading events..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500 font-poppins">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-fun-blue-500 to-fun-blue-700 dark:from-fun-blue-600 dark:to-fun-blue-800 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faHeart} className="text-hit-pink-500 text-3xl animate-pulse" />
            <h1 className="text-4xl lg:text-5xl font-bold text-blog-white">
              <FormattedMessage
                id="invite-page-hero-title"
                description="You're Invited!"
                defaultMessage="You're Invited!"
              />
            </h1>
            <FontAwesomeIcon icon={faHeart} className="text-hit-pink-500 text-3xl animate-pulse" />
          </div>
          <p className="text-xl text-blog-white/90 max-w-2xl mx-auto">
            <FormattedMessage
              id="invite-page-hero-subtitle"
              description="Join us for special celebrations and memorable moments"
              defaultMessage="Join us for special celebrations and memorable moments"
            />
          </p>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {inviteEvents && inviteEvents.length > 0 ? (
          <div className="space-y-8">
            {inviteEvents.map((inviteEvent) => (
              <div 
                key={inviteEvent.id} 
                className="bg-white dark:bg-fun-blue-600 rounded-2xl drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Event Header */}
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-6 lg:aspect-h-4">
                    <Image 
                      src={inviteEvent.image_url ?? `/mountains.jpg`} 
                      alt={inviteEvent.title}
                      width={1200}
                      height={400}
                      className="w-full h-64 lg:h-80 object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      {inviteEvent.title}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-white/90">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} className="text-hit-pink-400" />
                        <span className="font-medium">{inviteEvent.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-hit-pink-400" />
                        <span className="font-medium">{inviteEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-hit-pink-400" />
                        <span className="font-medium">{inviteEvent.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6 lg:p-8">
                  {/* Event Details */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-blog-black dark:text-blog-white mb-4">
                      <FormattedMessage
                        id="invite-event-details-title"
                        description="Event Details"
                        defaultMessage="Event Details"
                      />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-4 text-center">
                        <FontAwesomeIcon icon={faCalendar} className="text-fun-blue-500 text-2xl mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                          <FormattedMessage
                            id="invite-date-label"
                            description="Date"
                            defaultMessage="Date"
                          />
                        </div>
                        <div className="font-semibold text-blog-black dark:text-blog-white">
                          {inviteEvent.date}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-4 text-center">
                        <FontAwesomeIcon icon={faClock} className="text-fun-blue-500 text-2xl mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                          <FormattedMessage
                            id="invite-time-label"
                            description="Time"
                            defaultMessage="Time"
                          />
                        </div>
                        <div className="font-semibold text-blog-black dark:text-blog-white">
                          {inviteEvent.time}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-4 text-center">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-fun-blue-500 text-2xl mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                          <FormattedMessage
                            id="invite-location-label"
                            description="Location"
                            defaultMessage="Location"
                          />
                        </div>
                        <div className="font-semibold text-blog-black dark:text-blog-white">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inviteEvent.location)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-fun-blue-500 transition-colors duration-200"
                          >
                            {inviteEvent.location}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    {inviteEvent.description && (
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-fun-blue-700 rounded-lg">
                        <p className="text-blog-black dark:text-blog-white leading-relaxed">
                          {inviteEvent.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RSVP Section Toggle */}
                  <div className="border-t border-gray-200 dark:border-fun-blue-500 pt-6">
                    <button
                      onClick={() => toggleEventExpansion(inviteEvent.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-fun-blue-700 rounded-lg hover:bg-gray-100 dark:hover:bg-fun-blue-600 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faUsers} className="text-fun-blue-500" />
                        <span className="font-semibold text-blog-black dark:text-blog-white">
                          <FormattedMessage
                            id="invite-rsvp-toggle-title"
                            description="RSVP for this Event"
                            defaultMessage="RSVP for this Event"
                          />
                        </span>
                      </div>
                      <FontAwesomeIcon 
                        icon={expandedEvent === inviteEvent.id ? faChevronUp : faChevronDown} 
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </button>
                    
                    {expandedEvent === inviteEvent.id && (
                      <div className="mt-6 animate-fadeIn">
                        <RSVPForm eventId={inviteEvent.id} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-fun-blue-600 rounded-2xl p-12 drop-shadow-lg">
              <FontAwesomeIcon icon={faCalendar} className="text-gray-400 text-6xl mb-6" />
              <h3 className="text-2xl font-semibold text-blog-black dark:text-blog-white mb-4">
                <FormattedMessage
                  id="invite-no-events-title"
                  description="No Events Available"
                  defaultMessage="No Events Available"
                />
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <FormattedMessage
                  id="invite-no-events-description"
                  description="There are no upcoming events at the moment. Check back soon!"
                  defaultMessage="There are no upcoming events at the moment. Check back soon!"
                />
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gray-50 dark:bg-fun-blue-700 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blog-black dark:text-blog-white mb-4">
            <FormattedMessage
              id="invite-coming-soon-title"
              description="More Features Coming Soon"
              defaultMessage="More Features Coming Soon"
            />
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
            <FormattedMessage
              id="invite-coming-soon-description"
              description="We're working on exciting new features for event management"
              defaultMessage="We're working on exciting new features for event management and guest interaction. Stay tuned!"
            />
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-fun-blue-500 text-white rounded-lg">
            <FontAwesomeIcon icon={faHeart} className="text-hit-pink-400" />
            <span className="font-medium">
              <FormattedMessage
                id="invite-stay-tuned"
                description="Stay Tuned"
                defaultMessage="Stay Tuned"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Invite;
