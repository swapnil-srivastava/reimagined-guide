import React, { useId, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faXmark } from "@fortawesome/free-solid-svg-icons";

export interface AppliedPromo {
  code: string;
  /** In euros */
  discount: number;
  /** Order total after the discount, in euros */
  total: number;
}

const m = defineMessages({
  label: { id: "promo-label", description: "Checkout: promo code field label", defaultMessage: "Promo code" },
  apply: { id: "promo-apply", description: "Checkout: apply the promo code", defaultMessage: "Apply" },
  applying: { id: "promo-applying", description: "Checkout: the promo code is being checked", defaultMessage: "Checking…" },
  applied: { id: "promo-applied", description: "Checkout: the promo code was applied", defaultMessage: "{code} applied: you save {amount}." },
  remove: { id: "promo-remove", description: "Checkout: remove the promo code", defaultMessage: "Remove promo code {code}" },
  failed: { id: "promo-failed", description: "Checkout: the promo code could not be checked", defaultMessage: "The promo code couldn't be checked. Please try again." },
});

/**
 * A promo code box for the checkout page. The server checks the code against
 * the cart (/api/promo-code) and checks it again when the order is made.
 */
export default function PromoCodeField({
  applied,
  onApply,
  check,
  disabled,
}: {
  applied: AppliedPromo | null;
  onApply: (promo: AppliedPromo | null) => void;
  /** Asks the server about a code; resolves to the promo or throws with a message */
  check: (code: string) => Promise<AppliedPromo>;
  disabled?: boolean;
}) {
  const intl = useIntl();
  const id = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const euro = (amount: number) => intl.formatNumber(amount, { style: "currency", currency: "EUR" });

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setError(null);
    try {
      onApply(await check(code.trim()));
      setCode("");
    } catch (err: any) {
      setError(err?.message || intl.formatMessage(m.failed));
    } finally {
      setChecking(false);
    }
  };

  if (applied) {
    return (
      <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 py-2 text-sm text-[var(--text-primary)]">
        <span className="flex items-center gap-2 min-w-0">
          <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="break-words">{intl.formatMessage(m.applied, { code: applied.code, amount: euro(applied.discount) })}</span>
        </span>
        <button
          type="button"
          onClick={() => onApply(null)}
          disabled={disabled}
          aria-label={intl.formatMessage(m.remove, { code: applied.code })}
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 -my-2 -mr-2 rounded-lg hover:bg-[var(--surface-raised)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={apply} noValidate className="flex flex-col gap-1">
      <label htmlFor={`${id}-code`} className="text-sm font-medium text-[var(--text-primary)]">
        {intl.formatMessage(m.label)}
      </label>
      <div className="flex gap-2">
        <input
          id={`${id}-code`}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={64}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="font-poppins min-w-0 flex-1 min-h-[44px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 uppercase placeholder:normal-case focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
        />
        <button
          type="submit"
          disabled={disabled || checking || !code.trim()}
          className="font-poppins shrink-0 min-h-[44px] px-4 rounded-lg text-sm font-semibold border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[var(--text-primary)] hover:brightness-95 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
        >
          {intl.formatMessage(checking ? m.applying : m.apply)}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-[var(--status-danger)]">
          {error}
        </p>
      )}
    </form>
  );
}
