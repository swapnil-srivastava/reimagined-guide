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
  faUser
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

import { supaClient } from '../supa-client';
import { useSession } from '../lib/use-session';

interface Kid {
  name: string;
  age: string;
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
}

const RSVPList: React.FC<RSVPListProps> = ({ eventId, eventTitle }) => {
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
    return (
      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-fun-blue-500 pt-6">
      {/* Guest Count Summary - Outside Accordion */}
      {totalFamilies > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Adults Counter */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                  <FontAwesomeIcon icon={faUsers} className="text-green-600 dark:text-green-300 text-sm" />
                </div>
                <div>
                  <h6 className="font-semibold text-green-800 dark:text-green-200 text-sm">
                    <FormattedMessage
                      id="rsvp-adults-counter-title"
                      description="Adults attending"
                      defaultMessage="Adults"
                    />
                  </h6>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    <FormattedMessage
                      id="rsvp-adults-counter-subtitle"
                      description="2 per family"
                      defaultMessage="(2 per family)"
                    />
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {totalAdults}
                </div>
              </div>
            </div>
          </div>

          {/* Kids Counter */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <FontAwesomeIcon icon={faChild} className="text-blue-600 dark:text-blue-300 text-sm" />
                </div>
                <div>
                  <h6 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                    <FormattedMessage
                      id="rsvp-kids-counter-title"
                      description="Kids attending"
                      defaultMessage="Kids"
                    />
                  </h6>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <FormattedMessage
                      id="rsvp-kids-counter-subtitle"
                      description="All children"
                      defaultMessage="All children"
                    />
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {totalKids}
                </div>
              </div>
            </div>
          </div>

          {/* Total Counter */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-purple-600 dark:text-purple-300 text-sm" />
                </div>
                <div>
                  <h6 className="font-semibold text-purple-800 dark:text-purple-200 text-sm">
                    <FormattedMessage
                      id="rsvp-total-counter-title"
                      description="Total guests"
                      defaultMessage="Total"
                    />
                  </h6>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    <FormattedMessage
                      id="rsvp-total-counter-subtitle"
                      description="All guests"
                      defaultMessage="All guests"
                    />
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {totalAdults + totalKids}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RSVP Summary Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
          <div className="text-left flex-1">
            <h4 className="font-semibold text-blog-black dark:text-blog-white">
              <FormattedMessage
                id="rsvp-list-admin-title"
                description="RSVP Responses (Admin Only)"
                defaultMessage="RSVP Responses (Admin Only)"
              />
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <FormattedMessage
                  id="rsvp-list-summary"
                  description="RSVP summary"
                  defaultMessage="{attending} families attending • {total} total responses • {guests} total guests"
                  values={{
                    attending: totalFamilies,
                    total: rsvps.length,
                    guests: totalGuests
                  }}
                />
              </p>
              {totalKids > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  <FontAwesomeIcon icon={faChild} className="text-xs" />
                  <span>
                    <FormattedMessage
                      id="rsvp-list-kids-highlight"
                      description="Total kids RSVP'd"
                      defaultMessage="{count} kids RSVP'd"
                      values={{ count: totalKids }}
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <FontAwesomeIcon 
          icon={expanded ? faChevronUp : faChevronDown} 
          className="text-gray-500 dark:text-gray-400"
        />
      </button>

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
              {/* Kids Summary Card */}
              {totalKids > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                        <FontAwesomeIcon icon={faChild} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h6 className="font-semibold text-blog-black dark:text-blog-white">
                          <FormattedMessage
                            id="rsvp-list-kids-summary-title"
                            description="Kids RSVP Summary"
                            defaultMessage="Kids Attending This Event"
                          />
                        </h6>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <FormattedMessage
                            id="rsvp-list-kids-summary-description"
                            description="Kids summary description"
                            defaultMessage="Total children who have RSVP'd"
                          />
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                        {totalKids}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <FormattedMessage
                          id="rsvp-list-kids-label"
                          description="Kids label"
                          defaultMessage="{count, plural, one {kid} other {kids}}"
                          values={{ count: totalKids }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Age Breakdown */}
                  {(kidsAgeBreakdown.toddlers > 0 || kidsAgeBreakdown.children > 0 || kidsAgeBreakdown.teens > 0) && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {kidsAgeBreakdown.toddlers > 0 && (
                          <div className="bg-white dark:bg-blue-800/50 rounded-lg p-2">
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                              {kidsAgeBreakdown.toddlers}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              <FormattedMessage
                                id="rsvp-list-toddlers-label"
                                description="Toddlers (0-5 years)"
                                defaultMessage="Toddlers (0-5)"
                              />
                            </div>
                          </div>
                        )}
                        {kidsAgeBreakdown.children > 0 && (
                          <div className="bg-white dark:bg-blue-800/50 rounded-lg p-2">
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                              {kidsAgeBreakdown.children}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              <FormattedMessage
                                id="rsvp-list-children-label"
                                description="Children (6-12 years)"
                                defaultMessage="Children (6-12)"
                              />
                            </div>
                          </div>
                        )}
                        {kidsAgeBreakdown.teens > 0 && (
                          <div className="bg-white dark:bg-blue-800/50 rounded-lg p-2">
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                              {kidsAgeBreakdown.teens}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              <FormattedMessage
                                id="rsvp-list-teens-label"
                                description="Teens (13+)"
                                defaultMessage="Teens (13+)"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attending Section */}
              {attendingRsvps.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                      <h5 className="font-semibold text-blog-black dark:text-blog-white">
                        <FormattedMessage
                          id="rsvp-list-attending-title"
                          description="Attending"
                          defaultMessage="Attending ({count})"
                          values={{ count: attendingRsvps.length }}
                        />
                      </h5>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faUsers} className="text-xs" />
                        <span>{totalFamilies} families</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faChild} className="text-xs" />
                        <span>{totalKids} kids</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {attendingRsvps.map((rsvp) => (
                      <div key={rsvp.id} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        {/* Family Name */}
                        <div className="flex items-center gap-2 mb-3">
                          <FontAwesomeIcon icon={faUser} className="text-green-600" />
                          <h6 className="font-medium text-blog-black dark:text-blog-white">
                            {rsvp.family_name}
                          </h6>
                          <div className="flex gap-1">
                            <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                              {1 + (rsvp.kids?.length || 0)} total
                            </span>
                            {rsvp.kids && rsvp.kids.length > 0 && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                {rsvp.kids.length} kids
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Children */}
                        {rsvp.kids && rsvp.kids.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <FontAwesomeIcon icon={faChild} className="text-blue-500 text-sm" />
                              <span className="text-sm font-medium text-blog-black dark:text-blog-white">
                                <FormattedMessage
                                  id="rsvp-list-children-label"
                                  description="Children"
                                  defaultMessage="Children:"
                                />
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 ml-6">
                              {rsvp.kids.map((kid, index) => (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                  {kid.name} ({kid.age})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Contact Info */}
                        {(rsvp.email || rsvp.phone) && (
                          <div className="mb-3 space-y-1">
                            {rsvp.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 text-xs" />
                                <a href={`mailto:${rsvp.email}`} className="hover:text-blue-500">
                                  {rsvp.email}
                                </a>
                              </div>
                            )}
                            {rsvp.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <FontAwesomeIcon icon={faPhone} className="text-gray-400 text-xs" />
                                <a href={`tel:${rsvp.phone}`} className="hover:text-blue-500">
                                  {rsvp.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message */}
                        {rsvp.message && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <FontAwesomeIcon icon={faCommentDots} className="text-gray-400 text-xs" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                <FormattedMessage
                                  id="rsvp-list-message-label"
                                  description="Message"
                                  defaultMessage="Message:"
                                />
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic ml-4">
                              &quot;{rsvp.message}&quot;
                            </p>
                          </div>
                        )}

                        {/* RSVP Date */}
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          <FormattedMessage
                            id="rsvp-list-responded-on"
                            description="Responded on date"
                            defaultMessage="Responded on {date}"
                            values={{
                              date: new Date(rsvp.created_at).toLocaleDateString()
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Not Attending Section */}
              {notAttendingRsvps.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
                    <h5 className="font-semibold text-blog-black dark:text-blog-white">
                      <FormattedMessage
                        id="rsvp-list-not-attending-title"
                        description="Not Attending"
                        defaultMessage="Not Attending ({count})"
                        values={{ count: notAttendingRsvps.length }}
                      />
                    </h5>
                  </div>
                  <div className="space-y-3">
                    {notAttendingRsvps.map((rsvp) => (
                      <div key={rsvp.id} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-red-600" />
                            <span className="font-medium text-blog-black dark:text-blog-white">
                              {rsvp.family_name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(rsvp.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {rsvp.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 italic mt-2">
                            &quot;{rsvp.message}&quot;
                          </p>
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
