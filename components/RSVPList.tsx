'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faChevronDown, 
  faChevronUp, 
  faChild, 
  faEnvelope, 
  faPhone, 
  faCommentDots,
  faCheckCircle,
  faTimesCircle,
  faCalendarCheck,
  faUser,
  faCrown,
  faChartBar,
  faListUl,
  faEye,
  faEyeSlash,
  faUserCheck,
  faUserTimes,
  faClock,
  faMapMarkerAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

import { supaClient } from '../supa-client';
import { useSession } from '../lib/use-session';

interface Kid {
  name: string;
  age: string;
  allergies: string;
}

interface RSVP {
  id: string;
  event_id: string;
  family_name: string;
  kids: Kid[];
  is_attending: boolean;
  email?: string;
  phone?: string;
  message?: string;
  created_at: string;
}

interface RSVPListProps {
  eventId: string;
  eventTitle: string;
  showSummaryOnly?: boolean; // New prop to show only summary
}

const RSVPList: React.FC<RSVPListProps> = ({ eventId, eventTitle, showSummaryOnly = false }) => {
  const intl = useIntl();
  const userInfo = useSession();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authorized admin
  const isAuthorized = userInfo.session?.user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID;

  const fetchRSVPs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supaClient
        .from('rsvps')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching RSVPs:', error);
        setError('Failed to load RSVP responses');
        toast.error(intl.formatMessage({
          id: "rsvp-list-fetch-error",
          description: "Error fetching RSVP responses",
          defaultMessage: "Failed to load RSVP responses"
        }));
      } else {
        setRsvps(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
      toast.error(intl.formatMessage({
        id: "rsvp-list-unexpected-error",
        description: "Unexpected error",
        defaultMessage: "An unexpected error occurred"
      }));
    } finally {
      setLoading(false);
    }
  }, [eventId, intl]);

  useEffect(() => {
    if (isAuthorized) {
      fetchRSVPs();
    } else {
      setLoading(false);
    }
  }, [eventId, isAuthorized, fetchRSVPs]);

  // Don't render anything if user is not authorized
  if (!isAuthorized) {
    return null;
  }

  const attendingRsvps = rsvps.filter(rsvp => rsvp.is_attending);
  const notAttendingRsvps = rsvps.filter(rsvp => !rsvp.is_attending);
  const totalGuests = attendingRsvps.reduce((total, rsvp) => total + 1 + (rsvp.kids?.length || 0), 0);
  const totalKids = attendingRsvps.reduce((total, rsvp) => total + (rsvp.kids?.length || 0), 0);
  const totalFamilies = attendingRsvps.length;
  const totalAdults = totalFamilies * 2; // Assuming 2 parents per family

  // Calculate kids age breakdown
  const kidsAgeBreakdown = attendingRsvps.reduce((breakdown, rsvp) => {
    if (rsvp.kids) {
      rsvp.kids.forEach(kid => {
        const age = parseInt(kid.age);
        if (age <= 5) {
          breakdown.toddlers++;
        } else if (age <= 12) {
          breakdown.children++;
        } else {
          breakdown.teens++;
        }
      });
    }
    return breakdown;
  }, { toddlers: 0, children: 0, teens: 0 });

  if (loading) {
    if (showSummaryOnly) {
      return (
        <div className="mt-3 p-2 bg-gray-50 dark:bg-fun-blue-700 rounded-lg">
          <div className="animate-pulse text-xs text-gray-500 dark:text-gray-400">
            <FormattedMessage
              id="rsvp-summary-loading"
              description="Loading RSVP summary"
              defaultMessage="Loading RSVPs..."
            />
          </div>
        </div>
      );
    }
    return (
      <div className="mt-6 p-4 bg-gray-50 dark:bg-fun-blue-700 rounded-lg">
        <div className="animate-pulse text-blog-black dark:text-blog-white">
          <FormattedMessage
            id="rsvp-list-loading"
            description="Loading RSVP responses"
            defaultMessage="Loading RSVP responses..."
          />
        </div>
      </div>
    );
  }

  if (error) {
    if (showSummaryOnly) {
      return null; // Don't show errors in summary mode
    }
    return (
      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // Summary-only mode for main event card
  if (showSummaryOnly) {
    if (totalFamilies === 0) {
      return null; // Don't show anything if no RSVPs
    }

    return (
      <div className="mt-3 group">
        {/* Admin Badge */}
        <div className="flex items-center justify-center mb-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-medium shadow-lg">
            <FontAwesomeIcon icon={faUsers} className="text-xs" />
            <FormattedMessage
              id="rsvp-admin-badge"
              description="Admin Only"
              defaultMessage="Admin Only"
            />
          </div>
        </div>

        {/* Enhanced Counters with Gradients and Animations */}
        <div className="flex gap-1.5 sm:grid sm:grid-cols-3 sm:gap-3">
          {/* Adults Counter - Enhanced Design */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-emerald-800/30 rounded-xl p-2 sm:p-3 text-center border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group-hover:brightness-105">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-100/30 to-emerald-200/20 dark:from-transparent dark:via-emerald-800/20 dark:to-emerald-700/10"></div>
            
            {/* Icon */}
            <div className="relative flex items-center justify-center mb-1">
              <div className="p-1 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full">
                <FontAwesomeIcon icon={faUsers} className="text-xs text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            
            {/* Count */}
            <div className="relative text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 tracking-tight">
              {totalAdults}
            </div>
            
            {/* Label */}
            <div className="relative text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold leading-tight uppercase tracking-wide">
              <FormattedMessage
                id="rsvp-summary-adults"
                description="Adults"
                defaultMessage="Adults"
              />
            </div>
            
            {/* Subtle Indicator */}
            <div className="relative text-[8px] sm:text-[10px] text-emerald-500 dark:text-emerald-500 opacity-75 mt-0.5">
              2 per family
            </div>
          </div>

          {/* Kids Counter - Enhanced Design */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-sky-900/30 dark:via-blue-900/20 dark:to-indigo-800/30 rounded-xl p-2 sm:p-3 text-center border border-sky-200/50 dark:border-sky-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group-hover:brightness-105">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-sky-100/30 to-blue-200/20 dark:from-transparent dark:via-sky-800/20 dark:to-blue-700/10"></div>
            
            {/* Icon */}
            <div className="relative flex items-center justify-center mb-1">
              <div className="p-1 bg-sky-500/20 dark:bg-sky-400/20 rounded-full">
                <FontAwesomeIcon icon={faChild} className="text-xs text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            
            {/* Count */}
            <div className="relative text-lg sm:text-2xl font-bold text-sky-700 dark:text-sky-300 tracking-tight">
              {totalKids}
            </div>
            
            {/* Label */}
            <div className="relative text-[10px] sm:text-xs text-sky-600 dark:text-sky-400 font-semibold leading-tight uppercase tracking-wide">
              <FormattedMessage
                id="rsvp-summary-kids"
                description="Kids"
                defaultMessage="Kids"
              />
            </div>
            
            {/* Age Range Indicator */}
            <div className="relative text-[8px] sm:text-[10px] text-sky-500 dark:text-sky-500 opacity-75 mt-0.5">
              All ages
            </div>
          </div>

          {/* Total Counter - Enhanced Design */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100 dark:from-violet-900/30 dark:via-purple-900/20 dark:to-fuchsia-800/30 rounded-xl p-2 sm:p-3 text-center border border-violet-200/50 dark:border-violet-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group-hover:brightness-105">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-violet-100/30 to-purple-200/20 dark:from-transparent dark:via-violet-800/20 dark:to-purple-700/10"></div>
            
            {/* Icon */}
            <div className="relative flex items-center justify-center mb-1">
              <div className="p-1 bg-violet-500/20 dark:bg-violet-400/20 rounded-full">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-xs text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            
            {/* Count */}
            <div className="relative text-lg sm:text-2xl font-bold text-violet-700 dark:text-violet-300 tracking-tight">
              {totalAdults + totalKids}
            </div>
            
            {/* Label */}
            <div className="relative text-[10px] sm:text-xs text-violet-600 dark:text-violet-400 font-semibold leading-tight uppercase tracking-wide">
              <FormattedMessage
                id="rsvp-summary-total"
                description="Total"
                defaultMessage="Total"
              />
            </div>
            
            {/* Guests Indicator */}
            <div className="relative text-[8px] sm:text-[10px] text-violet-500 dark:text-violet-500 opacity-75 mt-0.5">
              All guests
            </div>
          </div>
        </div>
        
        {/* Enhanced Summary Info */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
            <FontAwesomeIcon icon={faUsers} className="text-xs text-gray-500 dark:text-gray-400" />
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              <FormattedMessage
                id="rsvp-summary-families-enhanced"
                description="{count} families attending"
                defaultMessage="{count, plural, one {# family} other {# families}} confirmed"
                values={{ count: totalFamilies }}
              />
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-fun-blue-500 pt-6">
      {/* Modern Guest Count Summary Cards */}
      {totalFamilies > 0 && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Adults Counter - Modern Design */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-emerald-800/30 rounded-2xl p-6 border border-emerald-200/60 dark:border-emerald-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-100/40 to-green-200/30 dark:from-transparent dark:via-emerald-800/30 dark:to-green-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Floating Icon */}
            <div className="relative flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mb-1 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors duration-300">
                  {totalAdults}
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <FormattedMessage
                    id="rsvp-adults-counter-title"
                    description="Adults attending"
                    defaultMessage="Adults"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Subtitle */}
            <div className="relative">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors duration-300">
                <FormattedMessage
                  id="rsvp-adults-counter-subtitle"
                  description="2 per family"
                  defaultMessage="2 per family"
                />
              </p>
            </div>
          </div>

          {/* Kids Counter - Modern Design */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-sky-900/30 dark:via-blue-900/20 dark:to-indigo-800/30 rounded-2xl p-6 border border-sky-200/60 dark:border-sky-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-sky-100/40 to-blue-200/30 dark:from-transparent dark:via-sky-800/30 dark:to-blue-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Floating Icon */}
            <div className="relative flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <FontAwesomeIcon icon={faChild} className="text-white text-lg" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-sky-700 dark:text-sky-300 mb-1 group-hover:text-sky-800 dark:group-hover:text-sky-200 transition-colors duration-300">
                  {totalKids}
                </div>
                <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  <FormattedMessage
                    id="rsvp-kids-counter-title"
                    description="Kids attending"
                    defaultMessage="Kids"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Subtitle */}
            <div className="relative">
              <p className="text-sm font-semibold text-sky-700 dark:text-sky-300 group-hover:text-sky-800 dark:group-hover:text-sky-200 transition-colors duration-300">
                <FormattedMessage
                  id="rsvp-kids-counter-subtitle"
                  description="All children"
                  defaultMessage="All children"
                />
              </p>
            </div>
          </div>

          {/* Total Counter - Modern Design */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100 dark:from-violet-900/30 dark:via-purple-900/20 dark:to-fuchsia-800/30 rounded-2xl p-6 border border-violet-200/60 dark:border-violet-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-violet-100/40 to-purple-200/30 dark:from-transparent dark:via-violet-800/30 dark:to-purple-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Floating Icon */}
            <div className="relative flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-white text-lg" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-violet-700 dark:text-violet-300 mb-1 group-hover:text-violet-800 dark:group-hover:text-violet-200 transition-colors duration-300">
                  {totalAdults + totalKids}
                </div>
                <div className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  <FormattedMessage
                    id="rsvp-total-counter-title"
                    description="Total guests"
                    defaultMessage="Total"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Subtitle */}
            <div className="relative">
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 group-hover:text-violet-800 dark:group-hover:text-violet-200 transition-colors duration-300">
                <FormattedMessage
                  id="rsvp-total-counter-subtitle"
                  description="All guests"
                  defaultMessage="All guests"
                />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern RSVP Accordion Header */}
      <div className="relative">
        {/* Enhanced Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 dark:from-gray-800/10 dark:via-transparent dark:to-gray-700/10 rounded-3xl"></div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="relative w-full flex items-center justify-between p-6 bg-gradient-to-r from-white/90 via-indigo-50/80 to-purple-50/80 dark:from-gray-800/90 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-3xl hover:from-white/95 hover:via-indigo-100/80 hover:to-purple-100/80 dark:hover:from-gray-800/95 dark:hover:via-indigo-900/50 dark:hover:to-purple-900/50 transition-all duration-500 shadow-2xl hover:shadow-3xl border border-indigo-200/40 dark:border-indigo-700/40 group backdrop-blur-sm"
        >
          {/* Left Content */}
          <div className="flex items-center gap-6">
            {/* Enhanced Icon with Glow Effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <FontAwesomeIcon icon={faUsers} className="text-white text-xl" />
              </div>
            </div>

            <div className="text-left flex-1">
              {/* Enhanced Title */}
              <h4 className="font-black text-xl text-blog-black dark:text-blog-white mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-300">
                <FormattedMessage
                  id="rsvp-list-admin-title"
                  description="RSVP Responses (Admin Only)"
                  defaultMessage="RSVP Responses"
                />
                <span className="ml-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-700">
                  <FormattedMessage
                    id="rsvp-admin-only-badge"
                    description="Admin Only"
                    defaultMessage="Admin Only"
                  />
                </span>
              </h4>

              {/* Enhanced Summary Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-700">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 dark:text-emerald-400 text-xs" />
                    <span className="font-bold text-emerald-800 dark:text-emerald-200">{totalFamilies}</span>
                    <span className="text-emerald-700 dark:text-emerald-300">
                      <FormattedMessage
                        id="rsvp-families-label"
                        description="families"
                        defaultMessage="families"
                      />
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-600 dark:text-blue-400 text-xs" />
                    <span className="font-bold text-blue-800 dark:text-blue-200">{totalGuests}</span>
                    <span className="text-blue-700 dark:text-blue-300">
                      <FormattedMessage
                        id="rsvp-guests-label"
                        description="guests"
                        defaultMessage="guests"
                      />
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-700">
                    <FontAwesomeIcon icon={faEnvelope} className="text-purple-600 dark:text-purple-400 text-xs" />
                    <span className="font-bold text-purple-800 dark:text-purple-200">{rsvps.length}</span>
                    <span className="text-purple-700 dark:text-purple-300">
                      <FormattedMessage
                        id="rsvp-responses-label"
                        description="responses"
                        defaultMessage="responses"
                      />
                    </span>
                  </div>
                </div>

                {/* Kids Highlight Badge - Enhanced */}
                {totalKids > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 dark:from-sky-900/50 dark:via-blue-900/50 dark:to-indigo-900/50 text-sky-800 dark:text-sky-200 rounded-2xl text-sm font-black shadow-lg border border-sky-200 dark:border-sky-700 group-hover:shadow-xl transition-all duration-300">
                    <div className="p-1 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full">
                      <FontAwesomeIcon icon={faChild} className="text-white text-xs" />
                    </div>
                    <span>
                      <FormattedMessage
                        id="rsvp-list-kids-highlight"
                        description="Total kids RSVP'd"
                        defaultMessage="{count} kids attending"
                        values={{ count: totalKids }}
                      />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Toggle Icon */}
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-700/80 dark:to-gray-600/80 rounded-2xl group-hover:from-white/90 group-hover:to-gray-100/80 dark:group-hover:from-gray-600/90 dark:group-hover:to-gray-500/80 transition-all duration-300 shadow-lg group-hover:shadow-xl backdrop-blur-sm">
              <FontAwesomeIcon
                icon={expanded ? faChevronUp : faChevronDown}
                className="text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300 text-lg"
              />
            </div>
          </div>
        </button>
      </div>

      {/* RSVP Details */}
      {expanded && (
        <div className="mt-4 space-y-6 animate-fadeIn">
          {rsvps.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-4xl mb-3 opacity-50" />
              <p>
                <FormattedMessage
                  id="rsvp-list-no-responses"
                  description="No RSVP responses yet"
                  defaultMessage="No RSVP responses yet for this event."
                />
              </p>
            </div>
          ) : (
            <>
              {/* Modern Kids Summary Card */}
              {totalKids > 0 && (
                <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-sky-900/30 dark:via-blue-900/20 dark:to-indigo-800/30 rounded-3xl p-8 border border-sky-200/60 dark:border-sky-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-sky-100/40 to-blue-200/30 dark:from-transparent dark:via-sky-800/30 dark:to-blue-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                  <div className="relative flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {/* Enhanced Icon */}
                      <div className="p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                        <FontAwesomeIcon icon={faChild} className="text-white text-xl" />
                      </div>
                      <div>
                        <h6 className="font-black text-xl text-blog-black dark:text-blog-white mb-1 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors duration-300">
                          <FormattedMessage
                            id="rsvp-list-kids-summary-title"
                            description="Kids RSVP Summary"
                            defaultMessage="Kids Attending This Event"
                          />
                        </h6>
                        <p className="text-sm font-semibold text-sky-700 dark:text-sky-300 group-hover:text-sky-800 dark:group-hover:text-sky-200 transition-colors duration-300">
                          <FormattedMessage
                            id="rsvp-list-kids-summary-description"
                            description="Kids summary description"
                            defaultMessage="Total children who have RSVP'd"
                          />
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-sky-700 dark:text-sky-300 mb-1 group-hover:text-sky-800 dark:group-hover:text-sky-200 transition-colors duration-300">
                        {totalKids}
                      </div>
                      <div className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                        <FormattedMessage
                          id="rsvp-list-kids-label"
                          description="Kids label"
                          defaultMessage="{count, plural, one {kid} other {kids}}"
                          values={{ count: totalKids }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Age Breakdown */}
                  {(kidsAgeBreakdown.toddlers > 0 || kidsAgeBreakdown.children > 0 || kidsAgeBreakdown.teens > 0) && (
                    <div className="pt-6 border-t border-sky-200/50 dark:border-sky-700/50">
                      <div className="grid grid-cols-3 gap-4">
                        {kidsAgeBreakdown.toddlers > 0 && (
                          <div className="group/age bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mb-2 group-hover/age:text-emerald-800 dark:group-hover/age:text-emerald-200 transition-colors duration-300">
                                {kidsAgeBreakdown.toddlers}
                              </div>
                              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                <FormattedMessage
                                  id="rsvp-list-toddlers-label"
                                  description="Toddlers (0-5 years)"
                                  defaultMessage="Toddlers (0-5)"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {kidsAgeBreakdown.children > 0 && (
                          <div className="group/age bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mb-2 group-hover/age:text-blue-800 dark:group-hover/age:text-blue-200 transition-colors duration-300">
                                {kidsAgeBreakdown.children}
                              </div>
                              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                <FormattedMessage
                                  id="rsvp-list-children-label"
                                  description="Children (6-12 years)"
                                  defaultMessage="Children (6-12)"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {kidsAgeBreakdown.teens > 0 && (
                          <div className="group/age bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-center">
                              <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mb-2 group-hover/age:text-purple-800 dark:group-hover/age:text-purple-200 transition-colors duration-300">
                                {kidsAgeBreakdown.teens}
                              </div>
                              <div className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                <FormattedMessage
                                  id="rsvp-list-teens-label"
                                  description="Teens (13+)"
                                  defaultMessage="Teens (13+)"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attending Section - Modern Header */}
              {attendingRsvps.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      {/* Enhanced Success Icon */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl blur-lg opacity-30"></div>
                        <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-lg" />
                        </div>
                      </div>
                      <div>
                        <h5 className="font-black text-2xl text-blog-black dark:text-blog-white mb-1">
                          <FormattedMessage
                            id="rsvp-list-attending-title"
                            description="Attending"
                            defaultMessage="Attending ({count})"
                            values={{ count: attendingRsvps.length }}
                          />
                        </h5>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          <FormattedMessage
                            id="rsvp-attending-description"
                            description="Families who confirmed attendance"
                            defaultMessage="Families who confirmed attendance"
                          />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-700">
                        <FontAwesomeIcon icon={faUsers} className="text-emerald-600 dark:text-emerald-400 text-xs" />
                        <span className="font-bold text-emerald-800 dark:text-emerald-200">{totalFamilies}</span>
                        <span className="text-emerald-700 dark:text-emerald-300">
                          <FormattedMessage
                            id="rsvp-families-short"
                            description="families"
                            defaultMessage="families"
                          />
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-sky-100 dark:bg-sky-900/40 px-4 py-2 rounded-2xl border border-sky-200 dark:border-sky-700">
                        <FontAwesomeIcon icon={faChild} className="text-sky-600 dark:text-sky-400 text-xs" />
                        <span className="font-bold text-sky-800 dark:text-sky-200">{totalKids}</span>
                        <span className="text-sky-700 dark:text-sky-300">
                          <FormattedMessage
                            id="rsvp-kids-short"
                            description="kids"
                            defaultMessage="kids"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {attendingRsvps.map((rsvp) => (
                      <div key={rsvp.id} className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-emerald-800/30 rounded-xl p-5 border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-100/30 to-green-200/20 dark:from-transparent dark:via-emerald-800/20 dark:to-green-700/10"></div>
                        
                        {/* Success Indicator */}
                        <div className="absolute top-3 right-3">
                          <div className="p-1.5 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 dark:text-emerald-400 text-sm" />
                          </div>
                        </div>

                        {/* Family Header */}
                        <div className="relative flex items-center gap-3 mb-4">
                          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-lg">
                            <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                          </div>
                          
                          <div className="flex-1">
                            <h6 className="font-bold text-lg text-blog-black dark:text-blog-white mb-1">
                              {rsvp.family_name}
                            </h6>
                            
                            {/* Enhanced Badges */}
                            <div className="flex gap-2 flex-wrap">
                              <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-800 dark:to-green-800 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-semibold shadow-sm border border-emerald-200 dark:border-emerald-700">
                                <FontAwesomeIcon icon={faUsers} className="text-xs" />
                                <span>{1 + (rsvp.kids?.length || 0)} total</span>
                              </div>
                              
                              {rsvp.kids && rsvp.kids.length > 0 && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-800 dark:to-blue-800 text-sky-800 dark:text-sky-200 rounded-full text-xs font-semibold shadow-sm border border-sky-200 dark:border-sky-700">
                                  <FontAwesomeIcon icon={faChild} className="text-xs" />
                                  <span>{rsvp.kids.length} kids</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Children Section - Enhanced */}
                        {rsvp.kids && rsvp.kids.length > 0 && (
                          <div className="relative mb-4 p-3 bg-white/60 dark:bg-emerald-800/30 rounded-lg border border-sky-200/50 dark:border-sky-700/50">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-sky-500/20 dark:bg-sky-400/20 rounded-full">
                                <FontAwesomeIcon icon={faChild} className="text-sky-600 dark:text-sky-400 text-sm" />
                              </div>
                              <span className="text-sm font-bold text-blog-black dark:text-blog-white">
                                <FormattedMessage
                                  id="rsvp-list-children-label"
                                  description="Children"
                                  defaultMessage="Children:"
                                />
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {rsvp.kids.map((kid, index) => (
                                <div key={index} className="p-3 bg-white/80 dark:bg-sky-900/30 rounded-lg border border-sky-100 dark:border-sky-800">
                                  <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-sky-100 dark:bg-sky-800 rounded-full flex-shrink-0 mt-0.5">
                                      <FontAwesomeIcon icon={faChild} className="text-sky-600 dark:text-sky-400 text-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-blog-black dark:text-blog-white text-sm">{kid.name}</span>
                                        <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-800 text-sky-700 dark:text-sky-300 rounded-full text-xs font-medium">
                                          Age {kid.age}
                                        </span>
                                      </div>
                                      {kid.allergies && kid.allergies.trim() && (
                                        <div className="mt-2">
                                          <div className="flex items-center gap-1 mb-1">
                                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                                              <FormattedMessage
                                                id="rsvp-allergies-label"
                                                description="Allergies/Dietary"
                                                defaultMessage="Allergies/Dietary"
                                              />
                                            </span>
                                          </div>
                                          <div className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded text-xs text-orange-700 dark:text-orange-300">
                                            {kid.allergies}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Enhanced Contact Info */}
                        {(rsvp.email || rsvp.phone) && (
                          <div className="relative mb-4 p-3 bg-white/60 dark:bg-emerald-800/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-gray-500/20 dark:bg-gray-400/20 rounded-full">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-600 dark:text-gray-400 text-sm" />
                              </div>
                              <span className="text-sm font-bold text-blog-black dark:text-blog-white">
                                <FormattedMessage
                                  id="rsvp-contact-info-label"
                                  description="Contact Information"
                                  defaultMessage="Contact:"
                                />
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {rsvp.email && (
                                <div className="flex items-center gap-3 p-2 bg-white/80 dark:bg-gray-900/30 rounded-lg hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-colors duration-200">
                                  <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded-full">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 dark:text-blue-400 text-xs" />
                                  </div>
                                  <a 
                                    href={`mailto:${rsvp.email}`} 
                                    className="text-sm text-blog-black dark:text-blog-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                                  >
                                    {rsvp.email}
                                  </a>
                                </div>
                              )}
                              
                              {rsvp.phone && (
                                <div className="flex items-center gap-3 p-2 bg-white/80 dark:bg-gray-900/30 rounded-lg hover:bg-green-50/80 dark:hover:bg-green-900/20 transition-colors duration-200">
                                  <div className="p-1 bg-green-100 dark:bg-green-800 rounded-full">
                                    <FontAwesomeIcon icon={faPhone} className="text-green-600 dark:text-green-400 text-xs" />
                                  </div>
                                  <a 
                                    href={`tel:${rsvp.phone}`} 
                                    className="text-sm text-blog-black dark:text-blog-white hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                                  >
                                    {rsvp.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Enhanced Message */}
                        {rsvp.message && (
                          <div className="relative mb-4 p-3 bg-white/60 dark:bg-emerald-800/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-purple-500/20 dark:bg-purple-400/20 rounded-full">
                                <FontAwesomeIcon icon={faCommentDots} className="text-purple-600 dark:text-purple-400 text-sm" />
                              </div>
                              <span className="text-sm font-bold text-blog-black dark:text-blog-white">
                                <FormattedMessage
                                  id="rsvp-list-message-label"
                                  description="Message"
                                  defaultMessage="Message:"
                                />
                              </span>
                            </div>
                            
                            <div className="p-3 bg-white/80 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                              <p className="text-sm text-gray-700 dark:text-gray-200 italic leading-relaxed">
                                &quot;{rsvp.message}&quot;
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Enhanced RSVP Date */}
                        <div className="relative flex items-center justify-center pt-3 border-t border-emerald-200/50 dark:border-emerald-700/50">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full shadow-sm">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-500 dark:text-gray-400 text-xs" />
                            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                              <FormattedMessage
                                id="rsvp-list-responded-on"
                                description="Responded on date"
                                defaultMessage="Responded {date}"
                                values={{
                                  date: new Date(rsvp.created_at).toLocaleDateString()
                                }}
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Not Attending Section - Modern Header */}
              {notAttendingRsvps.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    {/* Enhanced Decline Icon */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl blur-lg opacity-30"></div>
                      <div className="relative p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-white text-lg" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-black text-2xl text-blog-black dark:text-blog-white mb-1">
                        <FormattedMessage
                          id="rsvp-list-not-attending-title"
                          description="Not Attending"
                          defaultMessage="Not Attending ({count})"
                          values={{ count: notAttendingRsvps.length }}
                        />
                      </h5>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                        <FormattedMessage
                          id="rsvp-not-attending-description"
                          description="Families who declined the invitation"
                          defaultMessage="Families who declined the invitation"
                        />
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {notAttendingRsvps.map((rsvp) => (
                      <div key={rsvp.id} className="group relative overflow-hidden bg-gradient-to-br from-red-50 via-pink-50 to-red-100 dark:from-red-900/20 dark:via-pink-900/20 dark:to-red-800/30 rounded-xl p-4 border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-red-100/30 to-pink-200/20 dark:from-transparent dark:via-red-800/20 dark:to-pink-700/10"></div>
                        
                        {/* Decline Indicator */}
                        <div className="absolute top-3 right-3">
                          <div className="p-1.5 bg-red-500/20 dark:bg-red-400/20 rounded-full">
                            <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 dark:text-red-400 text-sm" />
                          </div>
                        </div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg">
                              <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                            </div>
                            <div>
                              <span className="font-bold text-lg text-blog-black dark:text-blog-white">
                                {rsvp.family_name}
                              </span>
                              <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                                <FormattedMessage
                                  id="rsvp-declined-label"
                                  description="Declined invitation"
                                  defaultMessage="Declined invitation"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full shadow-sm">
                              <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-500 dark:text-gray-400 text-xs" />
                              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                {new Date(rsvp.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Message for Declined */}
                        {rsvp.message && (
                          <div className="relative mt-3 p-3 bg-white/60 dark:bg-red-800/30 rounded-lg border border-red-200/50 dark:border-red-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1 bg-red-500/20 dark:bg-red-400/20 rounded-full">
                                <FontAwesomeIcon icon={faCommentDots} className="text-red-600 dark:text-red-400 text-xs" />
                              </div>
                              <span className="text-xs font-bold text-blog-black dark:text-blog-white">
                                <FormattedMessage
                                  id="rsvp-decline-reason-label"
                                  description="Reason for declining"
                                  defaultMessage="Note:"
                                />
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-200 italic leading-relaxed pl-3">
                              &quot;{rsvp.message}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RSVPList;
