import React from "react";
import { defineMessages, useIntl } from "react-intl";
import { ChipGroup } from "../booking/admin/ui";
import { VISIT_MODES, type Availability, type DirectoryFilters, type SortKey } from "../../lib/doctors/directory";
import { m } from "./ui";

// The list's filters (W1 sidebar, N8 sheet on phones)

const msg = defineMessages({
  heading: { id: "doctors-filters-heading", description: "Doctors filters: heading", defaultMessage: "Filters" },
  clear: { id: "doctors-filters-clear", description: "Doctors filters: reset every filter", defaultMessage: "Clear filters" },
  language: { id: "doctors-filters-language", description: "Doctors filters: languages the doctor speaks", defaultMessage: "Language" },
  consultation: { id: "doctors-filters-consultation", description: "Doctors filters: visit mode", defaultMessage: "Consultation" },
  available: { id: "doctors-filters-available", description: "Doctors filters: when the doctor is free", defaultMessage: "Available" },
  today: { id: "doctors-filters-today", description: "Doctors filters: free today", defaultMessage: "Today" },
  week: { id: "doctors-filters-week", description: "Doctors filters: free in the next 7 days", defaultMessage: "This week" },
  any: { id: "doctors-filters-any", description: "Doctors filters: any time", defaultMessage: "Any time" },
  sort: { id: "doctors-filters-sort", description: "Doctors filters: sort order", defaultMessage: "Sort by" },
  sortNext: { id: "doctors-filters-sort-next", description: "Doctors sort: soonest free time first", defaultMessage: "Next available" },
  sortName: { id: "doctors-filters-sort-name", description: "Doctors sort: by name", defaultMessage: "Name" },
});

/** Chips that can each be on or off, e.g. languages */
function ToggleChips<T extends string>({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  values: T[];
  onChange: (values: T[]) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? values.filter((v) => v !== option.value) : [...values, option.value])}
            className={`min-h-[44px] px-3 rounded-full border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] ${
              on
                ? "bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] border-transparent"
                : "border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[var(--text-primary)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export default function FilterPanel({
  filters,
  languages,
  onChange,
  onClear,
  footer,
}: {
  filters: DirectoryFilters;
  /** Every language some doctor speaks */
  languages: string[];
  onChange: (filters: DirectoryFilters) => void;
  onClear: () => void;
  /** e.g. the "Show 3 doctors" button of the phone sheet */
  footer?: React.ReactNode;
}) {
  const intl = useIntl();
  const set = <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => onChange({ ...filters, [key]: value });
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{intl.formatMessage(msg.heading)}</h2>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center min-h-[44px] text-sm font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] rounded"
        >
          {intl.formatMessage(msg.clear)}
        </button>
      </div>

      {languages.length > 0 && (
        <Section title={intl.formatMessage(msg.language)}>
          <ToggleChips
            label={intl.formatMessage(msg.language)}
            options={languages.map((l) => ({ value: l, label: l }))}
            values={filters.languages}
            onChange={(v) => set("languages", v)}
          />
        </Section>
      )}

      <Section title={intl.formatMessage(msg.consultation)}>
        <ToggleChips
          label={intl.formatMessage(msg.consultation)}
          options={VISIT_MODES.map((mode) => ({ value: mode, label: intl.formatMessage(m[mode]) }))}
          values={filters.modes}
          onChange={(v) => set("modes", v)}
        />
      </Section>

      <Section title={intl.formatMessage(msg.available)}>
        <ChipGroup<Availability>
          label={intl.formatMessage(msg.available)}
          options={[
            { value: "today", label: intl.formatMessage(msg.today) },
            { value: "week", label: intl.formatMessage(msg.week) },
            { value: "any", label: intl.formatMessage(msg.any) },
          ]}
          value={filters.availability}
          onChange={(v) => set("availability", v)}
        />
      </Section>

      <Section title={intl.formatMessage(msg.sort)}>
        <ChipGroup<SortKey>
          label={intl.formatMessage(msg.sort)}
          options={[
            { value: "next", label: intl.formatMessage(msg.sortNext) },
            { value: "name", label: intl.formatMessage(msg.sortName) },
          ]}
          value={filters.sort}
          onChange={(v) => set("sort", v)}
        />
      </Section>

      {footer}
    </div>
  );
}
