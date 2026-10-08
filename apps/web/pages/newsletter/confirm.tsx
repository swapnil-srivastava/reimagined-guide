import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FormattedMessage, useIntl } from "react-intl";
import type { NextPage } from "next";
import NewsletterStatusPage from "../../components/NewsletterStatusPage";

type Status = "working" | "confirmed" | "invalid" | "error";

// Opened from the confirmation email. The confirmation happens here, in the
// browser, so link scanners that only fetch the URL don't confirm for the reader.
const ConfirmSubscription: NextPage = () => {
  const intl = useIntl();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("working");
  const sent = useRef(false);

  useEffect(() => {
    if (!router.isReady || sent.current) return;
    sent.current = true;
    const token = typeof router.query.token === "string" ? router.query.token : "";

    fetch("/api/newsletter/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (data?.status === "confirmed") setStatus("confirmed");
        else if (data?.status === "invalid") setStatus("invalid");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [router.isReady, router.query.token]);

  const title =
    status === "confirmed"
      ? intl.formatMessage({ id: "newsletter-confirmed-title", description: "Subscription confirmed heading", defaultMessage: "You're subscribed!" })
      : intl.formatMessage({ id: "newsletter-confirm-title", description: "Confirm subscription heading", defaultMessage: "Confirm subscription" });

  return (
    <NewsletterStatusPage title={title}>
      <p className="opacity-80" role="status">
        {status === "working" && (
          <FormattedMessage id="newsletter-confirm-working" description="Confirming in progress" defaultMessage="Confirming your subscription…" />
        )}
        {status === "confirmed" && (
          <FormattedMessage
            id="newsletter-confirmed-body"
            description="Subscription confirmed message"
            defaultMessage="Thanks for confirming. Weekly tech insights will arrive in your inbox, and every email has an unsubscribe link."
          />
        )}
        {status === "invalid" && (
          <FormattedMessage
            id="newsletter-confirm-invalid"
            description="Confirmation link not valid"
            defaultMessage="This confirmation link has expired or was replaced by a newer one. Sign up again on the links page to get a fresh link."
          />
        )}
        {status === "error" && (
          <FormattedMessage
            id="newsletter-confirm-error"
            description="Confirmation failed"
            defaultMessage="Something went wrong. Please open the link from your email again."
          />
        )}
      </p>
    </NewsletterStatusPage>
  );
};

export default ConfirmSubscription;
