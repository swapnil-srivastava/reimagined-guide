import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { supaClient } from "../../supa-client";

/**
 * Renders its children only for admins (is_admin()); everyone else sees
 * `denied`. Use inside AuthCheck. RLS is what actually protects the data.
 */
export default function AdminGate({ denied, loading, children }: { denied: React.ReactNode; loading: React.ReactNode; children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    supaClient.rpc("is_admin").then(({ data }) => setIsAdmin(data === true));
  }, []);
  if (isAdmin === null) return <>{loading}</>;
  return <>{isAdmin ? children : denied}</>;
}

/** The shared "only admins" message */
export function NotAdmin() {
  const intl = useIntl();
  return (
    <p className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-6">
      {intl.formatMessage({ id: "admin-gate-not-admin", description: "Shown to non-admins on admin pages", defaultMessage: "Only admins can see this page." })}
    </p>
  );
}

/** Placeholder rows while an admin list loads */
export function ListSkeleton() {
  const intl = useIntl();
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <p role="status" className="sr-only">
        {intl.formatMessage({ id: "admin-loading", description: "Admin pages: screen reader text while loading", defaultMessage: "Loading…" })}
      </p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] h-16 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
