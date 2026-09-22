import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl, IntlShape } from 'react-intl';
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
  faComment,
  faClock
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

/** Two-letter monogram so a long list can be scanned by shape, not just by text. */
const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase() || '?';

/** Locale-aware "3 days ago" without adding message ids — Intl already knows the words. */
const relativeTime = (intl: IntlShape, iso: string) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const seconds = Math.round((then - Date.now()) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secondsPerUnit] of units) {
    if (Math.abs(seconds) >= secondsPerUnit) {
      return intl.formatRelativeTime(Math.round(seconds / secondsPerUnit), unit);
    }
  }
  return intl.formatRelativeTime(seconds, 'second');
};

/** A contact detail rendered as a tappable pill — a real 32px+ target on mobile,
    where the old inline text was a hairline-thin link. */
const ContactChip: React.FC<{ href: string; icon: typeof faEnvelope; label: string }> = ({ href, icon, label }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 max-w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs text-[var(--text-primary)] opacity-80 transition-all duration-200 hover:opacity-100 hover:border-[var(--accent)] hover:text-[var(--accent)]"
  >
    <FontAwesomeIcon icon={icon} className="text-[0.65rem] flex-shrink-0" />
    <span className="truncate">{label}</span>
  </a>
);

/** One family's response. The status colour drives the rail, the monogram and the
    header wash from a single `--accent` custom property, so attending and declined
    cards read apart at a glance without duplicating class strings. */
const ResponseCard: React.FC<{ rsvp: RSVP; isAdmin: boolean; intl: IntlShape }> = ({ rsvp, isAdmin, intl }) => {
  const kids = rsvp.kids || [];
  const guests = kids.length + 1;
  const accent = rsvp.is_attending ? 'var(--status-success)' : 'var(--status-danger)';
  const responded = new Date(rsvp.created_at);
  // The year is dropped for this year's responses — with the body indented past
  // the monogram there is no room for it at 390px, and it is the least useful
  // part of the stamp. The full value stays in the row's title attribute.
  const absolute = responded.toLocaleDateString('en-US', {
    year: responded.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const absoluteFull = responded.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const relative = relativeTime(intl, rsvp.created_at);

  return (
    <article
      style={{ ['--accent' as any]: accent }}
      className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--data-panel)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--accent)]"
    >
      {/* Status rail */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: 'var(--accent)' }} />

      {/* Header: monogram, name, at-a-glance counts, status.
          No accent wash behind this row. A tint that is barely visible on a light
          panel lifts the luminance of a dark one sharply, so the same 12% mix read
          as a green smear across the blue-dark theme. The rail, the monogram and
          the pill already carry the status three times over. */}
      <header className="flex items-center justify-between gap-3 pl-4 sm:pl-5 pr-3 sm:pr-4 pt-3 sm:pt-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden
            className="flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: 'color-mix(in srgb, var(--accent) 16%, var(--surface-raised))',
              color: 'var(--accent)',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent)',
            }}
          >
            {initialsOf(rsvp.family_name)}
          </div>
          <div className="min-w-0">
            <h5 className="font-semibold text-[var(--text-primary)] leading-tight truncate">{rsvp.family_name}</h5>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-primary)] opacity-70">
              {rsvp.is_attending && (
                <>
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUsers} className="text-[0.65rem]" />
                    {guests} {guests === 1 ? 'guest' : 'guests'}
                  </span>
                  {kids.length > 0 && (
                    <>
                      <span aria-hidden className="opacity-50">•</span>
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faChild} className="text-[0.65rem]" />
                        {kids.length}{' '}
                        {kids.length === 1 ? (
                          <FormattedMessage id="rsvp-child" description="child" defaultMessage="child" />
                        ) : (
                          <FormattedMessage id="rsvp-children" description="children" defaultMessage="children" />
                        )}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <StatusPill attending={rsvp.is_attending} />
      </header>

      {/* Body indented to the monogram's right edge so the name, the contact chips,
          the guest list and the footer share one left edge. The indent is the
          header's own padding plus avatar plus gap: 16+36+12=64px on mobile,
          20+44+12=76px from sm up. */}
      <div className="pl-16 sm:pl-[4.75rem] pr-3 sm:pr-4 pt-3 pb-3 sm:pb-4 space-y-3">
        {/* Contact details stay behind the admin check */}
        {isAdmin && (rsvp.email || rsvp.phone) && (
          <div className="flex flex-wrap gap-2">
            {rsvp.email && <ContactChip href={`mailto:${rsvp.email}`} icon={faEnvelope} label={rsvp.email} />}
            {rsvp.phone && <ContactChip href={`tel:${rsvp.phone}`} icon={faPhone} label={rsvp.phone} />}
          </div>
        )}

        {rsvp.is_attending && kids.length > 0 && (
          <div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-primary)] opacity-50">
              <FormattedMessage id="rsvp-guest-names" description="Guest names:" defaultMessage="Guest names:" />
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {kids.map((kid, index) => {
                const allergy = kid.allergies?.trim();
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] py-1 pl-2 pr-2 text-xs text-[var(--text-primary)]"
                  >
                    <FontAwesomeIcon icon={faChild} className="text-[0.65rem] opacity-50" />
                    <span className="font-medium">{kid.name}</span>
                    {kid.age && (
                      <span className="rounded bg-[var(--surface-inset)] px-1.5 py-0.5 text-[0.65rem] font-semibold opacity-70">
                        {kid.age}y
                      </span>
                    )}
                    {/* The warning tone is used for the icon only: these chips sit on
                        --surface-raised, where it measures 4.05-4.20:1 — fine for a
                        glyph, short of AA for text. The authoritative, colour-coded
                        allergy list is the roll-up panel above, on --data-panel. */}
                    {allergy && (
                      <span className="flex items-center gap-1 border-l border-[var(--border-subtle)] pl-1.5 opacity-80">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-[0.6rem] text-[var(--status-warning)]" />
                        {allergy}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {rsvp.message && rsvp.message.trim() !== '' && (
          <div className="rounded-lg border-l-2 border-[var(--status-info)] bg-[var(--surface-raised)] px-3 py-2">
            <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-primary)] opacity-50">
              <FontAwesomeIcon icon={faComment} className="text-[0.6rem]" />
              <FormattedMessage id="rsvp-special-requests" description="Special requests:" defaultMessage="Special requests:" />
            </span>
            <p className="mt-1 text-sm text-[var(--text-primary)] opacity-90">{rsvp.message}</p>
          </div>
        )}

        <div
          className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2 text-xs text-[var(--text-primary)] opacity-60"
          title={absoluteFull}
        >
          <FontAwesomeIcon icon={faClock} className="text-[0.65rem]" />
          <span className="truncate">
            <FormattedMessage
              id="rsvp-responded-on"
              description="Responded on {date}"
              defaultMessage="Responded on {date}"
              values={{ date: absolute }}
            />
          </span>
          {relative && (
            <span className="ml-auto flex-shrink-0 rounded-full bg-[var(--surface-inset)] px-2 py-0.5 text-[0.65rem] capitalize">
              {relative}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

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
                  <ResponseCard key={rsvp.id} rsvp={rsvp} isAdmin={isAdmin} intl={intl} />
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
