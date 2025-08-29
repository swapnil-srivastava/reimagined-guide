import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendar, 
  faClock, 
  faMapMarkerAlt, 
  faUsers, 
  faHeart,
  faChevronDown,
  faChevronUp,
  faHistory,
  faCalendarCheck,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage, useIntl } from "react-intl";
import Image from "next/image";
import moment from "moment";

import { supaClient } from "../../supa-client";
import CalendarButton from "../../components/CalendarButton";

import { RootState } from "../../lib/interfaces/interface";
import { fetchInviteEvents } from "../../redux/actions/actions";

// CSS
import styles from "../../styles/Admin.module.css";
import RSVPForm from "../../components/RSVPForm";
import RSVPList from "../../components/RSVPList";

interface InvitePageProps {
  seoData: {
    title: string;
    description: string;
    imageUrl: string;
    url: string;
    upcomingEventsCount: number;
    nextEventDate?: string;
    nextEventTitle?: string;
  };
}

function Invite({ seoData }: InvitePageProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  
  const selectInviteEvents = (state: RootState) => state.inviteEventsReducer;
  const { inviteEvents } = useSelector(selectInviteEvents);
  
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Event organization helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  // Convert 24-hour time to 12-hour format for display
  const formatTime = (time: string) => {
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

  // Format date for display
  const formatDate = (date: string) => {
    if (!date) return '';
    return moment(date).format('MMMM Do, YYYY');
  };

  const organizeEventsByTimeAndYear = (events: any[]) => {
    const upcomingEvents: any[] = [];
    const pastEvents: any[] = [];
    
    events.forEach(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate >= today) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });

    // Group events by year
    const groupByYear = (eventList: any[]) => {
      return eventList.reduce((acc, event) => {
        const year = new Date(event.date).getFullYear();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(event);
        return acc;
      }, {});
    };

    return {
      upcoming: groupByYear(upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())),
      past: groupByYear(pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) // Past events in reverse chronological order
    };
  };

  const toggleYearCollapse = (year: number) => {
    const newCollapsedYears = new Set(collapsedYears);
    if (newCollapsedYears.has(year)) {
      newCollapsedYears.delete(year);
    } else {
      newCollapsedYears.add(year);
    }
    setCollapsedYears(newCollapsedYears);
  };

  const getEventStatus = (eventDate: string) => {
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);
    const todayDay = new Date();
    todayDay.setHours(0, 0, 0, 0);

    if (eventDay > todayDay) {
      return 'upcoming';
    } else if (eventDay.getTime() === todayDay.getTime()) {
      return 'today';
    } else {
      return 'past';
    }
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
            <FontAwesomeIcon icon={faCalendarCheck} className="w-3 h-3" />
            <FormattedMessage id="event-status-upcoming" defaultMessage="Upcoming" />
          </span>
        );
      case 'today':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full animate-pulse">
            <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
            <FormattedMessage id="event-status-today" defaultMessage="Today" />
          </span>
        );
      case 'past':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            <FontAwesomeIcon icon={faHistory} className="w-3 h-3" />
            <FormattedMessage id="event-status-past" defaultMessage="Past Event" />
          </span>
        );
      default:
        return null;
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data: events, error } = await supaClient
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching events:', error);
          toast.error(intl.formatMessage({
            id: "invite-fetch-events-error",
            description: "Error message when events cannot be loaded",
            defaultMessage: "Failed to load events. Please try again."
          }));
        } else {
          dispatch(fetchInviteEvents(events || []));
          
          // Initially collapse past years (2024 and earlier)
          const pastYearsToCollapse = new Set<number>();
          const currentYear = new Date().getFullYear();
          
          events?.forEach(event => {
            const eventYear = new Date(event.date).getFullYear();
            if (eventYear < currentYear) {
              pastYearsToCollapse.add(eventYear);
            }
          });
          
          setCollapsedYears(pastYearsToCollapse);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(intl.formatMessage({
          id: "invite-unexpected-error",
          description: "Unexpected error message",
          defaultMessage: "An unexpected error occurred. Please refresh the page."
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [dispatch, intl]);  if (loading) {
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
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content="Ria birthday, birthday party, birthday celebration, events, invitations, RSVP, celebrations, parties, gatherings, social events" />
        <meta name="author" content="Swapnil Srivastava, Mudrika Mishra" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoData.url} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.imageUrl} />
        <meta property="og:image:secure_url" content={seoData.imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={seoData.title} />
        <meta property="og:site_name" content="Ria's Birthday Celebrations" />
        <meta property="og:locale" content="en_US" />
        <meta property="article:author" content="Swapnil Srivastava" />
        <meta property="article:author" content="Mudrika Mishra" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@swapnilsrivastava" />
        <meta name="twitter:creator" content="@swapnilsrivastava" />
        <meta name="twitter:url" content={seoData.url} />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.imageUrl} />
        <meta name="twitter:image:alt" content={seoData.title} />
        
        {/* LinkedIn */}
        <meta property="linkedin:owner" content="swapnil-srivastava" />
        
        {/* WhatsApp Specific */}
        <meta property="whatsapp:title" content={seoData.title} />
        <meta property="whatsapp:description" content={seoData.description} />
        <meta property="whatsapp:image" content={seoData.imageUrl} />
        
        {/* Additional Social Media Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="application-name" content="Ria's Birthday Invitations" />
        <meta name="msapplication-TileColor" content="#00539c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional Mobile Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#00539c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ria's Birthday Invitations" />
        
        {/* Structured Data for Events */}
        {seoData.nextEventDate && seoData.nextEventTitle && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                "name": seoData.nextEventTitle,
                "startDate": seoData.nextEventDate,
                "eventStatus": "https://schema.org/EventScheduled",
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "organizer": [
                  {
                    "@type": "Person",
                    "name": "Swapnil Srivastava",
                    "url": "https://swapnilsrivastava.eu"
                  },
                  {
                    "@type": "Person",
                    "name": "Mudrika Mishra"
                  }
                ],
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                },
                "image": seoData.imageUrl,
                "description": seoData.description,
                "url": seoData.url
              })
            }}
          />
        )}
        
        {/* Canonical URL */}
        <link rel="canonical" href={seoData.url} />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      
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
          (() => {
            const organizedEvents = organizeEventsByTimeAndYear(inviteEvents);
            const hasUpcomingEvents = Object.keys(organizedEvents.upcoming).length > 0;
            const hasPastEvents = Object.keys(organizedEvents.past).length > 0;

            return (
              <div className="space-y-12">
                {/* Upcoming Events Section */}
                {hasUpcomingEvents && (
                  <div>
                    <div className="flex items-center gap-2 md:gap-3 mb-8">
                      <FontAwesomeIcon icon={faCalendarCheck} className="text-green-500 text-xl md:text-2xl" />
                      <h2 className="text-2xl md:text-3xl font-bold text-blog-black dark:text-blog-white">
                        <FormattedMessage
                          id="invite-upcoming-events-title"
                          description="Upcoming Events"
                          defaultMessage="Upcoming Events"
                        />
                      </h2>
                    </div>
                    
                    {Object.entries(organizedEvents.upcoming)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([year, yearEvents]: [string, any[]]) => (
                        <div key={`upcoming-${year}`} className="mb-8 md:mb-10">
                          {/* Year Header for Upcoming */}
                          <div className="flex items-center justify-between mb-4 md:mb-6">
                            <button
                              onClick={() => toggleYearCollapse(parseInt(year))}
                              className="flex items-center gap-2 md:gap-3 hover:text-fun-blue-500 transition-colors duration-200"
                            >
                              <h3 className="text-xl md:text-2xl font-semibold text-blog-black dark:text-blog-white">
                                {year}
                              </h3>
                              <span className="text-xs md:text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                                {yearEvents.length} {yearEvents.length === 1 ? 'event' : 'events'}
                              </span>
                              <FontAwesomeIcon 
                                icon={collapsedYears.has(parseInt(year)) ? faChevronDown : faChevronUp} 
                                className="text-gray-500 dark:text-gray-400 text-sm md:text-base"
                              />
                            </button>
                          </div>

                          {/* Year Events */}
                          {!collapsedYears.has(parseInt(year)) && (
                            <div className="space-y-6 md:space-y-8">
                              {yearEvents.map((inviteEvent) => (
                                <div 
                                  key={inviteEvent.id} 
                                  className="bg-white dark:bg-fun-blue-600 rounded-2xl drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-green-500 group"
                                >
                                  {/* Event Header */}
                                  <div className="relative group-hover:brightness-110 transition-all duration-300">
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
                                    <div className="absolute top-4 right-4">
                                      {getEventStatusBadge(getEventStatus(inviteEvent.date))}
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                        {inviteEvent.title}
                                      </h2>
                                      <div className="flex flex-wrap gap-4 text-white/90">
                                        <div className="flex items-center gap-2">
                                          <FontAwesomeIcon icon={faCalendar} className="text-hit-pink-400" />
                                          <span className="font-medium">{formatDate(inviteEvent.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <FontAwesomeIcon icon={faClock} className="text-hit-pink-400" />
                                          <span className="font-medium">{formatTime(inviteEvent.time)}</span>
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
                                    <div className="mb-8 group-hover:brightness-105 transition-all duration-300">
                                      <h3 className="text-xl font-semibold text-blog-black dark:text-blog-white mb-4">
                                        <FormattedMessage
                                          id="invite-event-details-title"
                                          description="Event Details"
                                          defaultMessage="Event Details"
                                        />
                                      </h3>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
                                            {formatDate(inviteEvent.date)}
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
                                            {formatTime(inviteEvent.time)}
                                          </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-4 text-center col-span-2 md:col-span-1">
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
                                      
                                      {/* Add to Calendar Button */}
                                      <div className="mt-6">
                                        <CalendarButton
                                          title={inviteEvent.title}
                                          description={inviteEvent.description}
                                          location={inviteEvent.location}
                                          date={inviteEvent.date}
                                          time={inviteEvent.time}
                                          className="w-full"
                                        />
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
                                    <div className="border-t border-gray-200 dark:border-fun-blue-500 pt-6 brightness-100">
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
                                          <RSVPList 
                                            eventId={inviteEvent.id} 
                                            eventTitle={inviteEvent.title}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {/* Past Events Section */}
                {hasPastEvents && (
                  <div>
                    {/* Mobile Layout */}
                    <div className="block md:hidden mb-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faHistory} className="text-gray-500 text-xl" />
                        <h2 className="text-2xl font-bold text-blog-black dark:text-blog-white">
                          <FormattedMessage
                            id="invite-past-events-title"
                            description="Past Events"
                            defaultMessage="Past Events"
                          />
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowPastEvents(!showPastEvents)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-fun-blue-700 text-blog-black dark:text-blog-white rounded-lg hover:bg-gray-200 dark:hover:bg-fun-blue-600 transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={showPastEvents ? faEyeSlash : faEye} className="text-sm" />
                        <span className="font-medium text-sm">
                          {showPastEvents ? (
                            <FormattedMessage
                              id="invite-hide-past-events"
                              description="Hide Past Events"
                              defaultMessage="Hide Past Events"
                            />
                          ) : (
                            <FormattedMessage
                              id="invite-show-past-events"
                              description="Show Past Events"
                              defaultMessage="Show Past Events"
                            />
                          )}
                        </span>
                      </button>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faHistory} className="text-gray-500 text-2xl" />
                        <h2 className="text-3xl font-bold text-blog-black dark:text-blog-white">
                          <FormattedMessage
                            id="invite-past-events-title"
                            description="Past Events"
                            defaultMessage="Past Events"
                          />
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowPastEvents(!showPastEvents)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-fun-blue-700 text-blog-black dark:text-blog-white rounded-lg hover:bg-gray-200 dark:hover:bg-fun-blue-600 transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={showPastEvents ? faEyeSlash : faEye} />
                        <span className="font-medium">
                          {showPastEvents ? (
                            <FormattedMessage
                              id="invite-hide-past-events"
                              description="Hide Past Events"
                              defaultMessage="Hide Past Events"
                            />
                          ) : (
                            <FormattedMessage
                              id="invite-show-past-events"
                              description="Show Past Events"
                              defaultMessage="Show Past Events"
                            />
                          )}
                        </span>
                      </button>
                    </div>

                    {showPastEvents && (
                      <div className="space-y-6 md:space-y-8">
                        {Object.entries(organizedEvents.past)
                          .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Past events: newest years first
                          .map(([year, yearEvents]: [string, any[]]) => (
                            <div key={`past-${year}`} className="mb-8 md:mb-10">
                              {/* Year Header for Past Events */}
                              <div className="flex items-center justify-between mb-4 md:mb-6">
                                <button
                                  onClick={() => toggleYearCollapse(parseInt(year))}
                                  className="flex items-center gap-2 md:gap-3 hover:text-fun-blue-500 transition-colors duration-200"
                                >
                                  <h3 className="text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-300">
                                    {year}
                                  </h3>
                                  <span className="text-xs md:text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                    {yearEvents.length} {yearEvents.length === 1 ? 'event' : 'events'}
                                  </span>
                                  <FontAwesomeIcon 
                                    icon={collapsedYears.has(parseInt(year)) ? faChevronDown : faChevronUp} 
                                    className="text-gray-500 dark:text-gray-400 text-sm md:text-base"
                                  />
                                </button>
                              </div>

                              {/* Year Events */}
                              {!collapsedYears.has(parseInt(year)) && (
                                <div className="space-y-6 md:space-y-8">
                                  {yearEvents.map((inviteEvent) => (
                                    <div 
                                      key={inviteEvent.id} 
                                      className="bg-white dark:bg-fun-blue-600 rounded-2xl drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-gray-400 opacity-75 group"
                                    >
                                      {/* Event Header */}
                                      <div className="relative group-hover:brightness-110 transition-all duration-300">
                                        <div className="aspect-w-16 aspect-h-6 lg:aspect-h-4">
                                          <Image 
                                            src={inviteEvent.image_url ?? `/mountains.jpg`} 
                                            alt={inviteEvent.title}
                                            width={1200}
                                            height={400}
                                            className="w-full h-64 lg:h-80 object-cover grayscale-50"
                                          />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute top-4 right-4">
                                          {getEventStatusBadge(getEventStatus(inviteEvent.date))}
                                        </div>
                                        <div className="absolute bottom-6 left-6 right-6">
                                          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                            {inviteEvent.title}
                                          </h2>
                                          <div className="flex flex-wrap gap-4 text-white/90">
                                            <div className="flex items-center gap-2">
                                              <FontAwesomeIcon icon={faCalendar} className="text-hit-pink-400" />
                                              <span className="font-medium">{formatDate(inviteEvent.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <FontAwesomeIcon icon={faClock} className="text-hit-pink-400" />
                                              <span className="font-medium">{formatTime(inviteEvent.time)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-hit-pink-400" />
                                              <span className="font-medium">{inviteEvent.location}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Event Content - Limited for Past Events */}
                                      <div className="p-6 lg:p-8">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-blog-black dark:text-blog-white mb-2">
                                              <FormattedMessage
                                                id="invite-past-event-summary"
                                                description="Past Event"
                                                defaultMessage="Past Event"
                                              />
                                            </h3>
                                            {inviteEvent.description && (
                                              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                                                {inviteEvent.description}
                                              </p>
                                            )}
                                          </div>
                                          
                                          {/* Expand Button for Past Events */}
                                          <button
                                            onClick={() => toggleEventExpansion(inviteEvent.id)}
                                            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-fun-blue-500 rounded-lg transition-colors duration-200"
                                          >
                                            <FontAwesomeIcon 
                                              icon={expandedEvent === inviteEvent.id ? faChevronUp : faChevronDown} 
                                              className="text-gray-500 dark:text-gray-400"
                                            />
                                          </button>
                                        </div>
                                        
                                        {/* Add to Calendar Button for Past Events */}
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-fun-blue-500">
                                          <CalendarButton
                                            title={`${inviteEvent.title} (Past Event)`}
                                            description={inviteEvent.description}
                                            location={inviteEvent.location}
                                            date={inviteEvent.date}
                                            time={inviteEvent.time}
                                            className="w-full opacity-75"
                                          />
                                        </div>

                                        {/* Expanded Past Event Details */}
                                        {expandedEvent === inviteEvent.id && (
                                          <div className="mt-6 animate-fadeIn">
                                            <RSVPList 
                                              eventId={inviteEvent.id} 
                                              eventTitle={inviteEvent.title}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()
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
          <h2 className="text-3xl font-bold text-gray-800 dark:text-blog-white mb-4">
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
                                    <span className="text-blog-white font-medium">
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
    </>
  );

}

// Server-side rendering for SEO
export const getServerSideProps: GetServerSideProps<InvitePageProps> = async (context) => {
  try {
    // Import server client here to avoid client-side issues
    const { supaServerClient } = await import('../../supa-server-client');
    
    if (!supaServerClient) {
      // Fallback if server client is not available
      return {
        props: {
          seoData: {
            title: "You're Invited to Ria's Birthday! - Swapnil & Mudrika",
            description: "Join Swapnil Srivastava and Mudrika Mishra for Ria's special birthday celebration. RSVP to this exclusive birthday party.",
            imageUrl: "https://swapnilsrivastava.eu/mountains.jpg",
            url: "https://swapnilsrivastava.eu/invite",
            upcomingEventsCount: 0,
          }
        }
      };
    }

    // Fetch upcoming events from the database
    const { data: events, error } = await supaServerClient
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0]) // Only future events
      .order('date', { ascending: true })
      .limit(5); // Limit for performance

    if (error) {
      console.error('Error fetching events for SEO:', error);
      // Return default SEO data if database query fails
      return {
        props: {
          seoData: {
            title: "You're Invited to Ria's Birthday! - Swapnil & Mudrika",
            description: "Join Swapnil Srivastava and Mudrika Mishra for Ria's special birthday celebration. RSVP to this exclusive birthday party.",
            imageUrl: "https://swapnilsrivastava.eu/mountains.jpg",
            url: "https://swapnilsrivastava.eu/invite",
            upcomingEventsCount: 0,
          }
        }
      };
    }

    const upcomingEvents = events || [];
    const nextEvent = upcomingEvents[0];
    
    // Get full URL from request
    const protocol = context.req.headers['x-forwarded-proto'] || 'https';
    const host = context.req.headers.host || 'swapnilsrivastava.eu';
    const baseUrl = `${protocol}://${host}`;
    
    // Generate dynamic SEO data based on events
    const title = upcomingEvents.length > 0 
      ? `You're Invited to Ria's Birthday! ${upcomingEvents.length} Special Events - Swapnil & Mudrika`
      : "You're Invited to Ria's Birthday! - Swapnil & Mudrika";
      
    const description = nextEvent 
      ? `Join Swapnil Srivastava and Mudrika Mishra for Ria's birthday celebration "${nextEvent.title}" on ${new Date(nextEvent.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} at ${nextEvent.location}. ${upcomingEvents.length > 1 ? `Plus ${upcomingEvents.length - 1} more special birthday events!` : ''} RSVP now for Ria's special day!`
      : "Join Swapnil Srivastava and Mudrika Mishra for Ria's upcoming birthday celebrations. RSVP to exclusive birthday parties and special occasions. Let's make Ria's day unforgettable!";
    
    // Ensure image URL is absolute
    let imageUrl = `${baseUrl}/mountains.jpg`; // Default fallback
    if (nextEvent?.image_url) {
      // If it's already a full URL, use it; otherwise make it absolute
      imageUrl = nextEvent.image_url.startsWith('http') 
        ? nextEvent.image_url 
        : `${baseUrl}${nextEvent.image_url}`;
    }
    
    const url = `${baseUrl}/invite`;

    return {
      props: {
        seoData: {
          title,
          description,
          imageUrl,
          url,
          upcomingEventsCount: upcomingEvents.length,
          nextEventDate: nextEvent?.date,
          nextEventTitle: nextEvent?.title,
        }
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Fallback SEO data if anything goes wrong
    return {
      props: {
        seoData: {
          title: "You're Invited to Ria's Birthday! - Swapnil & Mudrika",
          description: "Join Swapnil Srivastava and Mudrika Mishra for Ria's special birthday celebration. RSVP to this exclusive birthday party.",
          imageUrl: "https://swapnilsrivastava.eu/mountains.jpg",
          url: "https://swapnilsrivastava.eu/invite",
          upcomingEventsCount: 0,
        }
      }
    };
  }
};

export default Invite;
