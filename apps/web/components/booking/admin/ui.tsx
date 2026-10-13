import React from "react";

// Small building blocks shared by the booking admin tabs. Colours come from
// the theme variables in styles/globals.css (Tailwind `dark:` never applies).

export const inputClass =
  "w-full min-h-[44px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] " +
  "text-[var(--text-primary)] px-3 py-2 text-base focus:outline-none focus:ring-2 " +
  "focus:ring-[var(--color-primary)] disabled:opacity-60";

const buttonBase =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold " +
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-[var(--color-primary-deep)] text-[var(--text-on-primary)] hover:bg-[var(--color-primary-deeper)]",
  secondary:
    "border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[var(--text-primary)] " +
    "hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,var(--bg-primary))]",
  danger: "bg-[var(--status-danger-solid)] text-white hover:brightness-110",
  ghost: "text-[var(--text-primary)] hover:bg-[var(--surface-inset)]",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button type="button" className={`${buttonBase} ${variants[variant]} ${className}`} {...props} />;
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-md p-4 sm:p-6 ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {description && <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

const pillTones = {
  success: "text-[var(--status-success)] border-[var(--status-success)]",
  danger: "text-[var(--status-danger)] border-[var(--status-danger)]",
  info: "text-[var(--status-info)] border-[var(--status-info)]",
  warning: "text-[var(--status-warning)] border-[var(--status-warning)]",
  muted: "text-[var(--text-muted)] border-[var(--border-subtle)]",
};

export function Pill({ tone, children }: { tone: keyof typeof pillTones; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${pillTones[tone]}`}>
      {children}
    </span>
  );
}

/** A row of toggle chips, e.g. "15 min / 30 min / 1 h" */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`min-h-[40px] px-3 rounded-full border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
              selected
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

/** Inline message under a form: error, warning or success */
export function Notice({ tone, children }: { tone: "danger" | "warning" | "success" | "info"; children: React.ReactNode }) {
  const colour = {
    danger: "border-[var(--status-danger)]",
    warning: "border-[var(--status-warning)]",
    success: "border-[var(--status-success)]",
    info: "border-[var(--status-info)]",
  }[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`rounded-lg border-l-4 ${colour} bg-[var(--surface-inset)] px-3 py-2 text-sm`}>
      {children}
    </div>
  );
}
