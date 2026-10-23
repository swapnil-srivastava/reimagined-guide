import React from "react";
import { Field, inputClass } from "../booking/admin/ui";

// Form pieces shared by the practice admin pages

export function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-sm text-[var(--status-danger)] -mt-2">
      {children}
    </p>
  );
}

export function FeeInput({
  id,
  label,
  value,
  error,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <Field label={label} htmlFor={id}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true">
            ₹
          </span>
          <input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            className={`${inputClass} pl-7 tabular-nums`}
            value={value}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </Field>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

/** A checkbox with its label beside it, at least 44px tall */
export function Checkbox({
  checked,
  describedBy,
  onChange,
  children,
}: {
  checked: boolean;
  describedBy?: string;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 text-sm min-h-[44px] cursor-pointer">
      <input
        type="checkbox"
        className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--color-primary-deep)]"
        checked={checked}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}
