import React, { useState } from "react";
import { useRouter } from "next/router";
import { FormattedMessage, useIntl } from "react-intl";
import type { NextPage } from "next";
import NewsletterStatusPage from "../../components/NewsletterStatusPage";

type Status = "idle" | "working" | "unsubscribed" | "invalid" | "error";

// Opened from the unsubscribe link in a newsletter. Asks for one click, so a
// link scanner opening the URL doesn't unsubscribe the reader.
const Unsubscribe: NextPage = () => {
  const intl = useIntl();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");

  const unsubscribe = async () => {
    const token = typeof router.query.token === "string" ? router.query.token : "";
    setStatus("working");
    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json().catch(() => ({}));
      if (data?.status === "unsubscribed") setStatus("unsubscribed");
      else if (data?.status === "invalid") setStatus("invalid");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const title =
    status === "unsubscribed"
      ? intl.formatMessage({ id: "newsletter-unsubscribed-title", description: "Unsubscribed heading", defaultMessage: "You're unsubscribed" })
      : intl.formatMessage({ id: "newsletter-unsubscribe-title", description: "Unsubscribe heading", defaultMessage: "Unsubscribe" });

  return (
    <NewsletterStatusPage title={title}>
      {status === "unsubscribed" ? (
        <p className="opacity-80" role="status">
          <FormattedMessage
            id="newsletter-unsubscribed-body"
            description="Unsubscribed message"
            defaultMessage="You won't get any more newsletter emails. You can sign up again any time on the links page."
          />
        </p>
      ) : (
        <>
          <p className="opacity-80">
            <FormattedMessage
              id="newsletter-unsubscribe-body"
              description="Unsubscribe explanation"
              defaultMessage="Stop receiving the weekly tech insights newsletter?"
            />
          </p>
          <button
            type="button"
            onClick={unsubscribe}
            disabled={status === "working" || !router.isReady}
            className="rounded-lg px-6 py-3 text-sm font-semibold border-2 border-current disabled:opacity-50"
          >
            {status === "working" ? (
              <FormattedMessage id="newsletter-unsubscribe-working" description="Unsubscribing in progress" defaultMessage="Unsubscribing…" />
            ) : (
              <FormattedMessage id="newsletter-unsubscribe-button" description="Unsubscribe button" defaultMessage="Unsubscribe" />
            )}
          </button>
          {status === "invalid" && (
            <p role="alert" className="text-sm text-red-600">
              <FormattedMessage id="newsletter-unsubscribe-invalid" description="Unsubscribe link not valid" defaultMessage="This unsubscribe link isn't valid. Please use the link from your most recent email." />
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="text-sm text-red-600">
              <FormattedMessage id="newsletter-unsubscribe-error" description="Unsubscribe failed" defaultMessage="Something went wrong. Please try again." />
            </p>
          )}
        </>
      )}
    </NewsletterStatusPage>
  );
};

export default Unsubscribe;
