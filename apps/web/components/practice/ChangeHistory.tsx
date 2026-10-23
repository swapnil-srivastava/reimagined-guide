import React, { useCallback, useEffect, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faDownload } from "@fortawesome/free-solid-svg-icons";

import { supaClient } from "../../supa-client";
import type { Database } from "../../database.types";
import { csvRow } from "../../lib/practice";
import { Button, Notice, Panel } from "../booking/admin/ui";
import { fieldLabel, valueLabel } from "./labels";

// The change history of practice settings or of one doctor, newest first.
// Rows are written by database triggers and can't be edited or deleted.

export type PracticeChange = Database["public"]["Tables"]["practice_changes"]["Row"];

const PAGE = 20;

const m = defineMessages({
  title: { id: "practice-history-title", description: "Change history heading", defaultMessage: "Change history" },
  helpPractice: {
    id: "practice-history-help-practice",
    description: "Change history of practice settings: what it lists",
    defaultMessage: "Every change to practice settings, newest first. Can't be edited or deleted.",
  },
  helpDoctor: {
    id: "practice-history-help-doctor",
    description: "Change history of a doctor: what it lists",
    defaultMessage: "Every change to this doctor's details, newest first.",
  },
  empty: { id: "practice-history-empty", description: "Change history: nothing changed yet", defaultMessage: "No changes yet." },
  someone: { id: "practice-history-someone", description: "Change history: change made by the system or an unknown person", defaultMessage: "System" },
  from: { id: "practice-history-from-to", description: "Change history: screen reader text for old and new value", defaultMessage: "from {old} to {new}" },
  more: { id: "practice-history-more", description: "Change history: load older changes", defaultMessage: "Show older changes" },
  csv: { id: "practice-history-csv", description: "Change history: download all changes as a spreadsheet", defaultMessage: "Download history (CSV)" },
  loadFailed: { id: "practice-history-load-failed", description: "Change history could not be loaded", defaultMessage: "The history couldn't be loaded ({error})." },
  loading: { id: "practice-history-loading", description: "Change history is loading", defaultMessage: "Loading history" },
});

interface Props {
  subject: "practice" | "doctor";
  /** For subject "doctor": whose history */
  hostId?: string;
  /** Changes when a save happened, so the list reloads */
  version: number;
  clinicName: (id: string) => string | undefined;
}

export default function ChangeHistory({ subject, hostId, version, clinicName }: Props) {
  const intl = useIntl();
  const [rows, setRows] = useState<PracticeChange[] | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(() => {
    let q = supaClient.from("practice_changes").select("*").eq("subject", subject);
    if (hostId) q = q.eq("host_id", hostId);
    return q.order("changed_at", { ascending: false });
  }, [subject, hostId]);

  useEffect(() => {
    let live = true;
    query()
      .limit(limit + 1)
      .then(({ data, error: loadError }) => {
        if (!live) return;
        setError(loadError?.message ?? null);
        setRows(data ?? []);
      });
    return () => {
      live = false;
    };
  }, [query, limit, version]);

  const when = (iso: string) =>
    new Date(iso).toLocaleString(intl.locale, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  const value = (row: PracticeChange, v: unknown) => valueLabel(intl, row.field, v, clinicName);

  const download = async () => {
    const { data, error: loadError } = await query().limit(5000);
    if (loadError || !data) {
      setError(loadError?.message ?? "network");
      return;
    }
    const lines = [
      csvRow(["When (UTC)", "Setting", "Old value", "New value", "Changed by", "Reason"]),
      ...data.map((row) =>
        csvRow([row.changed_at, fieldLabel(intl, row.field), value(row, row.old_value), value(row, row.new_value), row.changed_by_name, row.reason]),
      ),
    ];
    const url = URL.createObjectURL(new Blob([`﻿${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject === "practice" ? "practice-settings" : "doctor"}-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shown = (rows ?? []).slice(0, limit);

  return (
    <Panel title={intl.formatMessage(m.title)} description={intl.formatMessage(subject === "practice" ? m.helpPractice : m.helpDoctor)}>
      {error && <Notice tone="danger">{intl.formatMessage(m.loadFailed, { error })}</Notice>}
      {rows === null ? (
        <div className="h-24 rounded-xl bg-[var(--surface-inset)] motion-safe:animate-pulse" role="status">
          <span className="sr-only">{intl.formatMessage(m.loading)}</span>
        </div>
      ) : !rows.length ? (
        <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.empty)}</p>
      ) : (
        <>
          <ol className="flex flex-col gap-3">
            {shown.map((row) => (
              <li key={row.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-3 flex flex-col gap-1.5 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-semibold text-sm">{fieldLabel(intl, row.field)}</p>
                  <time dateTime={row.changed_at} className="text-xs text-[var(--text-muted)] tabular-nums">
                    {when(row.changed_at)}
                  </time>
                </div>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="sr-only">{intl.formatMessage(m.from, { old: value(row, row.old_value), new: value(row, row.new_value) })}</span>
                  <span aria-hidden="true" className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-muted)] line-through decoration-1 break-all">
                    {value(row, row.old_value)}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-[var(--text-muted)]" aria-hidden="true" />
                  <span aria-hidden="true" className="rounded-full border border-[var(--status-info)] text-[var(--status-info)] px-2 py-0.5 font-semibold break-all">
                    {value(row, row.new_value)}
                  </span>
                </p>
                <p className="text-xs text-[var(--text-muted)] break-words">
                  {row.changed_by_name || intl.formatMessage(m.someone)}
                  {row.reason && <> · “{row.reason}”</>}
                </p>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2 mt-3">
            {rows.length > limit && <Button onClick={() => setLimit(limit + PAGE)}>{intl.formatMessage(m.more)}</Button>}
            <Button variant="ghost" onClick={download}>
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" aria-hidden="true" />
              {intl.formatMessage(m.csv)}
            </Button>
          </div>
        </>
      )}
    </Panel>
  );
}
