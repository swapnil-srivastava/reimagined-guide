import React, { useEffect, useState } from "react";
import Link from "next/link";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faSliders, faUserDoctor } from "@fortawesome/free-solid-svg-icons";
import { supaClient } from "../supa-client";
import { doctorState, todayInIndia } from "../lib/practice";

const m = defineMessages({
  title: { id: "admin-doctors-card-title", description: "Admin doctors card heading", defaultMessage: "Doctors" },
  summary: {
    id: "admin-doctors-card-summary",
    description: "Admin doctors card: how many doctors can be booked, wait for a registration check, or have a lapsed registration",
    defaultMessage:
      "{active, plural, one {# active} other {# active}} · {pending, plural, =0 {none waiting for a check} other {# waiting for a check}}{expired, plural, =0 {} one { · # registration expired} other { · # registrations expired}}",
  },
  loadFailed: { id: "admin-doctors-card-load-failed", description: "Admin doctors card: doctors could not be loaded", defaultMessage: "Couldn't load doctors." },
  open: { id: "admin-doctors-card-open", description: "Admin doctors card: open the doctors page", defaultMessage: "Manage doctors" },
  settings: { id: "admin-doctors-card-settings", description: "Admin doctors card: open practice settings", defaultMessage: "Practice settings" },
});

const linkClass =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]";

/** Doctor counts with links to /admin/doctors and /admin/practice. Admins only. */
export default function AdminDoctorsCard() {
  const intl = useIntl();
  const [isAdmin, setIsAdmin] = useState(false);
  const [counts, setCounts] = useState<{ active: number; pending: number; expired: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    supaClient.rpc("is_admin").then(async ({ data }) => {
      if (data !== true) return;
      setIsAdmin(true);
      const { data: doctors, error } = await supaClient
        .from("booking_hosts")
        .select("active, registration_number, registration_council, registration_verified_at, registration_valid_until")
        .eq("kind", "doctor");
      if (error) {
        // The practice admin migration hasn't been run yet
        console.error("Loading doctors failed", error);
        setFailed(true);
        return;
      }
      const today = todayInIndia();
      const states = (doctors ?? []).map((d) => doctorState(d, today));
      setCounts({
        active: states.filter((s) => s === "active").length,
        pending: states.filter((s) => s === "pending").length,
        expired: states.filter((s) => s === "expired").length,
      });
    });
  }, []);

  if (!isAdmin) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" aria-labelledby="admin-doctors-heading">
      <div className="rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
            <FontAwesomeIcon icon={faUserDoctor} className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="admin-doctors-heading" className="text-xl font-bold">
              {intl.formatMessage(m.title)}
            </h2>
            <p className="text-sm opacity-80">{counts ? intl.formatMessage(m.summary, counts) : failed ? intl.formatMessage(m.loadFailed) : " "}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/admin/practice"
            className={`${linkClass} border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]`}
          >
            <FontAwesomeIcon icon={faSliders} className="w-3.5 h-3.5" aria-hidden="true" />
            {intl.formatMessage(m.settings)}
          </Link>
          <Link
            href="/admin/doctors"
            className={`${linkClass} bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:bg-[var(--color-primary-deeper)]`}
          >
            {intl.formatMessage(m.open)}
            <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
