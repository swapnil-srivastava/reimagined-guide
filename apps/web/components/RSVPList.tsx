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
  faHeart,
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
  /** When supplied the parent owns the open/closed state and the header button
      reports back to it, so there is exactly one click target and one source of
      truth. Without it the component runs its own accordion. */
  onToggle?: () => void;
}

/* Status tones. The class strings are spelled out in full because Tailwind scans
   source text — a constructed string like `border-l-[var(--status-${tone})]`
   would never be generated. */
const TONE = {
  success: {
    bar: 'border-l-[var(--status-success)]',
    text: 'text-[var(--status-success)]',
  },
  danger: {
    bar: 'border-l-[var(--status-danger)]',
    text: 'text-[var(--status-danger)]',
  },
  info: {
    bar: 'border-l-[var(--status-info)]',
    text: 'text-[var(--status-info)]',
  },
  warning: {
    bar: 'border-l-[var(--status-warning)]',
    text: 'text-[var(--status-warning)]',
  },
} as const;

type Tone = keyof typeof TONE;


/** Neutral data panel carrying a status accent bar, icon and heading. */
const AccentPanel: React.FC<{
  tone: Tone;
  icon: typeof faUsers;
  title: React.ReactNode;
  children: React.ReactNode;
}> = ({ tone, icon, title, children }) => (
  <div className={`bg-[var(--data-panel)] border border-[var(--border-subtle)] border-l-4 ${TONE[tone].bar} rounded-lg p-3 sm:p-4`}>
    <div className="flex items-center gap-2 mb-3">
      <FontAwesomeIcon icon={icon} className={TONE[tone].text} />
      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h4>
    </div>
    {children}
  </div>
);

/** One of the three headline counts. */
const StatTile: React.FC<{
  tone: Tone;
  icon: typeof faUsers;
  value: number;
  label: React.ReactNode;
}> = ({ tone, icon, value, label }) => (
  <div className={`bg-[var(--data-panel)] border border-[var(--border-subtle)] border-l-4 ${TONE[tone].bar} rounded-lg p-2 sm:p-3 text-center overflow-hidden`}>
    <div className="flex items-center justify-center mb-1">
      <FontAwesomeIcon icon={icon} className={`${TONE[tone].text} text-xs sm:text-sm`} />
    </div>
    <div className={`text-lg sm:text-2xl font-bold ${TONE[tone].text}`}>{value}</div>
    <div className="text-xs text-[var(--text-primary)] opacity-70 font-medium leading-tight break-words hyphens-auto px-0.5">
      {label}
    </div>
  </div>
);

const StatusPill: React.FC<{ attending: boolean }> = ({ attending }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 self-start text-white ${
      attending ? 'bg-[var(--status-success-solid)]' : 'bg-[var(--status-danger-solid)]'
    }`}
  >
    {attending ? (
      <FormattedMessage id="rsvp-attending" description="Attending" defaultMessage="Attending" />
    ) : (
      <FormattedMessage id="rsvp-not-attending" description="Not Attending" defaultMessage="Not Attending" />
    )}
  </span>
);

const RSVPList: React.FC<RSVPListProps> = ({ eventId, eventTitle, showSummaryOnly = false, isClickable = false, onToggle }) => {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { session } = useSession();
  const intl = useIntl();

  // Check if user is admin. The page already gates this component behind the same
  // check; this guards the contact details specifically, so the component stays
  // safe to reuse somewhere less protected.
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

  // When the parent controls expansion it only mounts the full view while open.
  const isOpen = onToggle ? true : expanded;

  const guestCount = (rsvp: RSVP) => (rsvp.kids?.length || 0) + 1;

  // Roll-ups the host actually acts on. Everything else lives once, on the
  // response card, instead of being repeated across several panels.
  const withAllergies = rsvps.filter(rsvp => rsvp.kids?.some(kid => kid.allergies && kid.allergies.trim() !== ''));
  const withRequests = rsvps.filter(rsvp => rsvp.message && rsvp.message.trim() !== '');

  // Attending first, then newest first within each group.
  const orderedRsvps = [...rsvps].sort((a, b) => {
    if (a.is_attending !== b.is_attending) return a.is_attending ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-4 drop-shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-[var(--border-subtle)] rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-[var(--border-subtle)] rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (showSummaryOnly) {
    return (
      <div className={`bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-3 sm:p-4 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 overflow-hidden ${isClickable ? 'cursor-pointer hover:bg-[var(--surface-inset)]' : ''}`}>
        {/* Mobile-First Summary Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="text-[var(--color-primary)] text-sm" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              <FormattedMessage
                id="rsvp-summary-title"
                description="RSVP Summary"
                defaultMessage="RSVP Summary"
              />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[var(--color-primary-light)] text-[#0a0a0a] px-2 py-1 rounded-full font-medium">
              {rsvps.length} {rsvps.length === 1 ? 'response' : 'responses'}
            </span>
            {isClickable && (
              <FontAwesomeIcon
                icon={faChevronDown}
                className="text-[var(--text-primary)] opacity-70 text-sm transition-transform duration-200"
              />
            )}
          </div>
        </div>

        {/* Mobile-First Summary Stats Grid */}
        <div className="grid grid-cols-3 gap-1 sm:gap-3">
          <StatTile
            tone="success"
            icon={faHeart}
            value={totalAttending}
            label={<FormattedMessage id="rsvp-attending" description="Attending" defaultMessage="Attending" />}
          />
          <StatTile
            tone="info"
            icon={faUsers}
            value={totalGuests}
            label={<FormattedMessage id="rsvp-total-guests" description="Total Guests" defaultMessage="Total Guests" />}
          />
          <StatTile
            tone="danger"
            icon={faUser}
            value={totalNotAttending}
            label={<FormattedMessage id="rsvp-not-attending" description="Not Attending" defaultMessage="Not Attending" />}
          />
        </div>

        {/* Age Breakdown for Mobile */}
        {totalAttending > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-primary)] opacity-90 mb-2 font-medium">
              <FormattedMessage
                id="rsvp-age-breakdown"
                description="Age Breakdown"
                defaultMessage="Age Breakdown"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <FontAwesomeIcon icon={faUser} className="text-[var(--text-primary)] opacity-70" />
                <span className="text-[var(--text-primary)]">
                  {adultCount} <FormattedMessage id="rsvp-adults" description="adults" defaultMessage="adults" />
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <FontAwesomeIcon icon={faChild} className="text-[var(--text-primary)] opacity-70" />
                <span className="text-[var(--text-primary)]">
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
    <div className="bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
      {/* Accordion Header */}
      <button
        onClick={() => (onToggle ? onToggle() : setExpanded(!expanded))}
        className="w-full p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 rounded-t-lg"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-primary-deep)] rounded-full flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faUsers} className="text-white text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                <FormattedMessage
                  id="rsvp-responses-title"
                  description="RSVP Responses"
                  defaultMessage="RSVP Responses"
                />
              </h3>
              {eventTitle && (
                <p className="text-xs text-[var(--text-primary)] opacity-90 truncate">{eventTitle}</p>
              )}
              <p className="text-sm text-[var(--text-primary)] opacity-90">
                {rsvps.length} {rsvps.length === 1 ? 'response' : 'responses'} • {totalAttending} attending • {totalGuests} guests
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:inline text-xs bg-[var(--surface-inset)] text-[var(--text-primary)] opacity-90 px-2 py-1 rounded-full">
              {isOpen ? (
                <FormattedMessage
                  id="rsvp-click-to-collapse"
                  description="Click to collapse"
                  defaultMessage="Click to collapse"
                />
              ) : (
                <FormattedMessage
                  id="rsvp-click-to-expand"
                  description="Click to expand"
                  defaultMessage="Click to expand"
                />
              )}
            </span>
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className="text-[var(--text-primary)] opacity-70 text-lg transition-transform duration-200"
            />
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-[var(--border-subtle)]">
          {rsvps.length === 0 ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faUsers} className="text-[var(--text-primary)] opacity-70 text-3xl mb-3" />
              <p className="text-[var(--text-primary)] opacity-90">
                <FormattedMessage
                  id="rsvp-no-responses"
                  description="No RSVP responses yet"
                  defaultMessage="No RSVP responses yet"
                />
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              {/* Headline counts */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <StatTile
                  tone="success"
                  icon={faHeart}
                  value={totalAttending}
                  label={<FormattedMessage id="rsvp-attending" description="Attending" defaultMessage="Attending" />}
                />
                <StatTile
                  tone="info"
                  icon={faUsers}
                  value={totalGuests}
                  label={<FormattedMessage id="rsvp-total-guests" description="Total Guests" defaultMessage="Total Guests" />}
                />
                <StatTile
                  tone="danger"
                  icon={faUser}
                  value={totalNotAttending}
                  label={<FormattedMessage id="rsvp-not-attending" description="Not Attending" defaultMessage="Not Attending" />}
                />
              </div>

              {/* Age breakdown — previously only visible in the collapsed summary */}
              {totalAttending > 0 && (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs px-1">
                  <span className="text-[var(--text-primary)] opacity-90 font-medium">
                    <FormattedMessage
                      id="rsvp-age-breakdown"
                      description="Age Breakdown"
                      defaultMessage="Age Breakdown"
                    />
                  </span>
                  <span className="flex items-center gap-2 text-[var(--text-primary)]">
                    <FontAwesomeIcon icon={faUser} className="opacity-70" />
                    {adultCount} <FormattedMessage id="rsvp-adults" description="adults" defaultMessage="adults" />
                  </span>
                  <span className="flex items-center gap-2 text-[var(--text-primary)]">
                    <FontAwesomeIcon icon={faChild} className="opacity-70" />
                    {childCount} <FormattedMessage id="rsvp-children" description="children" defaultMessage="children" />
                  </span>
                </div>
              )}

              {/* Allergies & dietary — the list that goes to catering */}
              {withAllergies.length > 0 && (
                <AccentPanel
                  tone="warning"
                  icon={faExclamationTriangle}
                  title={
                    <FormattedMessage
                      id="rsvp-allergies-dietary"
                      description="Allergies & Dietary Restrictions"
                      defaultMessage="Allergies & Dietary Restrictions"
                    />
                  }
                >
                  <div className="space-y-2">
                    {withAllergies.map((rsvp) => (
                      <div key={rsvp.id} className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded p-3">
                        <div className="font-medium text-sm text-[var(--text-primary)] mb-1">{rsvp.family_name}</div>
                        {rsvp.kids
                          .filter(kid => kid.allergies && kid.allergies.trim() !== '')
                          .map((kid, index) => (
                            <div key={index} className="text-sm text-[var(--text-primary)] opacity-90">
                              <span className="font-medium">{kid.name}:</span> {kid.allergies}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </AccentPanel>
              )}

              {/* Special requests — one panel (was rendered twice) */}
              {withRequests.length > 0 && (
                <AccentPanel
                  tone="info"
                  icon={faComment}
                  title={
                    <FormattedMessage
                      id="rsvp-all-special-requests"
                      description="All Special Requests"
                      defaultMessage="All Special Requests"
                    />
                  }
                >
                  <div className="space-y-2">
                    {withRequests.map((rsvp) => (
                      <div key={rsvp.id} className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1 sm:gap-0">
                          <div className="font-medium text-sm text-[var(--text-primary)] min-w-0 truncate pr-2">{rsvp.family_name}</div>
                          <StatusPill attending={rsvp.is_attending} />
                        </div>
                        <p className="text-sm text-[var(--text-primary)] opacity-90">{rsvp.message}</p>
                      </div>
                    ))}
                  </div>
                </AccentPanel>
              )}

              {/* One card per family — replaces the old Attending/Not Attending
                  columns and the separate Detailed Responses list. */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  <FormattedMessage
                    id="rsvp-detailed-responses"
                    description="Detailed Responses"
                    defaultMessage="Detailed Responses"
                  />
                </h4>

                {orderedRsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className={`bg-[var(--data-panel)] border border-[var(--border-subtle)] border-l-4 ${
                      rsvp.is_attending ? TONE.success.bar : TONE.danger.bar
                    } rounded-lg p-3 sm:p-4`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                      <div className="min-w-0">
                        <h5 className="font-semibold text-[var(--text-primary)]">{rsvp.family_name}</h5>
                        {/* Contact details stay behind the admin check */}
                        {isAdmin && (rsvp.email || rsvp.phone) && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-[var(--text-primary)] opacity-70 mt-1">
                            {rsvp.email && (
                              <span className="flex items-center gap-2 min-w-0">
                                <FontAwesomeIcon icon={faEnvelope} className="text-xs flex-shrink-0" />
                                <a href={`mailto:${rsvp.email}`} className="hover:text-[var(--color-primary)] transition-colors truncate">
                                  {rsvp.email}
                                </a>
                              </span>
                            )}
                            {rsvp.phone && (
                              <span className="flex items-center gap-2 min-w-0">
                                <FontAwesomeIcon icon={faPhone} className="text-xs flex-shrink-0" />
                                <a href={`tel:${rsvp.phone}`} className="hover:text-[var(--color-primary)] transition-colors truncate">
                                  {rsvp.phone}
                                </a>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <StatusPill attending={rsvp.is_attending} />
                    </div>

                    {rsvp.is_attending && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-[var(--text-primary)]">
                          <FontAwesomeIcon icon={faUsers} className="opacity-60 text-xs" />
                          {guestCount(rsvp)} {guestCount(rsvp) === 1 ? 'guest' : 'guests'}
                        </div>

                        {rsvp.kids && rsvp.kids.length > 0 && (
                          <div>
                            <span className="text-[var(--text-primary)] opacity-70 text-xs">
                              <FormattedMessage
                                id="rsvp-guest-names"
                                description="Guest names:"
                                defaultMessage="Guest names:"
                              />
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rsvp.kids.map((kid, index) => (
                                <span
                                  key={index}
                                  className="bg-transparent border border-[var(--border-subtle)] px-2 py-1 rounded text-xs text-[var(--text-primary)]"
                                >
                                  {kid.name}{kid.age ? ` (${kid.age}y)` : ''}
                                  {/* Kept at --text-primary rather than the warning accent: these
                                      chips sit on --surface-raised, where the warning tone measures
                                      only 4.05-4.20:1. The authoritative, colour-coded allergy list
                                      is the roll-up panel above, which sits on --data-panel. */}
                                  {kid.allergies && kid.allergies.trim() !== '' && (
                                    <span className="ml-1 opacity-80">• {kid.allergies}</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {rsvp.message && rsvp.message.trim() !== '' && (
                      <div className="mt-3 text-sm">
                        <span className="text-[var(--text-primary)] opacity-70 text-xs">
                          <FormattedMessage
                            id="rsvp-special-requests"
                            description="Special requests:"
                            defaultMessage="Special requests:"
                          />
                        </span>
                        <p className="text-[var(--text-primary)] opacity-90 mt-1">{rsvp.message}</p>
                      </div>
                    )}

                    <div className="text-xs text-[var(--text-primary)] opacity-60 mt-3 pt-2 border-t border-[var(--border-subtle)]">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RSVPList;
