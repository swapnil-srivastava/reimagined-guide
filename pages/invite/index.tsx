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
      <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-fun-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blog-black dark:text-blog-white font-poppins text-sm">
            <FormattedMessage
              id="invite-loading"
              description="Loading events..."
              defaultMessage="Loading events..."
            />
          </p>
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
        {/* Mobile-First Hero Section */}
        <div className="relative bg-gradient-to-br from-fun-blue-500 to-fun-blue-700 dark:from-fun-blue-600 dark:to-fun-blue-800 p-4 sm:p-6 lg:py-16 lg:px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Mobile Hero - Compact */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <FontAwesomeIcon icon={faHeart} className="text-hit-pink-500 text-xl sm:text-2xl lg:text-3xl animate-pulse" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-blog-white">
                  <FormattedMessage
                    id="invite-page-hero-title"
                    description="You're Invited!"
                    defaultMessage="You're Invited!"
                  />
                </h1>
                <FontAwesomeIcon icon={faHeart} className="text-hit-pink-500 text-xl sm:text-2xl lg:text-3xl animate-pulse" />
              </div>
              <p className="text-sm sm:text-base lg:text-xl text-blog-white/90 max-w-2xl mx-auto px-2">
                <FormattedMessage
                  id="invite-page-hero-subtitle"
                  description="Join us for special celebrations and memorable moments"
                  defaultMessage="Join us for special celebrations and memorable moments"
                />
              </p>
            </div>
            
            {/* Mobile Quick Stats */}
            {seoData.upcomingEventsCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-hit-pink-400 text-sm" />
                <span className="text-blog-white text-xs sm:text-sm font-medium">
                  <FormattedMessage
                    id="invite-hero-upcoming-count"
                    description="Upcoming events count"
                    defaultMessage="{count} Special {count, plural, one {Event} other {Events}} Awaiting"
                    values={{ count: seoData.upcomingEventsCount }}
                  />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-First Events Section */}
        <div className="p-4 sm:p-6 lg:px-6 lg:py-12">
          <div className="max-w-6xl mx-auto">
            {inviteEvents && inviteEvents.length > 0 ? (
              (() => {
                const organizedEvents = organizeEventsByTimeAndYear(inviteEvents);
                const hasUpcomingEvents = Object.keys(organizedEvents.upcoming).length > 0;
                const hasPastEvents = Object.keys(organizedEvents.past).length > 0;

                return (
                  <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                    {/* Upcoming Events Section */}
                    {hasUpcomingEvents && (
                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
                          <FontAwesomeIcon icon={faCalendarCheck} className="text-green-500 text-lg sm:text-xl lg:text-2xl" />
                          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blog-black dark:text-blog-white">
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
                            <div key={`upcoming-${year}`} className="mb-6 sm:mb-8 lg:mb-10">
                              {/* Year Header */}
                              <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                                <button
                                  onClick={() => toggleYearCollapse(parseInt(year))}
                                  className="flex items-center gap-2 sm:gap-3 hover:text-fun-blue-500 transition-colors duration-200 active:scale-95"
                                >
                                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-blog-black dark:text-blog-white">
                                    {year}
                                  </h3>
                                  <span className="text-xs sm:text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                                    {yearEvents.length} {yearEvents.length === 1 ? 'event' : 'events'}
                                  </span>
                                  <FontAwesomeIcon 
                                    icon={collapsedYears.has(parseInt(year)) ? faChevronDown : faChevronUp} 
                                    className="text-gray-500 dark:text-gray-400 text-sm"
                                  />
                                </button>
                              </div>

                              {/* Year Events */}
                              {!collapsedYears.has(parseInt(year)) && (
                                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                  {yearEvents.map((inviteEvent) => (
                                    <div 
                                      key={inviteEvent.id} 
                                      className="bg-white dark:bg-fun-blue-600 rounded-lg sm:rounded-xl drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 border-l-4 border-green-500 group relative"
                                      style={{ isolation: 'isolate' }}
                                    >
                                      {/* Mobile-First Event Layout */}
                                      <div className="relative">
                                        {/* Event Image Header */}
                                        <div className="h-32 sm:h-40 lg:h-64 xl:h-80 relative overflow-hidden">
                                          <Image 
                                            src={inviteEvent.image_url ?? `/mountains.jpg`} 
                                            alt={inviteEvent.title}
                                            width={800}
                                            height={400}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                          
                                          {/* Status Badge - Mobile Positioned */}
                                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4">
                                            {getEventStatusBadge(getEventStatus(inviteEvent.date))}
                                          </div>
                                          
                                          {/* Event Title Overlay */}
                                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
                                            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-1 sm:mb-2">
                                              {inviteEvent.title}
                                            </h2>
                                            {/* Quick Info Row - Mobile Optimized */}
                                            <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 text-white/90">
                                              <div className="flex items-center gap-1 sm:gap-2">
                                                <FontAwesomeIcon icon={faCalendar} className="text-hit-pink-400 text-xs sm:text-sm" />
                                                <span className="text-xs sm:text-sm lg:text-base font-medium">{moment(inviteEvent.date).format('MMM DD')}</span>
                                              </div>
                                              <div className="flex items-center gap-1 sm:gap-2">
                                                <FontAwesomeIcon icon={faClock} className="text-hit-pink-400 text-xs sm:text-sm" />
                                                <span className="text-xs sm:text-sm lg:text-base font-medium">{formatTime(inviteEvent.time)}</span>
                                              </div>
                                              <div className="flex items-center gap-1 sm:gap-2 max-w-[140px] sm:max-w-none">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-hit-pink-400 text-xs sm:text-sm flex-shrink-0" />
                                                <span className="text-xs sm:text-sm lg:text-base font-medium truncate">{inviteEvent.location}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Event Content */}
                                        <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
                                          {/* Mobile-First Quick Actions Grid */}
                                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                                            {/* Date Card */}
                                            <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
                                              <FontAwesomeIcon icon={faCalendar} className="text-fun-blue-500 text-sm sm:text-base lg:text-xl mb-1 sm:mb-2" />
                                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                                                <FormattedMessage
                                                  id="invite-date-label"
                                                  description="Date"
                                                  defaultMessage="Date"
                                                />
                                              </div>
                                              <div className="text-xs sm:text-sm lg:text-base font-semibold text-blog-black dark:text-blog-white">
                                                {moment(inviteEvent.date).format('MMM DD, YYYY')}
                                              </div>
                                            </div>
                                            
                                            {/* Time Card */}
                                            <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
                                              <FontAwesomeIcon icon={faClock} className="text-fun-blue-500 text-sm sm:text-base lg:text-xl mb-1 sm:mb-2" />
                                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                                                <FormattedMessage
                                                  id="invite-time-label"
                                                  description="Time"
                                                  defaultMessage="Time"
                                                />
                                              </div>
                                              <div className="text-xs sm:text-sm lg:text-base font-semibold text-blog-black dark:text-blog-white">
                                                {formatTime(inviteEvent.time)}
                                              </div>
                                            </div>
                                            
                                            {/* Location Card - Interactive */}
                                            <a 
                                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inviteEvent.location)}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-2 sm:p-3 lg:p-4 text-center hover:bg-gray-100 dark:hover:bg-fun-blue-800 transition-colors duration-200 active:scale-95 block group/location"
                                            >
                                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-fun-blue-500 text-sm sm:text-base lg:text-xl mb-1 sm:mb-2 group-hover/location:text-fun-blue-600" />
                                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                                                <FormattedMessage
                                                  id="invite-location-label"
                                                  description="Location"
                                                  defaultMessage="Location"
                                                />
                                              </div>
                                              <div className="text-xs sm:text-sm lg:text-base font-semibold text-blog-black dark:text-blog-white group-hover/location:text-fun-blue-500">
                                                {inviteEvent.location}
                                              </div>
                                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:hidden">
                                                <FormattedMessage
                                                  id="invite-tap-for-directions"
                                                  description="Tap for directions"
                                                  defaultMessage="Tap for directions"
                                                />
                                              </div>
                                            </a>
                                          </div>

                                          {/* Calendar Button - Full Width Mobile */}
                                          <div className="mb-4 sm:mb-6">
                                            <CalendarButton
                                              title={`Ria's Birthday Celebration - ${inviteEvent.title}`}
                                              description={inviteEvent.description}
                                              location={inviteEvent.location}
                                              date={inviteEvent.date}
                                              time={inviteEvent.time}
                                              className="w-full"
                                            />
                                          </div>

                                          {/* Event Description - Collapsible on Mobile */}
                                          {inviteEvent.description && (
                                            <div className="mb-4 sm:mb-6">
                                              <details className="group/details sm:open">
                                                <summary className="cursor-pointer text-sm sm:text-base font-medium text-blog-black dark:text-blog-white flex items-center gap-2 sm:hidden">
                                                  <FormattedMessage
                                                    id="invite-event-details-mobile"
                                                    description="Event Details"
                                                    defaultMessage="Event Details"
                                                  />
                                                  <FontAwesomeIcon 
                                                    icon={faChevronDown} 
                                                    className="text-xs group-open/details:rotate-180 transition-transform"
                                                  />
                                                </summary>
                                                <div className="mt-2 sm:mt-0 p-3 sm:p-4 bg-gray-50 dark:bg-fun-blue-700 rounded-lg">
                                                  <h3 className="hidden sm:block text-base lg:text-lg font-semibold text-blog-black dark:text-blog-white mb-2 lg:mb-3">
                                                    <FormattedMessage
                                                      id="invite-event-details-title"
                                                      description="Event Details"
                                                      defaultMessage="Event Details"
                                                    />
                                                  </h3>
                                                  <p className="text-xs sm:text-sm lg:text-base text-blog-black dark:text-blog-white leading-relaxed">
                                                    {inviteEvent.description}
                                                  </p>
                                                </div>
                                              </details>
                                            </div>
                                          )}

                                          {/* RSVP Section */}
                                          <div className="border-t border-gray-200 dark:border-fun-blue-500 pt-3 sm:pt-4 lg:pt-6">
                                            {/* RSVP Summary - Always Visible */}
                                            <div className="mb-3 sm:mb-4">
                                              <RSVPList 
                                                eventId={inviteEvent.id} 
                                                eventTitle={inviteEvent.title}
                                                showSummaryOnly={true}
                                              />
                                            </div>
                                            
                                            {/* RSVP Toggle Button */}
                                            <button
                                              onClick={() => toggleEventExpansion(inviteEvent.id)}
                                              className="w-full flex items-center justify-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-fun-blue-700 rounded-lg hover:bg-gray-100 dark:hover:bg-fun-blue-800 transition-colors duration-200 active:scale-[0.98]"
                                            >
                                              <div className="flex items-center gap-2 sm:gap-3">
                                                <FontAwesomeIcon icon={faUsers} className="text-fun-blue-500 text-sm sm:text-base" />
                                                <span className="text-sm sm:text-base font-semibold text-blog-black dark:text-blog-white">
                                                  <FormattedMessage
                                                    id="invite-rsvp-toggle-mobile"
                                                    description="RSVP for this Event"
                                                    defaultMessage="RSVP for this Event"
                                                  />
                                                </span>
                                              </div>
                                              <FontAwesomeIcon 
                                                icon={expandedEvent === inviteEvent.id ? faChevronUp : faChevronDown} 
                                                className="text-gray-500 dark:text-gray-400 text-sm"
                                              />
                                            </button>
                                            
                                            {/* RSVP Form and List - Expandable */}
                                            {expandedEvent === inviteEvent.id && (
                                              <div className="mt-3 sm:mt-4 lg:mt-6 animate-fadeIn">
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
                        {/* Mobile-First Past Events Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 lg:mb-8">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <FontAwesomeIcon icon={faHistory} className="text-gray-500 text-lg sm:text-xl lg:text-2xl" />
                            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blog-black dark:text-blog-white">
                              <FormattedMessage
                                id="invite-past-events-title"
                                description="Past Events"
                                defaultMessage="Past Events"
                              />
                            </h2>
                          </div>
                          <button
                            onClick={() => setShowPastEvents(!showPastEvents)}
                            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-fun-blue-700 text-blog-black dark:text-blog-white rounded-lg hover:bg-gray-200 dark:hover:bg-fun-blue-800 transition-colors duration-200 active:scale-95"
                          >
                            <FontAwesomeIcon icon={showPastEvents ? faEyeSlash : faEye} className="text-sm" />
                            <span className="font-medium text-sm sm:text-base">
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
                          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                            {Object.entries(organizedEvents.past)
                              .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Past events: newest years first
                              .map(([year, yearEvents]: [string, any[]]) => (
                                <div key={`past-${year}`} className="mb-6 sm:mb-8 lg:mb-10">
                                  {/* Year Header for Past Events */}
                                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                                    <button
                                      onClick={() => toggleYearCollapse(parseInt(year))}
                                      className="flex items-center gap-2 sm:gap-3 hover:text-fun-blue-500 transition-colors duration-200 active:scale-95"
                                    >
                                      <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-600 dark:text-gray-300">
                                        {year}
                                      </h3>
                                      <span className="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                        {yearEvents.length} {yearEvents.length === 1 ? 'event' : 'events'}
                                      </span>
                                      <FontAwesomeIcon 
                                        icon={collapsedYears.has(parseInt(year)) ? faChevronDown : faChevronUp} 
                                        className="text-gray-500 dark:text-gray-400 text-sm"
                                      />
                                    </button>
                                  </div>

                                  {/* Year Events */}
                                  {!collapsedYears.has(parseInt(year)) && (
                                    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                      {yearEvents.map((inviteEvent) => (
                                        <div 
                                          key={inviteEvent.id} 
                                          className="bg-white dark:bg-fun-blue-600 rounded-lg sm:rounded-xl drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-gray-400 opacity-80 group"
                                        >
                                          {/* Mobile-First Past Event Layout */}
                                          <div className="relative">
                                            {/* Past Event Image Header - Smaller for Mobile */}
                                            <div className="h-24 sm:h-32 lg:h-48 relative overflow-hidden">
                                              <Image 
                                                src={inviteEvent.image_url ?? `/mountains.jpg`} 
                                                alt={inviteEvent.title}
                                                width={800}
                                                height={300}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                              />
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                              
                                              {/* Status Badge */}
                                              <div className="absolute top-1 right-2 sm:top-2 sm:right-3">
                                                {getEventStatusBadge(getEventStatus(inviteEvent.date))}
                                              </div>
                                              
                                              {/* Past Event Title Overlay - Compact */}
                                              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                                                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white/90 mb-1 line-clamp-1">
                                                  {inviteEvent.title}
                                                </h2>
                                                <div className="flex items-center gap-2 text-white/75 text-xs">
                                                  <FontAwesomeIcon icon={faHistory} className="text-gray-300" />
                                                  <span>
                                                    <FormattedMessage
                                                      id="invite-past-event-label"
                                                      description="Past event"
                                                      defaultMessage="Past event"
                                                    />
                                                  </span>
                                                  <span>•</span>
                                                  <span>{moment(inviteEvent.date).format('MMM DD, YYYY')}</span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Past Event Content - Simplified */}
                                            <div className="p-3 sm:p-4 lg:p-6">
                                              {/* Past Event Quick Info */}
                                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                <div className="flex-1">
                                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1">
                                                      <FontAwesomeIcon icon={faClock} className="text-xs" />
                                                      <span>{formatTime(inviteEvent.time)}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                                                      <span className="truncate max-w-[120px] sm:max-w-none">{inviteEvent.location}</span>
                                                    </div>
                                                  </div>
                                                  {inviteEvent.description && (
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 sm:mt-2">
                                                      {inviteEvent.description}
                                                    </p>
                                                  )}
                                                </div>
                                                
                                                {/* Expand Button for Past Events */}
                                                <button
                                                  onClick={() => toggleEventExpansion(inviteEvent.id)}
                                                  className="ml-2 sm:ml-3 p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-fun-blue-700 rounded transition-colors duration-200 active:scale-95 flex-shrink-0"
                                                >
                                                  <FontAwesomeIcon 
                                                    icon={expandedEvent === inviteEvent.id ? faChevronUp : faChevronDown} 
                                                    className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm"
                                                  />
                                                </button>
                                              </div>
                                              
                                              {/* RSVP Summary for Past Events - Always Visible */}
                                              <div className="mb-3 sm:mb-4">
                                                <RSVPList 
                                                  eventId={inviteEvent.id} 
                                                  eventTitle={inviteEvent.title}
                                                  showSummaryOnly={true}
                                                />
                                              </div>
                                              
                                              {/* Past Event Action Buttons - Compact */}
                                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                                <CalendarButton
                                                  title={`Ria's Birthday Celebration - ${inviteEvent.title} (Past Event)`}
                                                  description={inviteEvent.description}
                                                  location={inviteEvent.location}
                                                  date={inviteEvent.date}
                                                  time={inviteEvent.time}
                                                  className="flex-1 opacity-75 text-xs sm:text-sm"
                                                />
                                                <a 
                                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inviteEvent.location)}`} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 active:scale-95 text-xs sm:text-sm"
                                                >
                                                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                                                  <span className="font-medium">
                                                    <FormattedMessage
                                                      id="invite-location-button"
                                                      description="Location"
                                                      defaultMessage="Location"
                                                    />
                                                  </span>
                                                </a>
                                              </div>

                                              {/* Expanded Past Event Details */}
                                              {expandedEvent === inviteEvent.id && (
                                                <div className="mt-3 sm:mt-4 animate-fadeIn border-t border-gray-200 dark:border-fun-blue-500 pt-3 sm:pt-4">
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
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8 sm:py-12 lg:py-16">
                <div className="bg-white dark:bg-fun-blue-600 rounded-lg sm:rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 drop-shadow-lg max-w-md mx-auto">
                  <FontAwesomeIcon icon={faCalendar} className="text-gray-400 text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-blog-black dark:text-blog-white mb-3 sm:mb-4">
                    <FormattedMessage
                      id="invite-no-events-title"
                      description="No Events Available"
                      defaultMessage="No Events Available"
                    />
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
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
        </div>

        {/* Mobile-First Coming Soon Section */}
        <div className="bg-gray-50 dark:bg-fun-blue-700 p-4 sm:p-6 lg:py-16 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-blog-white mb-3 sm:mb-4">
              <FormattedMessage
                id="invite-coming-soon-title"
                description="More Features Coming Soon"
                defaultMessage="More Features Coming Soon"
              />
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 lg:mb-8 px-2">
              <FormattedMessage
                id="invite-coming-soon-description"
                description="We're working on exciting new features for event management"
                defaultMessage="We're working on exciting new features for event management and guest interaction. Stay tuned!"
              />
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-fun-blue-500 text-white rounded-lg hover:bg-fun-blue-600 transition-colors duration-200 active:scale-95">
              <FontAwesomeIcon icon={faHeart} className="text-hit-pink-400 text-sm sm:text-base" />
              <span className="text-blog-white font-medium text-sm sm:text-base">
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
