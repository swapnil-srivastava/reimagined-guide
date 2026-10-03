'use client';

import { useState, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import axios from "axios";
import { useIntl, FormattedMessage } from 'react-intl';
import HCaptcha from '@hcaptcha/react-hcaptcha';

// supabase instance in the app
import { supaClient } from "../supa-client";

// Components
import HCaptchaWidget from './HCaptchaWidget';

// Initialize Stripe outside component to avoid recreating it on every render
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface CheckoutButtonProps {
  // A Stripe price listed in SERVICE_PACKAGES (lib/server/pricing.ts), which
  // also holds the package's name and id
  priceId: string;
  text?: string;

  // Allow anonymous checkout (will auto sign-in anonymously if needed)
  allowAnonymous?: boolean;
}

const CheckoutButton = ({ 
  priceId, 
  text = "Let's get started",
  allowAnonymous = true, // Enable anonymous checkout by default for service_package
}: CheckoutButtonProps) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);
  // Blocks a second checkout while the first is still before setIsLoading
  // (e.g. a click right after the captcha's auto-continue)
  const inFlight = useRef(false);

  // The token is passed straight from onVerify: the captchaToken state set
  // there isn't visible to this call until the next render
  const handleCheckout = async(verifiedToken: string | null = captchaToken) => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await runCheckout(verifiedToken);
    } finally {
      inFlight.current = false;
    }
  }

  const runCheckout = async(verifiedToken: string | null) => {
    // Check if user is logged in first
    let { data } = await supaClient.auth.getUser();
    
    // If no user and anonymous checkout is allowed, show captcha first if not verified
    if (!data?.user && allowAnonymous && !verifiedToken) {
      setShowCaptcha(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // If no user and anonymous checkout is allowed, sign in anonymously with captcha
      if (!data?.user && allowAnonymous) {
        const { data: anonData, error: anonError } = await supaClient.auth.signInAnonymously({
          options: verifiedToken ? { captchaToken: verifiedToken } : undefined
        });
        
        if (anonError) {
          console.error("Anonymous sign-in error:", anonError);
          toast.error(intl.formatMessage({
            id: "checkoutbutton-anonymous-signin-failed",
            description: "Failed to create anonymous session",
            defaultMessage: "Failed to start checkout. Please try again or sign in."
          }));
          // hCaptcha tokens are single-use, so ask for a fresh one on retry
          captchaRef.current?.resetCaptcha();
          setCaptchaToken(null);
          setIsLoading(false);
          return;
        }
        
        // Use the newly created anonymous user
        data = { user: anonData.user };
        
        // Reset captcha after successful use
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
        setShowCaptcha(false);
        
        // Show info toast about anonymous checkout
        toast.success(intl.formatMessage({
          id: "checkoutbutton-anonymous-checkout-info",
          description: "Continuing as guest. You can create an account later to track your order.",
          defaultMessage: "Continuing as guest. You can create an account later to track your order."
        }), { duration: 4000 });
      }

      if (!data?.user) {
        toast.error(intl.formatMessage({
          id: "checkoutbutton-login-required",
          description: "Please log in to create a new Stripe Checkout session",
          defaultMessage: "Please log in to complete your purchase"
        }));
        setIsLoading(false);
        return;
      }
      
      // The server prices the package from priceId and reads the buyer from
      // the session token, so only those two go over the wire
      if (!priceId) {
        toast.error(intl.formatMessage({
          id: "checkoutbutton-invalid-config",
          description: "Invalid checkout configuration",
          defaultMessage: "Invalid checkout configuration. Please contact support."
        }));
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supaClient.auth.getSession();

      const { data: axiosData } = await axios.post(
        "/api/checkout",
        { priceId },
        {
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
        }
      );

      // Go straight to the Checkout URL Stripe returns. This needs neither the
      // publishable key nor stripe.redirectToCheckout, which Stripe deprecated.
      if (axiosData.url) {
        window.location.assign(axiosData.url);
        return;
      }

      // Older API responses only carry the session id
      if (!stripePromise) {
        throw new Error(intl.formatMessage({
          id: "checkoutbutton-stripe-not-configured",
          description: "Stripe is not properly configured",
          defaultMessage: "Payment system is not configured. Please contact support."
        }));
      }
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error(intl.formatMessage({
          id: "checkoutbutton-stripe-load-failed",
          description: "Failed to load Stripe",
          defaultMessage: "Failed to load payment system. Please try again."
        }));
      }
      const { error: redirectError } = await stripe.redirectToCheckout({ sessionId: axiosData.id });
      if (redirectError) throw redirectError;
    } catch (error: any) {
      console.error("Checkout error:", error);
      // Say what failed (the API's message, or Stripe's), so a failure can be diagnosed from a phone
      const detail = error?.response?.data?.message || error?.message;
      toast.error(intl.formatMessage({
        id: "checkoutbutton-error",
        description: "An error occurred during checkout",
        defaultMessage: "An error occurred during checkout. Please try again."
      }) + (detail ? ` (${detail})` : ''));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* hCaptcha Widget - shown only when needed for anonymous checkout */}
      {showCaptcha && (
        <div className="w-full flex justify-center">
          <HCaptchaWidget
            ref={captchaRef}
            onVerify={(token) => {
              setCaptchaToken(token);
              // Auto-proceed with checkout after captcha verification
              handleCheckout(token);
            }}
            onExpire={() => setCaptchaToken(null)}
            size="compact"
          />
        </div>
      )}
      
      <button
        type="button"
        disabled={isLoading}
        className="font-poppins w-full sm:w-auto bg-hit-pink-500 text-black
        rounded-lg px-4 py-2 m-2
        transition-filter duration-500 hover:filter hover:brightness-125 
        focus:outline-none focus:ring-2 
        focus:ring-fun-blue-400 
        focus:ring-offset-2
        dark:text-blog-black
        disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handleCheckout()}
      >
        {isLoading ? (
          <FormattedMessage
            id="checkoutbutton-processing"
            description="Processing..."
            defaultMessage="Processing..."
          />
        ) : showCaptcha ? (
          <FormattedMessage
            id="checkoutbutton-verify-captcha"
            description="Verify to continue"
            defaultMessage="Verify to continue"
          />
        ) : (
          text
        )}
      </button>
    </div>
  );
};

export default CheckoutButton;