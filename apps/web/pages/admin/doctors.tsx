import React, { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faSliders, faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import AuthCheck from "../../components/AuthCheck";
import Metatags from "../../components/Metatags";
import AdminGate, { ListSkeleton, NotAdmin } from "../../components/admin/AdminGate";
import { Button, ChipGroup, Field, Notice, Panel, Pill, inputClass } from "../../components/booking/admin/ui";
import DoctorEditor, { STATE_TONE, useStateLabel } from "../../components/practice/DoctorEditor";
import ChangeHistory from "../../components/practice/ChangeHistory";
import { modeLabel } from "../../components/practice/labels";
import { supaClient } from "../../supa-client";
import type { BookingHost, Clinic } from "../../lib/booking/types";
import type { Database } from "../../database.types";
import { doctorState, slugify, todayInIndia, type DoctorState } from "../../lib/practice";

// e.g. localhost:3000/admin/doctors?id=<host id>
// The practice's doctors (Figma A2) with the editor for one (A3). On a phone
// the list and the editor are separate screens; ?id= picks the doctor.
// Patients only see a doctor once their registration is checked and an admin
// activates them.

type Settings = Database["public"]["Tables"]["practice_settings"]["Row"];
type Filter = "all" | "active" | "pending" | "inactive";

const m = defineMessages({
  title: { id: "admin-doctors-title", description: "Admin doctors page heading", defaultMessage: "Doctors" },
  back: { id: "admin-doctors-back", description: "Link back to the admin page", defaultMessage: "Admin" },
  backToList: { id: "admin-doctors-back-to-list", description: "Phone: back from a doctor to the list", defaultMessage: "All doctors" },
  settings: { id: "admin-doctors-settings", description: "Link to practice settings", defaultMessage: "Practice settings" },
  count: { id: "admin-doctors-count", description: "Doctors list heading with count", defaultMessage: "Doctors ({count})" },
  bookable: {
    id: "admin-doctors-bookable",
    description: "How many doctors patients can book",
    defaultMessage: "{count, plural, =0 {Nobody can be booked yet} one {# can be booked} other {# can be booked}}",
  },
  filter: { id: "admin-doctors-filter", description: "Label of the doctor filter chips", defaultMessage: "Show" },
  all: { id: "admin-doctors-filter-all", description: "Filter: every doctor", defaultMessage: "All" },
  active: { id: "admin-doctors-filter-active", description: "Filter: bookable doctors", defaultMessage: "Active" },
  pending: { id: "admin-doctors-filter-pending", description: "Filter: registration not checked", defaultMessage: "Pending" },
  inactive: { id: "admin-doctors-filter-inactive", description: "Filter: switched-off doctors", defaultMessage: "Inactive" },
  none: { id: "admin-doctors-none", description: "No doctor matches the filter", defaultMessage: "No doctors here." },
  noQualification: { id: "admin-doctors-no-qualification", description: "Doctor without qualifications yet", defaultMessage: "Qualifications not added" },
  reg: { id: "admin-doctors-reg", description: "Registration number and council", defaultMessage: "Reg. {number} · {council}" },
  noReg: { id: "admin-doctors-no-reg", description: "Doctor without a registration yet", defaultMessage: "Registration not added" },
  add: { id: "admin-doctors-add", description: "Button: add a doctor", defaultMessage: "Add doctor" },
  addName: { id: "admin-doctors-add-name", description: "Field: new doctor's full name", defaultMessage: "Full name of the new doctor" },
  addHint: {
    id: "admin-doctors-add-hint",
    description: "What happens when adding a doctor",
    defaultMessage: "They start inactive. Add their registration and check it before activating.",
  },
  addConfirm: { id: "admin-doctors-add-confirm", description: "Button: create the doctor", defaultMessage: "Add" },
  cancel: { id: "admin-doctors-add-cancel", description: "Button: don't add a doctor", defaultMessage: "Cancel" },
  added: { id: "admin-doctors-added", description: "Toast after adding a doctor", defaultMessage: "{name} added" },
  addFailed: { id: "admin-doctors-add-failed", description: "Toast when adding fails", defaultMessage: "Couldn't add the doctor: {error}" },
  badName: { id: "admin-doctors-bad-name", description: "Error: name has no letters", defaultMessage: "Enter the doctor's name." },
  pick: { id: "admin-doctors-pick", description: "Desktop: no doctor selected", defaultMessage: "Pick a doctor to see and edit their details." },
  notFound: { id: "admin-doctors-not-found", description: "Doctor in the link doesn't exist", defaultMessage: "This doctor wasn't found." },
  loadFailed: {
    id: "admin-doctors-load-failed",
    description: "Doctors could not be loaded",
    defaultMessage: "Doctors couldn't be loaded ({error}). The practice admin migration may not have been run yet.",
  },
});

const AdminDoctors: NextPage = () => {
  const intl = useIntl();
  return (
    <>
      <Metatags title={intl.formatMessage(m.title)} />
      <div className="booking-ui font-poppins [&_button]:font-poppins [&_input]:font-poppins [&_select]:font-poppins min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AuthCheck>
            <AdminGate loading={<ListSkeleton />} denied={<NotAdmin />}>
              <DoctorsAdmin />
            </AdminGate>
          </AuthCheck>
        </div>
      </div>
    </>
  );
};

function DoctorsAdmin() {
  const intl = useIntl();
  const router = useRouter();
  const stateLabel = useStateLabel();
  const [doctors, setDoctors] = useState<BookingHost[] | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const today = todayInIndia();

  const selectedId = typeof router.query.id === "string" ? router.query.id : null;
  const select = (id: string | null) =>
    router.push({ pathname: router.pathname, query: id ? { id } : {} }, undefined, { shallow: true, scroll: false });

  const load = useCallback(async () => {
    const [hosts, clinicRows, settingsRow] = await Promise.all([
      supaClient.from("booking_hosts").select("*").eq("kind", "doctor").order("name"),
      supaClient.from("clinics").select("*").order("name"),
      supaClient.from("practice_settings").select("*").maybeSingle(),
    ]);
    const failed = [hosts, clinicRows, settingsRow].find((r) => r.error);
    setLoadError(failed?.error?.message ?? null);
    setDoctors(hosts.data ?? []);
    setClinics(clinicRows.data ?? []);
    setSettings(settingsRow.data ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError && !doctors?.length) return <Notice tone="danger">{intl.formatMessage(m.loadFailed, { error: loadError })}</Notice>;
  if (!doctors) return <ListSkeleton />;

  const states = new Map(doctors.map((d) => [d.id, doctorState(d, today)]));
  const matches = (state: DoctorState) =>
    filter === "all" ||
    (filter === "active" && state === "active") ||
    (filter === "pending" && (state === "pending" || state === "expired")) ||
    (filter === "inactive" && state !== "active");
  const shown = doctors.filter((d) => matches(states.get(d.id) as DoctorState));
  const selected = doctors.find((d) => d.id === selectedId) ?? null;
  const bookable = doctors.filter((d) => states.get(d.id) === "active").length;
  const clinicName = (id: string) => clinics.find((c) => c.id === id)?.name;

  const onSaved = (doctor: BookingHost) => {
    setDoctors(doctors.map((d) => (d.id === doctor.id ? doctor : d)));
    setHistoryVersion((v) => v + 1);
  };

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: intl.formatMessage(m.all) },
    { value: "active", label: intl.formatMessage(m.active) },
    { value: "pending", label: intl.formatMessage(m.pending) },
    { value: "inactive", label: intl.formatMessage(m.inactive) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        {selectedId ? (
          <>
            <Link href="/admin" className="hidden lg:inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline w-fit">
              <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
              {intl.formatMessage(m.back)}
            </Link>
            <button
              type="button"
              onClick={() => select(null)}
              className="lg:hidden inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline w-fit min-h-[44px]"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
              {intl.formatMessage(m.backToList)}
            </button>
          </>
        ) : (
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline w-fit">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" aria-hidden="true" />
            {intl.formatMessage(m.back)}
          </Link>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-[var(--color-primary-deep)] text-[var(--text-on-primary)]">
              <FontAwesomeIcon icon={faUserDoctor} className="w-5 h-5" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold">{intl.formatMessage(m.title)}</h1>
          </div>
          <Link
            href="/admin/practice"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg text-sm font-semibold border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-raised)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
          >
            <FontAwesomeIcon icon={faSliders} className="w-3.5 h-3.5" aria-hidden="true" />
            {intl.formatMessage(m.settings)}
          </Link>
        </div>
      </header>

      {loadError && <Notice tone="danger">{intl.formatMessage(m.loadFailed, { error: loadError })}</Notice>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
        <div className={`${selectedId ? "hidden lg:flex" : "flex"} flex-col gap-4 min-w-0`}>
          <Panel
            title={intl.formatMessage(m.count, { count: doctors.length })}
            description={intl.formatMessage(m.bookable, { count: bookable })}
            actions={
              !adding && (
                <Button variant="primary" onClick={() => setAdding(true)}>
                  <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" aria-hidden="true" />
                  {intl.formatMessage(m.add)}
                </Button>
              )
            }
          >
            <div className="flex flex-col gap-4">
              {adding && (
                <AddDoctor
                  existingSlugs={doctors.map((d) => d.slug)}
                  clinicId={clinics[0]?.id ?? null}
                  onCancel={() => setAdding(false)}
                  onAdded={(doctor) => {
                    setAdding(false);
                    setDoctors([...doctors, doctor].sort((a, b) => a.name.localeCompare(b.name)));
                    select(doctor.id);
                  }}
                />
              )}
              <ChipGroup<Filter> label={intl.formatMessage(m.filter)} options={filters} value={filter} onChange={setFilter} />
              {!shown.length ? (
                <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(m.none)}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {shown.map((d) => {
                    const state = states.get(d.id) as DoctorState;
                    const current = d.id === selectedId;
                    return (
                      <li key={d.id}>
                        <Link
                          href={{ pathname: router.pathname, query: { id: d.id } }}
                          shallow
                          scroll={false}
                          aria-current={current ? "page" : undefined}
                          className={`flex flex-wrap gap-x-4 gap-y-2 rounded-xl border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] ${
                            current
                              ? "border-[var(--color-primary)] bg-[var(--surface-inset)]"
                              : "border-[var(--border-subtle)] hover:bg-[var(--surface-inset)]"
                          }`}
                        >
                          <div className="min-w-0 flex-1 basis-48">
                            <p className="font-semibold break-words">{d.name}</p>
                            <p className="text-xs text-[var(--text-muted)] break-words">{d.qualification || intl.formatMessage(m.noQualification)}</p>
                            <p className="text-xs text-[var(--text-muted)] break-words">
                              {d.registration_number && d.registration_council
                                ? intl.formatMessage(m.reg, { number: d.registration_number, council: d.registration_council })
                                : intl.formatMessage(m.noReg)}
                            </p>
                          </div>
                          <div className="flex flex-col items-start gap-1 min-w-0">
                            {d.specialty && <p className="text-sm">{d.specialty}</p>}
                            <p className="text-xs text-[var(--text-muted)]">{d.modes.map((mode) => modeLabel(intl, mode)).join(", ")}</p>
                            <Pill tone={STATE_TONE[state]}>{stateLabel(state)}</Pill>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Panel>
        </div>

        <div className={`${selectedId ? "flex" : "hidden lg:flex"} flex-col gap-6 min-w-0`}>
          {selected ? (
            <>
              <DoctorEditor doctor={selected} clinics={clinics} settings={settings} today={today} onSaved={onSaved} />
              <ChangeHistory key={selected.id} subject="doctor" hostId={selected.id} version={historyVersion} clinicName={clinicName} />
            </>
          ) : (
            <Panel>
              <p className="text-sm text-[var(--text-muted)]">{intl.formatMessage(selectedId ? m.notFound : m.pick)}</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function AddDoctor({
  existingSlugs,
  clinicId,
  onCancel,
  onAdded,
}: {
  existingSlugs: string[];
  clinicId: string | null;
  onCancel: () => void;
  onAdded: (doctor: BookingHost) => void;
}) {
  const intl = useIntl();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const base = slugify(name);
    if (!name.trim() || !base) {
      setError(intl.formatMessage(m.badName));
      return;
    }
    setSaving(true);
    // booking_hosts also holds non-doctors, so ask the database too
    const { data: taken } = await supaClient.from("booking_hosts").select("slug").like("slug", `${base}%`);
    const used = new Set([...existingSlugs, ...(taken ?? []).map((r) => r.slug)]);
    let slug = base;
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;

    const { data, error: insertError } = await supaClient
      .from("booking_hosts")
      .insert({
        name: name.trim(),
        slug,
        kind: "doctor",
        timezone: "Asia/Kolkata",
        active: false,
        // In person needs a clinic; without one the doctor starts online only
        modes: clinicId ? ["in_person"] : ["video"],
        clinic_id: clinicId,
      })
      .select("*")
      .single();
    setSaving(false);
    if (insertError || !data) {
      toast.error(intl.formatMessage(m.addFailed, { error: insertError?.message ?? "network" }));
      return;
    }
    toast.success(intl.formatMessage(m.added, { name: data.name }));
    onAdded(data);
  };

  return (
    <form onSubmit={add} className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-3">
      <Field label={intl.formatMessage(m.addName)} htmlFor="new-doctor-name" hint={intl.formatMessage(m.addHint)}>
        <input
          id="new-doctor-name"
          className={inputClass}
          value={name}
          autoComplete="off"
          maxLength={120}
          autoFocus
          aria-invalid={!!error}
          aria-describedby={error ? "new-doctor-error" : undefined}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
        />
      </Field>
      {error && (
        <p id="new-doctor-error" className="text-sm text-[var(--status-danger)]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={saving}>
          {intl.formatMessage(m.addConfirm)}
        </Button>
        <Button variant="ghost" disabled={saving} onClick={onCancel}>
          {intl.formatMessage(m.cancel)}
        </Button>
      </div>
    </form>
  );
}

export default AdminDoctors;
