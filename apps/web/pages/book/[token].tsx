import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarCheck,
  faCalendarPlus,
  faCalendarXmark,
  faCircleCheck,
  faLinkSlash,
  faHourglassEnd,
} from "@fortawesome/free-solid-svg-icons";

import Metatags from "../../components/Metatags";
import { Button, Notice, inputClass } from "../../components/booking/admin/ui";
import MonthCalendar from "../../components/booking/book/MonthCalendar";
import TimeList from "../../components/booking/book/TimeList";
import TimeZoneSelect from "../../components/booking/book/TimeZoneSelect";
import CallSummary, { HostAvatar } from "../../components/booking/book/CallSummary";
import { bookingApi, browserZone, PublicBooking, PublicContext, Slot } from "../../components/booking/book/api";
import { durationLabel, longDayLabel, rangeLabel } from "../../lib/booking/format";
import { googleCalendarUrl, outlookCalendarUrl } from "../../lib/booking/calendarLinks";

// e.g. localhost:3000/book/<token>
// The buyer books, moves or cancels their call here. The only way in is the
// link in their order confirmation email; the token in it is the key, so
// the page never sends it on to other sites (no referrer, not indexed).

const m = defineMessages({
  pageTitle: { id: "book-page-title", description: "Booking page: browser title", defaultMessage: "Book your call" },
  pick: { id: "book-pick-heading", description: "Booking: heading above the calendar", defaultMessage: "Select a date and time" },
  pickReschedule: { id: "book-pick-reschedule-heading", description: "Booking: heading when moving a call", defaultMessage: "Pick a new time" },
  noTimesMonth: {
    id: "book-no-times-month",
    description: "Booking: the shown month has no free times",
    defaultMessage: "No free times this month. Try the next one.",
  },
  noTimesAtAll: {
    id: "book-no-times-at-all",
    description: "Booking: no free times in the whole booking window",
    defaultMessage: "There are no free times right now. Please reply to your order email and we'll find a time together.",
  },
  pickDay: { id: "book-pick-day", description: "Booking: hint before a day is chosen", defaultMessage: "Pick a day to see the times." },
  host: { id: "book-host-picker", description: "Booking: choose who the call is with", defaultMessage: "Who would you like to meet?" },
  details: { id: "book-details-heading", description: "Booking: heading of the details form", defaultMessage: "Your details" },
  back: { id: "book-back", description: "Booking: back to the calendar", defaultMessage: "Back" },
  name: { id: "book-field-name", description: "Booking form: name", defaultMessage: "Name" },
  email: { id: "book-field-email", description: "Booking form: email", defaultMessage: "Email" },
  emailHint: { id: "book-field-email-hint", description: "Booking form: what the email is for", defaultMessage: "The invite and any changes go here." },
  notes: { id: "book-field-notes", description: "Booking form: notes", defaultMessage: "Anything that helps me prepare? (optional)" },
  confirm: { id: "book-confirm", description: "Booking form: book the call", defaultMessage: "Book the call" },
  confirmMove: { id: "book-confirm-move", description: "Booking: confirm moving the call", defaultMessage: "Confirm new time" },
  moveFrom: { id: "book-move-from", description: "Booking: the old time when moving", defaultMessage: "Was" },
  moveTo: { id: "book-move-to", description: "Booking: the new time when moving", defaultMessage: "New time" },
  booked: { id: "book-done-booked", description: "Booking: done heading", defaultMessage: "You're booked" },
  moved: { id: "book-done-moved", description: "Booking: done heading after moving", defaultMessage: "Your call is rescheduled" },
  sentTo: {
    id: "book-done-sent",
    description: "Booking: where the invite was sent",
    defaultMessage: "A calendar invite is on its way to {email}.",
  },
  upcoming: { id: "book-manage-heading", description: "Booking: heading of an upcoming call", defaultMessage: "Your upcoming call" },
  addGoogle: { id: "book-add-google", description: "Booking: add to Google Calendar", defaultMessage: "Google Calendar" },
  addOutlook: { id: "book-add-outlook", description: "Booking: add to Outlook", defaultMessage: "Outlook" },
  addTo: { id: "book-add-to", description: "Booking: label above add-to-calendar buttons", defaultMessage: "Add to calendar" },
  reschedule: { id: "book-reschedule", description: "Booking: move the call", defaultMessage: "Reschedule" },
  cancel: { id: "book-cancel", description: "Booking: cancel the call", defaultMessage: "Cancel call" },
  tooLate: {
    id: "book-too-late",
    description: "Booking: too close to the call to change it here",
    defaultMessage: "The call is less than {cutoff} away, so it can't be changed here. Reply to your confirmation email if something came up.",
  },
  changeUntil: {
    id: "book-change-until",
    description: "Booking: how long the buyer can change the call",
    defaultMessage: "You can reschedule or cancel up to {cutoff} before the call.",
  },
  bookAnother: { id: "book-another", description: "Booking: book one more call on the same link", defaultMessage: "Book another call" },
  cancelHeading: { id: "book-cancel-heading", description: "Booking: cancel confirm heading", defaultMessage: "Cancel this call?" },
  cancelReason: { id: "book-cancel-reason", description: "Booking: optional reason for cancelling", defaultMessage: "Reason (optional)" },
  cancelConfirm: { id: "book-cancel-confirm", description: "Booking: confirm cancelling", defaultMessage: "Yes, cancel it" },
  keep: { id: "book-cancel-keep", description: "Booking: keep the call", defaultMessage: "Keep it" },
  cancelled: { id: "book-cancelled-heading", description: "Booking: call cancelled heading", defaultMessage: "Your call is cancelled" },
  cancelledText: {
    id: "book-cancelled-text",
    description: "Booking: after cancelling",
    defaultMessage: "We've let {name} know. You can pick a new time with this link whenever you like.",
  },
  pickNew: { id: "book-pick-new", description: "Booking: pick a new time after cancelling", defaultMessage: "Pick a new time" },
  notFound: { id: "book-not-found", description: "Booking: unknown link heading", defaultMessage: "This link doesn't work" },
  notFoundText: {
    id: "book-not-found-text",
    description: "Booking: unknown link",
    defaultMessage: "Check that you opened the whole link from your order email. If it still doesn't work, reply to that email.",
  },
  revoked: { id: "book-revoked", description: "Booking: link turned off heading", defaultMessage: "This link is no longer active" },
  revokedText: { id: "book-revoked-text", description: "Booking: link turned off", defaultMessage: "Reply to your order email if you think this is a mistake." },
  expired: { id: "book-expired", description: "Booking: link expired heading", defaultMessage: "This link has expired" },
  expiredText: {
    id: "book-expired-text",
    description: "Booking: link expired",
    defaultMessage: "Booking links are valid for 6 months after purchase. Reply to your order email and we'll sort it out.",
  },
  usedUp: { id: "book-used-up", description: "Booking: every call booked heading", defaultMessage: "Your call is already booked" },
  usedUpText: {
    id: "book-used-up-text",
    description: "Booking: every call booked",
    defaultMessage: "Every call on this link has been booked. Reply to your order email if you need anything.",
  },
  unavailable: { id: "book-unavailable", description: "Booking: call not offered heading", defaultMessage: "Booking is paused" },
  unavailableText: {
    id: "book-unavailable-text",
    description: "Booking: call not offered at the moment",
    defaultMessage: "Booking this call is paused for now. Reply to your order email and we'll find a time together.",
  },
  loadFailed: { id: "book-load-failed", description: "Booking: page failed to load", defaultMessage: "This page didn't load" },
  loadFailedText: {
    id: "book-load-failed-text",
    description: "Booking: page failed to load, what to do",
    defaultMessage: "Check your connection and try again. If it keeps happening, reply to your order email.",
  },
  retry: { id: "book-retry", description: "Booking: try loading again", defaultMessage: "Try again" },
  errTaken: { id: "book-error-taken", description: "Booking error: time taken", defaultMessage: "Sorry, that time was just taken. Please pick another." },
  errUsedUp: { id: "book-error-used-up", description: "Booking error: no calls left", defaultMessage: "Every call on this link is already booked." },
  errLink: { id: "book-error-link", description: "Booking error: link no longer valid", defaultMessage: "This link is no longer valid." },
  errTooLate: { id: "book-error-too-late", description: "Booking error: too late to change", defaultMessage: "It's too close to the call to change it here." },
  errNotActive: { id: "book-error-not-active", description: "Booking error: booking already changed", defaultMessage: "This call was already changed or cancelled." },
  errEmail: { id: "book-error-email", description: "Booking error: bad email", defaultMessage: "Please enter a valid email address." },
  errName: { id: "book-error-name", description: "Booking error: bad name", defaultMessage: "Please enter your name." },
  errSame: { id: "book-error-same", description: "Booking error: same time chosen", defaultMessage: "That's the time you already have." },
  errServer: { id: "book-error-server", description: "Booking error: anything else", defaultMessage: "Something went wrong. Please try again." },
  errNetwork: { id: "book-error-network", description: "Booking error: no connection", defaultMessage: "You seem to be offline. Check your connection and try again." },
  booking: { id: "book-saving-book", description: "Booking: while booking", defaultMessage: "Booking…" },
  rescheduling: { id: "book-saving-reschedule", description: "Booking: while rescheduling", defaultMessage: "Rescheduling…" },
  cancelling: { id: "book-saving-cancel", description: "Booking: while cancelling", defaultMessage: "Cancelling…" },
  loading: { id: "book-loading", description: "Booking: page is loading (screen readers)", defaultMessage: "Loading your booking…" },
  loadingTimes: { id: "book-loading-times", description: "Booking: free times are loading (screen readers)", defaultMessage: "Loading free times…" },
  timesOnDay: {
    id: "book-times-on-day",
    description: "Booking: how many times the chosen day has (screen readers)",
    defaultMessage: "{count, plural, one {# time} other {# times}} on {day}",
  },
  newTab: { id: "book-new-tab", description: "Booking: link opens in a new tab (screen readers)", defaultMessage: "(opens in a new tab)" },
  eventDetails: {
    id: "book-event-details",
    description: "Booking: text of the calendar event added from the page",
    defaultMessage: "{type} with {host}. To reschedule or cancel, use the link in your confirmation email.",
  },
});

type View = "pick" | "details" | "done" | "manage" | "cancel" | "cancelled";
type Closed = "not_found" | "revoked" | "expired" | "used_up" | "unavailable" | "failed";

const ERRORS: Record<string, keyof typeof m> = {
  taken: "errTaken",
  used_up: "errUsedUp",
  invalid_link: "errLink",
  too_late: "errTooLate",
  not_active: "errNotActive",
  bad_email: "errEmail",
  bad_name: "errName",
  same_time: "errSame",
  network: "errNetwork",
};

// Errors shown next to the field they are about
const FIELD_ERRORS: Record<string, "name" | "email"> = { bad_name: "name", bad_email: "email" };

const EMPTY = new Set<string>();

/** "smooth", unless the buyer asked for less motion */
const smooth = (): ScrollBehavior =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const card = "rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xl";

const BookPage: NextPage = () => {
  const intl = useIntl();
  const router = useRouter();
  const token = typeof router.query.token === "string" ? router.query.token : "";

  const [ctx, setCtx] = useState<PublicContext | null>(null);
  const [loadError, setLoadError] = useState<"not_found" | "failed" | null>(null);
  const [zone, setZone] = useState("UTC");
  const [hostId, setHostId] = useState("");
  const [view, setView] = useState<View>("pick");
  const [moving, setMoving] = useState<PublicBooking | null>(null);
  const [focus, setFocus] = useState<PublicBooking | null>(null);

  const [month, setMonth] = useState<DateTime | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsKey, setSlotsKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const autoAdvanced = useRef(false);
  const timesRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const firstView = useRef(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<{ field: "name" | "email"; text: string } | null>(null);

  const errorText = (code: string) => intl.formatMessage(m[ERRORS[code] ?? "errServer"]);

  const load = useCallback(async () => {
    if (!token) return null;
    const res = await bookingApi<PublicContext>(token, "");
    if (!res.ok) {
      setLoadError(res.status === 404 ? "not_found" : "failed");
      return null;
    }
    setLoadError(null);
    setCtx(res.data);
    return res.data;
  }, [token]);

  // First load: pick the starting view
  useEffect(() => {
    setZone(browserZone());
    if (!router.isReady) return;
    load().then((data) => {
      if (!data) return;
      setHostId(data.default_host_id);
      setName(data.prefill.name);
      setEmail(data.prefill.email);
      const next = upcoming(data)[0];
      if (next) {
        setFocus(next);
        setView("manage");
      }
    });
  }, [router.isReady, load]);

  // Hosts listed only because the buyer has a call with them can't be picked
  const bookableHosts = ctx?.hosts.filter((h) => h.bookable) ?? [];
  const host = bookableHosts.find((h) => h.id === hostId) ?? bookableHosts[0];
  const now = DateTime.now().setZone(zone);
  const minMonth = now.startOf("month");
  const maxMonth = now.plus({ days: ctx?.type.max_days_ahead ?? 60 }).startOf("month");
  const shownMonth = month && month.zone.name === zone ? month : minMonth;

  // Which request the slots in state answer, so nothing acts on stale ones
  const requestKey = `${host?.id}|${shownMonth.toISODate()}|${zone}|${moving?.id ?? ""}|${slotsKey}`;

  // Free times of the shown month, in the buyer's zone
  useEffect(() => {
    if (!ctx || !host || view !== "pick" || !token) return;
    let stale = false;
    const from = DateTime.max(shownMonth.startOf("month"), DateTime.now());
    const to = shownMonth.endOf("month").plus({ milliseconds: 1 });
    setSlotsLoading(true);
    const params = new URLSearchParams({ host: host.id, from: from.toUTC().toISO()!, to: to.toUTC().toISO()! });
    if (moving) params.set("exclude", moving.id);
    const key = requestKey;
    bookingApi<{ slots: Slot[] }>(token, `/slots?${params.toString()}`).then((res) => {
      if (stale) return;
      setSlotsLoading(false);
      setLoadedKey(key);
      if (!res.ok) {
        setSlots([]);
        if (res.status === 410) load();
        else toast.error(errorText(res.error));
        return;
      }
      setSlots(res.data.slots);
    });
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.default_host_id, host?.id, shownMonth.toISODate(), zone, view, moving?.id, slotsKey, token]);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const key = DateTime.fromISO(slot.start).setZone(zone).toISODate()!;
      map.set(key, [...(map.get(key) ?? []), slot]);
    }
    return map;
  }, [slots, zone]);
  const available = useMemo(() => new Set(byDay.keys()), [byDay]);
  // Slots in state may answer an older request (month, zone or host changed)
  const fresh = loadedKey === requestKey;

  // Move focus to the new heading when the view changes, so keyboard and
  // screen reader users land on what just appeared
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    const heading = mainRef.current?.querySelector("h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, [view]);

  // Jump to the next month once if this one is already full, and open the
  // first free day so the times show without an extra tap
  useEffect(() => {
    if (slotsLoading || view !== "pick" || loadedKey !== requestKey) return;
    if (!slots.length && !autoAdvanced.current && shownMonth < maxMonth && +shownMonth === +minMonth) {
      autoAdvanced.current = true;
      setMonth(shownMonth.plus({ months: 1 }));
      return;
    }
    if (!day || !available.has(day)) {
      const first = Array.from(available).sort()[0] ?? null;
      setDay(first);
      setChosen(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsLoading, slots, view, loadedKey]);

  const changeMonth = (delta: number) => {
    setMonth(shownMonth.plus({ months: delta }));
    setDay(null);
    setChosen(null);
    setNotice(null);
  };

  const selectDay = (iso: string) => {
    setDay(iso);
    setChosen(null);
    setNotice(null);
    // On phones the times are under the calendar
    if (window.matchMedia("(max-width: 767px)").matches) {
      setTimeout(() => timesRef.current?.scrollIntoView({ behavior: smooth(), block: "start" }), 50);
    }
  };

  const startPicking = (booking: PublicBooking | null) => {
    setMoving(booking);
    if (booking) setHostId(booking.host_id);
    setMonth(null);
    setDay(null);
    setChosen(null);
    setNotice(null);
    autoAdvanced.current = false;
    setView("pick");
    window.scrollTo({ top: 0, behavior: smooth() });
  };

  const chosenSlot = slots.find((s) => s.start === chosen) ?? null;

  // The chosen time is gone (zone or month changed): back to the calendar
  useEffect(() => {
    if (view === "details" && !chosenSlot) setView("pick");
  }, [view, chosenSlot]);

  const handleConflict = (code: string) => {
    const field = FIELD_ERRORS[code];
    if (field && view === "details") {
      setFieldError({ field, text: errorText(code) });
      document.getElementById(`book-${field}`)?.focus();
      return;
    }
    if (code === "taken") {
      setNotice(errorText(code));
      setChosen(null);
      setSlotsKey((k) => k + 1);
      setView("pick");
    } else {
      toast.error(errorText(code));
      if (["used_up", "invalid_link", "not_active", "too_late"].includes(code)) {
        load().then((data) => {
          const next = data && upcoming(data)[0];
          if (next) {
            setFocus(next);
            setView("manage");
          } else setView("pick");
        });
      }
    }
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenSlot || !host || saving) return;
    setFieldError(null);
    setSaving(true);
    const res = moving
      ? await bookingApi<{ booking: PublicBooking }>(token, "/reschedule", {
          bookingId: moving.id,
          hostId: host.id,
          start: chosenSlot.start,
          timezone: zone,
        })
      : await bookingApi<{ booking: PublicBooking }>(token, "/book", {
          hostId: host.id,
          start: chosenSlot.start,
          name: name.trim(),
          email: email.trim(),
          notes: notes.trim(),
          timezone: zone,
        });
    setSaving(false);
    if (!res.ok) return handleConflict(res.error);
    setFocus(res.data.booking);
    setView("done");
    window.scrollTo({ top: 0, behavior: smooth() });
    load();
  };

  const submitCancel = async () => {
    if (!focus || saving) return;
    setSaving(true);
    const res = await bookingApi<{ booking: PublicBooking }>(token, "/cancel", { bookingId: focus.id, reason: reason.trim() || null });
    setSaving(false);
    if (!res.ok) return handleConflict(res.error);
    setFocus(res.data.booking);
    setReason("");
    setView("cancelled");
    load();
  };

  // ---------- Closed states ----------
  let closed: Closed | null = null;
  if (loadError) closed = loadError;
  else if (ctx && view === "pick" && !moving) {
    if (ctx.state === "revoked") closed = "revoked";
    else if (ctx.state === "expired") closed = "expired";
    else if (ctx.remaining <= 0) closed = "used_up";
    else if (!ctx.type.active || !ctx.hosts.some((h) => h.bookable)) closed = "unavailable";
  }

  const shell = (children: React.ReactNode) => (
    <>
      <Metatags title={intl.formatMessage(m.pageTitle)} />
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <div className="booking-ui font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {/* Room at the bottom on phones for the floating cookie and privacy buttons */}
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-28 sm:py-12">{children}</div>
      </div>
    </>
  );

  if (closed) {
    const content: Record<Closed, { icon: typeof faLinkSlash; title: keyof typeof m; text: keyof typeof m }> = {
      not_found: { icon: faLinkSlash, title: "notFound", text: "notFoundText" },
      revoked: { icon: faLinkSlash, title: "revoked", text: "revokedText" },
      expired: { icon: faHourglassEnd, title: "expired", text: "expiredText" },
      used_up: { icon: faCalendarCheck, title: "usedUp", text: "usedUpText" },
      unavailable: { icon: faCalendarXmark, title: "unavailable", text: "unavailableText" },
      failed: { icon: faCalendarXmark, title: "loadFailed", text: "loadFailedText" },
    };
    const c = content[closed];
    return shell(
      <div className={`${card} max-w-lg mx-auto p-8 text-center flex flex-col items-center gap-4`}>
        <FontAwesomeIcon icon={c.icon} className="text-4xl text-[var(--text-muted)]" />
        <h1 className="text-xl font-bold">{intl.formatMessage(m[c.title])}</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{intl.formatMessage(m[c.text])}</p>
        {closed === "failed" && (
          <Button variant="accent" onClick={() => load()}>
            {intl.formatMessage(m.retry)}
          </Button>
        )}
      </div>
    );
  }

  if (!ctx) {
    return shell(
      <div className={`${card} p-6 sm:p-8 motion-safe:animate-pulse lg:grid lg:grid-cols-[19rem_1fr] gap-8`} aria-busy>
        <p className="sr-only" role="status">
          {intl.formatMessage(m.loading)}
        </p>
        <div className="flex flex-col gap-3 mb-6 lg:mb-0">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-inset)]" />
          <div className="h-6 w-2/3 rounded bg-[var(--surface-inset)]" />
          <div className="h-4 w-1/3 rounded bg-[var(--surface-inset)]" />
        </div>
        <div className="h-80 rounded-xl bg-[var(--surface-inset)]" />
      </div>
    );
  }

  const cutoff = durationLabel(ctx.type.cancel_cutoff_minutes);
  const summaryBooking = view === "done" || view === "manage" || view === "cancel" || view === "cancelled" ? focus : null;
  const summaryHost = summaryBooking ? ctx.hosts.find((h) => h.id === summaryBooking.host_id) ?? host : host;

  // ---------- Right-hand side, per view ----------
  let main: React.ReactNode = null;

  if (view === "pick") {
    const dayTimes = day ? byDay.get(day) ?? [] : [];
    const dayHeading = day ? longDayLabel(DateTime.fromISO(day, { zone }).setLocale(intl.locale)) : null;
    const nothingAtAll = !slotsLoading && !slots.length && +shownMonth >= +maxMonth;
    main = (
      <div className="flex flex-col gap-5">
        {moving && (
          <button type="button" onClick={() => setView("manage")} className="self-start text-sm font-semibold text-[var(--accent-ink)] inline-flex items-center gap-2 min-h-[44px]">
            <FontAwesomeIcon icon={faArrowLeft} /> {intl.formatMessage(m.back)}
          </button>
        )}
        <h2 className="text-xl font-bold">{intl.formatMessage(moving ? m.pickReschedule : m.pick)}</h2>
        {notice && <Notice tone="warning">{notice}</Notice>}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_13.5rem]">
          <div className="flex flex-col gap-5">
            <MonthCalendar
              month={shownMonth}
              available={fresh ? available : EMPTY}
              selected={day}
              loading={slotsLoading || !fresh}
              canPrev={+shownMonth > +minMonth}
              canNext={+shownMonth < +maxMonth}
              onPrev={() => changeMonth(-1)}
              onNext={() => changeMonth(1)}
              onSelect={selectDay}
            />
            {!slotsLoading && fresh && !slots.length && (
              <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(nothingAtAll ? m.noTimesAtAll : m.noTimesMonth)}</p>
            )}
            <TimeZoneSelect
              value={zone}
              onChange={(z) => {
                setZone(z);
                setMonth(null);
                setDay(null);
                setChosen(null);
              }}
            />
          </div>
          <div ref={timesRef} className="scroll-mt-4">
            {day && fresh ? (
              <>
                <h3 className="text-base font-semibold mb-3">{dayHeading}</h3>
                <div className="md:max-h-[26rem] md:overflow-y-auto md:pr-1">
                  <TimeList slots={dayTimes} zone={zone} chosen={chosen} onChoose={setChosen} onNext={() => setView("details")} />
                </div>
              </>
            ) : (
              !slotsLoading && fresh && slots.length > 0 && <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.pickDay)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "details" && chosenSlot) {
    const s = DateTime.fromISO(chosenSlot.start).setZone(zone).setLocale(intl.locale);
    const e = DateTime.fromISO(chosenSlot.end).setZone(zone).setLocale(intl.locale);
    main = (
      <form onSubmit={submitBooking} className="flex flex-col gap-5 max-w-md">
        <button type="button" onClick={() => setView("pick")} className="self-start text-sm font-semibold text-[var(--accent-ink)] inline-flex items-center gap-2 min-h-[44px]">
          <FontAwesomeIcon icon={faArrowLeft} /> {intl.formatMessage(m.back)}
        </button>
        <h2 className="text-xl font-bold">{intl.formatMessage(moving ? m.pickReschedule : m.details)}</h2>
        {moving ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-[var(--text-muted)]">{intl.formatMessage(m.moveFrom)}</dt>
            <dd className="line-through text-[var(--text-muted)]">{bookingLabel(moving, zone, intl.locale)}</dd>
            <dt className="text-[var(--text-muted)]">{intl.formatMessage(m.moveTo)}</dt>
            <dd className="font-semibold">
              {rangeLabel(s, e)}, {longDayLabel(s)}
            </dd>
          </dl>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="book-name" className="text-sm font-semibold">{intl.formatMessage(m.name)}</label>
              <input
                id="book-name"
                name="name"
                className={inputClass}
                value={name}
                onChange={(ev) => {
                  setName(ev.target.value);
                  if (fieldError?.field === "name") setFieldError(null);
                }}
                required
                maxLength={100}
                autoComplete="name"
                aria-invalid={fieldError?.field === "name" || undefined}
                aria-describedby={fieldError?.field === "name" ? "book-name-error" : undefined}
              />
              {fieldError?.field === "name" && (
                <p id="book-name-error" className="text-xs font-semibold text-[var(--status-danger)]">
                  {fieldError.text}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="book-email" className="text-sm font-semibold">{intl.formatMessage(m.email)}</label>
              <input
                id="book-email"
                name="email"
                type="email"
                className={inputClass}
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  if (fieldError?.field === "email") setFieldError(null);
                }}
                required
                maxLength={254}
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                aria-invalid={fieldError?.field === "email" || undefined}
                aria-describedby={fieldError?.field === "email" ? "book-email-error book-email-hint" : "book-email-hint"}
              />
              {fieldError?.field === "email" && (
                <p id="book-email-error" className="text-xs font-semibold text-[var(--status-danger)]">
                  {fieldError.text}
                </p>
              )}
              <p id="book-email-hint" className="text-xs text-[var(--text-muted)]">{intl.formatMessage(m.emailHint)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="book-notes" className="text-sm font-semibold">{intl.formatMessage(m.notes)}</label>
              <textarea id="book-notes" name="notes" className={`${inputClass} min-h-[110px]`} value={notes} onChange={(ev) => setNotes(ev.target.value)} maxLength={1000} />
            </div>
          </>
        )}
        <Button type="submit" variant="accent" disabled={saving} className="w-full sm:w-auto sm:self-start px-8">
          {intl.formatMessage(saving ? (moving ? m.rescheduling : m.booking) : moving ? m.confirmMove : m.confirm)}
        </Button>
        {!moving && <p className="text-xs text-[var(--text-muted)]">{intl.formatMessage(m.changeUntil, { cutoff })}</p>}
      </form>
    );
  }

  if ((view === "done" || view === "manage") && focus) {
    const done = view === "done";
    // Not the page URL: the token in it is the key to this booking, and these
    // links hand the text to Google or Microsoft
    const details = intl.formatMessage(m.eventDetails, { type: ctx.type.name, host: summaryHost?.name ?? "" });
    const event = { title: `${ctx.type.name}: ${summaryHost?.name ?? ""}`, start: focus.starts_at, end: focus.ends_at, details };
    main = (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={done ? faCircleCheck : faCalendarCheck} className="text-3xl text-[var(--status-success)] mt-0.5" />
          <div>
            <h2 className="text-xl font-bold">{intl.formatMessage(done ? (focus.rescheduled ? m.moved : m.booked) : m.upcoming)}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">{bookingLabel(focus, zone, intl.locale)}</p>
          </div>
        </div>
        {done && <p className="text-sm">{intl.formatMessage(m.sentTo, { email: focus.invitee_email })}</p>}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{intl.formatMessage(m.addTo)}</p>
          <div className="flex flex-wrap gap-2">
            <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={linkButton}>
              <FontAwesomeIcon icon={faCalendarPlus} aria-hidden /> {intl.formatMessage(m.addGoogle)}
              <span className="sr-only"> {intl.formatMessage(m.newTab)}</span>
            </a>
            <a href={outlookCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={linkButton}>
              <FontAwesomeIcon icon={faCalendarPlus} aria-hidden /> {intl.formatMessage(m.addOutlook)}
              <span className="sr-only"> {intl.formatMessage(m.newTab)}</span>
            </a>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-5 flex flex-col gap-3">
          {focus.can_change ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Button variant="accent" onClick={() => startPicking(focus)}>
                  {intl.formatMessage(m.reschedule)}
                </Button>
                <Button variant="ghost" onClick={() => setView("cancel")}>
                  {intl.formatMessage(m.cancel)}
                </Button>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{intl.formatMessage(m.changeUntil, { cutoff })}</p>
            </>
          ) : (
            <Notice tone="info">{intl.formatMessage(m.tooLate, { cutoff })}</Notice>
          )}
          {ctx.state === "ok" && ctx.remaining > 0 && (
            <Button variant="secondary" className="self-start" onClick={() => startPicking(null)}>
              {intl.formatMessage(m.bookAnother)}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (view === "cancel" && focus) {
    main = (
      <div className="flex flex-col gap-5 max-w-md">
        <h2 className="text-xl font-bold">{intl.formatMessage(m.cancelHeading)}</h2>
        <p className="text-sm">{bookingLabel(focus, zone, intl.locale)}</p>
        <div className="flex flex-col gap-1">
          <label htmlFor="book-reason" className="text-sm font-semibold">{intl.formatMessage(m.cancelReason)}</label>
          <textarea id="book-reason" name="reason" className={`${inputClass} min-h-[90px]`} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="danger" disabled={saving} onClick={submitCancel}>
            {intl.formatMessage(saving ? m.cancelling : m.cancelConfirm)}
          </Button>
          <Button variant="ghost" disabled={saving} onClick={() => setView("manage")}>
            {intl.formatMessage(m.keep)}
          </Button>
        </div>
      </div>
    );
  }

  if (view === "cancelled" && focus) {
    const canRebook = ctx.state === "ok" && ctx.remaining > 0;
    main = (
      <div className="flex flex-col gap-4 max-w-md">
        <FontAwesomeIcon icon={faCalendarXmark} className="text-3xl text-[var(--text-muted)] self-start" />
        <h2 className="text-xl font-bold">{intl.formatMessage(m.cancelled)}</h2>
        <p className="text-sm text-[var(--text-muted)] line-through">{bookingLabel(focus, zone, intl.locale)}</p>
        {canRebook && (
          <>
            <p className="text-sm">{intl.formatMessage(m.cancelledText, { name: summaryHost?.name.split(" ")[0] ?? "" })}</p>
            <Button variant="accent" className="self-start" onClick={() => startPicking(null)}>
              {intl.formatMessage(m.pickNew)}
            </Button>
          </>
        )}
      </div>
    );
  }

  const showHostPicker = view === "pick" && !moving && bookableHosts.length > 1;

  // Announced to screen readers: loading, and how many times the day has
  let status = "";
  if (view === "pick") {
    if (slotsLoading || !fresh) status = intl.formatMessage(m.loadingTimes);
    else if (day)
      status = intl.formatMessage(m.timesOnDay, {
        count: byDay.get(day)?.length ?? 0,
        day: longDayLabel(DateTime.fromISO(day, { zone }).setLocale(intl.locale)),
      });
  }

  return shell(
    <div className={`${card} overflow-hidden lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]`}>
      <aside className="p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] flex flex-col gap-6">
        <CallSummary
          ctx={ctx}
          host={summaryHost}
          start={summaryBooking?.starts_at ?? (view === "details" ? chosenSlot?.start : null)}
          end={summaryBooking?.ends_at ?? (view === "details" ? chosenSlot?.end : null)}
          zone={zone}
        />
        {showHostPicker && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold mb-2">{intl.formatMessage(m.host)}</legend>
            {bookableHosts.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-pressed={h.id === host?.id}
                onClick={() => {
                  setHostId(h.id);
                  setMonth(null);
                  setDay(null);
                  setChosen(null);
                  autoAdvanced.current = false;
                }}
                className={`flex items-center gap-3 text-left rounded-xl border p-2 min-h-[56px] transition-colors ${
                  h.id === host?.id
                    ? "border-[var(--accent-ink)] border-2 bg-[color-mix(in_srgb,var(--accent-ink)_10%,transparent)]"
                    : "border-[var(--border-subtle)] hover:bg-[var(--surface-inset)]"
                }`}
              >
                <HostAvatar host={h} size="sm" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{h.name}</span>
                  {h.title && <span className="block text-xs text-[var(--text-muted)] truncate">{h.title}</span>}
                </span>
              </button>
            ))}
          </fieldset>
        )}
      </aside>
      <section ref={mainRef} className="p-5 sm:p-7 min-w-0 [&_h2]:outline-none">
        {main}
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
      </section>
    </div>
  );
};

const linkButton =
  "inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border-subtle)] " +
  "bg-[var(--surface-inset)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,var(--bg-primary))]";

/** Confirmed calls that haven't ended, soonest first */
function upcoming(ctx: PublicContext): PublicBooking[] {
  const now = Date.now();
  return ctx.bookings
    .filter((b) => b.status === "confirmed" && Date.parse(b.ends_at) > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

function bookingLabel(b: PublicBooking, zone: string, locale: string) {
  const s = DateTime.fromISO(b.starts_at).setZone(zone).setLocale(locale);
  const e = DateTime.fromISO(b.ends_at).setZone(zone).setLocale(locale);
  return `${rangeLabel(s, e)}, ${longDayLabel(s)}`;
}

export default BookPage;
