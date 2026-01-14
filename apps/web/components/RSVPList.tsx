import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// @ts-ignore - Supabase type instantiation issue
import { supaClient } from '../supa-client';
import {
  faUsers,
  faUser,
  faChild,
  faPhone,
  faEnvelope,
  faChevronDown,
  faChevronUp,
  faCrown,
  faHeart,
  faCalendarAlt,
  faMapMarkerAlt,
  faClock,
  faExclamationTriangle,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import { useSession } from '../lib/use-session';
import { toast } from 'react-hot-toast';

interface RSVP {
  id: string;
  event_id: string;
  family_name: string; // Fixed: was 'name'
  email?: string;
  phone?: string;
  is_attending: boolean;
  kids: Array<{name: string; age: string; allergies?: string}>; // Fixed: was number_of_guests, guest_names
  message?: string; // Fixed: was dietary_restrictions, special_requests
  created_at: string;
  updated_at: string;
}

interface RSVPListProps {
  eventId: string;
  eventTitle: string;
  showSummaryOnly?: boolean;
  isClickable?: boolean;
}

const RSVPList: React.FC<RSVPListProps> = ({ eventId, eventTitle, showSummaryOnly = false, isClickable = false }) => {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { session } = useSession();
  const intl = useIntl();

  // Check if user is admin
  const isAdmin = session?.user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID;

  // Auto-expand for admins - always expand when not in summary mode
  useEffect(() => {
    if (isAdmin && !showSummaryOnly) {
      setExpanded(true);
    } else if (!isAdmin && showSummaryOnly) {
      setExpanded(false);
    }
  }, [isAdmin, showSummaryOnly]);

  useEffect(() => {
    fetchRSVPs();
  }, [eventId]);

  const fetchRSVPs = async () => {
    try {
      setLoading(true);
      // @ts-ignore - rsvps table not in generated types yet
      const result = await supaClient
        // @ts-ignore
        .from('rsvps')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      const { data, error } = result;

      if (error) throw error;
      setRsvps((data as any) || []);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      toast.error(intl.formatMessage({
        id: "rsvp-fetch-error",
        description: "Error fetching RSVPs",
        defaultMessage: "Failed to load RSVPs"
      }));
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalAttending = rsvps.filter(rsvp => rsvp.is_attending).length;
  const totalGuests = rsvps.reduce((sum, rsvp) => sum + (rsvp.is_attending ? (rsvp.kids?.length || 0) + 1 : 0), 0); // +1 for the family member
  const totalNotAttending = rsvps.filter(rsvp => !rsvp.is_attending).length;

  // Age breakdown for attending guests
  const attendingRSVPs = rsvps.filter(rsvp => rsvp.is_attending);
  const adultCount = attendingRSVPs.length; // Each RSVP represents one adult/family
  const childCount = attendingRSVPs.reduce((sum, rsvp) => sum + (rsvp.kids?.length || 0), 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-fun-blue-600 rounded-lg p-4 drop-shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-fun-blue-500 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-fun-blue-500 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (showSummaryOnly) {
    return (
      <div className={`bg-white dark:bg-fun-blue-600 rounded-lg p-3 sm:p-4 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 overflow-hidden ${isClickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-fun-blue-700' : ''}`}>
        {/* Mobile-First Summary Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="text-fun-blue-500 dark:text-blog-white text-sm" />
            <span className="text-sm font-semibold text-blog-black dark:text-blog-white">
              <FormattedMessage
                id="rsvp-summary-title"
                description="RSVP Summary"
                defaultMessage="RSVP Summary"
              />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-fun-blue-100 dark:bg-fun-blue-700 text-fun-blue-600 dark:text-fun-blue-300 px-2 py-1 rounded-full font-medium">
              {rsvps.length} {rsvps.length === 1 ? 'response' : 'responses'}
            </span>
            {isClickable && (
              <FontAwesomeIcon
                icon={faChevronDown}
                className="text-gray-500 dark:text-blog-white text-sm transition-transform duration-200"
              />
            )}
          </div>
        </div>

        {/* Mobile-First Summary Stats Grid */}
        <div className="grid grid-cols-3 gap-1 sm:gap-3">
          {/* Attending Card */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-1 sm:p-3 text-center border border-green-200 dark:border-green-800 overflow-hidden">
            <div className="flex items-center justify-center mb-1">
              <FontAwesomeIcon icon={faHeart} className="text-green-600 dark:text-green-400 text-xs sm:text-sm" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
              {totalAttending}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium leading-tight break-words hyphens-auto px-0.5">
              <FormattedMessage
                id="rsvp-attending"
                description="Attending"
                defaultMessage="Attending"
              />
            </div>
          </div>

          {/* Total Guests Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-1 sm:p-3 text-center border border-blue-200 dark:border-blue-800 overflow-hidden">
            <div className="flex items-center justify-center mb-1">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
              {totalGuests}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-tight break-words hyphens-auto px-0.5">
              <FormattedMessage
                id="rsvp-total-guests"
                description="Total Guests"
                defaultMessage="Total Guests"
              />
            </div>
          </div>

          {/* Not Attending Card */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-1 sm:p-3 text-center border border-red-200 dark:border-red-800 overflow-hidden">
            <div className="flex items-center justify-center mb-1">
              <FontAwesomeIcon icon={faUser} className="text-red-600 dark:text-red-400 text-xs sm:text-sm" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
              {totalNotAttending}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 font-medium leading-tight break-words hyphens-auto px-0.5">
              <FormattedMessage
                id="rsvp-not-attending"
                description="Not Attending"
                defaultMessage="Not Attending"
              />
            </div>
          </div>
        </div>

        {/* Age Breakdown for Mobile */}
        {totalAttending > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-fun-blue-500">
            <div className="text-xs text-gray-600 dark:text-blog-white mb-2 font-medium">
              <FormattedMessage
                id="rsvp-age-breakdown"
                description="Age Breakdown"
                defaultMessage="Age Breakdown"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <FontAwesomeIcon icon={faUser} className="text-gray-500 dark:text-blog-white" />
                <span className="text-blog-black dark:text-blog-white">
                  {adultCount} <FormattedMessage id="rsvp-adults" description="adults" defaultMessage="adults" />
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <FontAwesomeIcon icon={faChild} className="text-gray-500 dark:text-blog-white" />
                <span className="text-blog-black dark:text-blog-white">
                  {childCount} <FormattedMessage id="rsvp-children" description="children" defaultMessage="children" />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-fun-blue-600 rounded-lg drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
      {/* Accordion Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 rounded-t-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-fun-blue-500 to-fun-blue-600 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="text-white text-sm sm:text-base" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-blog-black dark:text-blog-white">
                <FormattedMessage
                  id="rsvp-responses-title"
                  description="RSVP Responses"
                  defaultMessage="RSVP Responses"
                />
              </h3>
              <p className="text-sm text-gray-600 dark:text-blog-white">
                {rsvps.length} {rsvps.length === 1 ? 'response' : 'responses'} • {totalAttending} attending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 dark:bg-fun-blue-700 text-gray-600 dark:text-blog-white px-2 py-1 rounded-full">
              <FormattedMessage
                id="rsvp-click-to-collapse"
                description="Click to collapse"
                defaultMessage="Click to collapse"
              />
            </span>
            <FontAwesomeIcon
              icon={faChevronUp}
              className="text-gray-500 dark:text-blog-white text-lg transition-transform duration-200"
            />
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {expanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-200 dark:border-fun-blue-500">
          {rsvps.length === 0 ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faUsers} className="text-gray-400 dark:text-blog-white text-3xl mb-3" />
              <p className="text-gray-500 dark:text-blog-white">
                <FormattedMessage
                  id="rsvp-no-responses"
                  description="No RSVP responses yet"
                  defaultMessage="No RSVP responses yet"
                />
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faHeart} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      <FormattedMessage id="rsvp-attending" description="Attending" defaultMessage="Attending" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalAttending}</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      <FormattedMessage id="rsvp-total-guests" description="Total Guests" defaultMessage="Total Guests" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalGuests}</div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faUser} className="text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      <FormattedMessage id="rsvp-not-attending" description="Not Attending" defaultMessage="Not Attending" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalNotAttending}</div>
                </div>
              </div>

              {/* Enhanced Attendance Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Attending Guests Details */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faHeart} className="text-green-600 dark:text-green-400" />
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
                      <FormattedMessage id="rsvp-attending-details" description="Attending Details" defaultMessage="Attending Details" />
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {attendingRSVPs.map((rsvp) => (
                      <div key={rsvp.id} className="bg-white dark:bg-green-900/10 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blog-black dark:text-blog-white">{rsvp.family_name}</span>
                          <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                            {(rsvp.kids?.length || 0) + 1} {((rsvp.kids?.length || 0) + 1) === 1 ? 'guest' : 'guests'}
                          </span>
                        </div>
                        {rsvp.kids && rsvp.kids.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              <FormattedMessage id="rsvp-with" description="With:" defaultMessage="With:" />
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rsvp.kids.map((kid, index) => (
                                <span key={index} className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs">
                                  {kid.name} ({kid.age}y){kid.allergies && kid.allergies.trim() !== '' ? ` - ${kid.allergies}` : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Not Attending Guests */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faUser} className="text-red-600 dark:text-red-400" />
                    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
                      <FormattedMessage id="rsvp-not-attending-details" description="Not Attending" defaultMessage="Not Attending" />
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {rsvps.filter(rsvp => !rsvp.is_attending).map((rsvp) => (
                      <div key={rsvp.id} className="bg-white dark:bg-red-900/10 rounded p-2">
                        <span className="text-sm font-medium text-blog-black dark:text-blog-white">{rsvp.family_name}</span>
                      </div>
                    ))}
                    {totalNotAttending === 0 && (
                      <p className="text-sm text-gray-500 dark:text-blog-white italic">
                        <FormattedMessage id="rsvp-no-one-not-attending" description="Everyone is attending!" defaultMessage="Everyone is attending!" />
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests Section - Shows for all RSVPs with messages */}
              {rsvps.some(rsvp => rsvp.message && rsvp.message.trim() !== '') && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      <FormattedMessage id="rsvp-all-special-requests" description="All Special Requests" defaultMessage="All Special Requests" />
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {rsvps.filter(rsvp => rsvp.message && rsvp.message.trim() !== '').map((rsvp) => (
                      <div key={rsvp.id} className="bg-white dark:bg-blue-900/10 rounded p-3 border-l-4 border-blue-400">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1 sm:gap-0">
                          <div className="font-medium text-sm text-blog-black dark:text-blog-white min-w-0 truncate pr-2">{rsvp.family_name}</div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 self-start ${
                            rsvp.is_attending
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          }`}>
                            {rsvp.is_attending ? 'Attending' : 'Not Attending'}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-blog-white">{rsvp.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergies & Dietary Restrictions */}
              {attendingRSVPs.some(rsvp => rsvp.kids?.some(kid => kid.allergies && kid.allergies.trim() !== '')) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 dark:text-yellow-400" />
                    <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      <FormattedMessage id="rsvp-allergies-dietary" description="Allergies & Dietary Restrictions" defaultMessage="Allergies & Dietary Restrictions" />
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {attendingRSVPs.filter(rsvp => rsvp.kids?.some(kid => kid.allergies && kid.allergies.trim() !== '')).map((rsvp) => (
                      <div key={rsvp.id} className="bg-white dark:bg-yellow-900/10 rounded p-3 border-l-4 border-yellow-400">
                        <div className="font-medium text-sm text-blog-black dark:text-blog-white mb-1">{rsvp.family_name}</div>
                        <div className="space-y-1">
                          {rsvp.kids?.filter(kid => kid.allergies && kid.allergies.trim() !== '').map((kid, index) => (
                            <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">{kid.name}:</span> {kid.allergies}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toddler Identification */}
              {attendingRSVPs.some(rsvp => rsvp.kids?.some(kid =>
                parseInt(kid.age) <= 5 ||
                kid.name.toLowerCase().includes('toddler') ||
                kid.name.toLowerCase().includes('baby') ||
                kid.name.toLowerCase().includes('infant')
              )) && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faChild} className="text-purple-600 dark:text-purple-400" />
                    <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      <FormattedMessage id="rsvp-toddlers-babies" description="Toddlers & Babies" defaultMessage="Toddlers & Babies" />
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {attendingRSVPs.filter(rsvp =>
                      rsvp.kids?.some(kid =>
                        parseInt(kid.age) <= 5 ||
                        kid.name.toLowerCase().includes('toddler') ||
                        kid.name.toLowerCase().includes('baby') ||
                        kid.name.toLowerCase().includes('infant')
                      )
                    ).map((rsvp) => (
                      <div key={rsvp.id} className="bg-white dark:bg-purple-900/10 rounded p-3 border-l-4 border-purple-400">
                        <div className="font-medium text-sm text-blog-black dark:text-blog-white mb-1">{rsvp.family_name}</div>
                        {rsvp.kids && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              <FormattedMessage id="rsvp-little-ones" description="Little ones:" defaultMessage="Little ones:" />
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rsvp.kids.filter(kid =>
                                parseInt(kid.age) <= 5 ||
                                kid.name.toLowerCase().includes('toddler') ||
                                kid.name.toLowerCase().includes('baby') ||
                                kid.name.toLowerCase().includes('infant')
                              ).map((kid, index) => (
                                <span key={index} className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs">
                                  {kid.name} ({kid.age}y)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Special Requests - Visible to Everyone */}
              {rsvps.some(rsvp => rsvp.message && rsvp.message.trim() !== '') && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faComment} className="text-orange-600 dark:text-orange-400" />
                    <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      <FormattedMessage id="rsvp-all-special-requests" description="All Special Requests" defaultMessage="All Special Requests" />
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {rsvps.filter(rsvp => rsvp.message && rsvp.message.trim() !== '').map((rsvp) => (
                      <div key={rsvp.id} className="bg-white dark:bg-orange-900/10 rounded p-3 border-l-4 border-orange-400">
                        <div className="font-medium text-sm text-blog-black dark:text-blog-white mb-1">{rsvp.family_name}</div>
                        <div className="text-sm text-gray-700 dark:text-blog-white">{rsvp.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual RSVPs - Admin Only */}
              {isAdmin && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blog-black dark:text-blog-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faCrown} className="text-yellow-500" />
                    <FormattedMessage id="rsvp-detailed-responses" description="Detailed Responses" defaultMessage="Detailed Responses" />
                  </h4>

                  {rsvps.map((rsvp) => (
                    <div key={rsvp.id} className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-4 border border-gray-200 dark:border-fun-blue-500">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-blog-black dark:text-blog-white">{rsvp.family_name}</h5>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <FontAwesomeIcon icon={faEnvelope} className="text-xs flex-shrink-0" />
                              <a href={`mailto:${rsvp.email}`} className="hover:text-fun-blue-500 transition-colors truncate">
                                {rsvp.email}
                              </a>
                            </div>
                            {rsvp.phone && (
                              <div className="flex items-center gap-1 min-w-0">
                                <FontAwesomeIcon icon={faPhone} className="text-xs flex-shrink-0" />
                                <a href={`tel:${rsvp.phone}`} className="hover:text-fun-blue-500 transition-colors truncate">
                                  {rsvp.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 self-start ${
                          rsvp.is_attending
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        }`}>
                          {rsvp.is_attending ? 'Attending' : 'Not Attending'}
                        </div>
                      </div>

                      {rsvp.is_attending && (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="text-gray-500 dark:text-blog-white text-xs" />
                            <span className="text-blog-black dark:text-blog-white">
                              {(rsvp.kids?.length || 0) + 1} {(rsvp.kids?.length || 0) + 1 === 1 ? 'guest' : 'guests'}
                            </span>
                          </div>

                          {rsvp.kids && rsvp.kids.length > 0 && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-300 text-xs">
                                <FormattedMessage id="rsvp-guest-names" description="Guest names:" defaultMessage="Guest names:" />
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rsvp.kids.map((kid, index) => (
                                  <span key={index} className="bg-white dark:bg-fun-blue-600 px-2 py-1 rounded text-xs text-blog-black dark:text-blog-white">
                                    {kid.name} ({kid.age}y)
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {rsvp.kids?.some(kid => kid.allergies && kid.allergies.trim() !== '') && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-300 text-xs">
                                <FormattedMessage id="rsvp-dietary" description="Dietary restrictions:" defaultMessage="Dietary restrictions:" />
                              </span>
                              <div className="mt-1 space-y-1">
                                {rsvp.kids.filter(kid => kid.allergies && kid.allergies.trim() !== '').map((kid, index) => (
                                  <p key={index} className="text-blog-black dark:text-blog-white">
                                    {kid.name}: {kid.allergies}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {rsvp.message && rsvp.message.trim() !== '' && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-300 text-xs">
                                <FormattedMessage id="rsvp-special-requests" description="Special requests:" defaultMessage="Special requests:" />
                              </span>
                              <p className="text-blog-black dark:text-blog-white mt-1">{rsvp.message}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show special requests for non-attending RSVPs too */}
                      {!rsvp.is_attending && rsvp.message && rsvp.message.trim() !== '' && (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-300 text-xs">
                              <FormattedMessage id="rsvp-special-requests" description="Special requests:" defaultMessage="Special requests:" />
                            </span>
                            <p className="text-blog-black dark:text-blog-white mt-1">{rsvp.message}</p>
                          </div>
                        </div>
                      )}

                      {/* Admin-only detailed information */}
                      {isAdmin && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-fun-blue-500">
                          <div className="text-xs text-gray-500 dark:text-blog-white">
                            <FormattedMessage
                              id="rsvp-admin-details"
                              description="Admin details only"
                              defaultMessage="Admin details only"
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 dark:text-blog-white mt-3 pt-2 border-t border-gray-200 dark:border-fun-blue-500">
                        <FormattedMessage
                          id="rsvp-responded-on"
                          description="Responded on {date}"
                          defaultMessage="Responded on {date}"
                          values={{
                            date: new Date(rsvp.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RSVPList;
