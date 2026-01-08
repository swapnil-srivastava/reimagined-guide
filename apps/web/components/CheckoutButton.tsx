'use client';

import { useState, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import axios from "axios";
import { useIntl, FormattedMessage } from 'react-intl';
import HCaptcha from '@hcaptcha/react-hcaptcha';

// supabase instance in the app
import { supaClient } from "../supa-client";

// Types
import { OrderType } from '../types/stripe';

// Anonymous auth utility
import { isUserAnonymous } from '../lib/use-anonymous-auth';

// Components
import HCaptchaWidget from './HCaptchaWidget';

// Initialize Stripe outside component to avoid recreating it on every render
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface CheckoutButtonProps {
  // Existing props - for pre-created Stripe prices
  priceId?: string;
  text?: string;
  
  // New props - for dynamic service package checkout
  price?: number;
  name?: string;
  description?: string;
  currency?: string;
  order_type?: OrderType;
  package_id?: string;
  
  // Allow anonymous checkout (will auto sign-in anonymously if needed)
  allowAnonymous?: boolean;
}

const CheckoutButton = ({ 
  priceId, 
  text = "Let's get started",
  price,
  name,
  description,
  currency = 'EUR',
  order_type = 'service_package',
  package_id,
  allowAnonymous = true, // Enable anonymous checkout by default for service_package
}: CheckoutButtonProps) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

  const handleCheckout = async() => {
    // Check if user is logged in first
    let { data } = await supaClient.auth.getUser();
    
    // If no user and anonymous checkout is allowed, show captcha first if not verified
    if (!data?.user && allowAnonymous && !captchaToken) {
      setShowCaptcha(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // If no user and anonymous checkout is allowed, sign in anonymously with captcha
      if (!data?.user && allowAnonymous) {
        const { data: anonData, error: anonError } = await supaClient.auth.signInAnonymously({
          options: captchaToken ? { captchaToken } : undefined
        });
        
        if (anonError) {
          console.error("Anonymous sign-in error:", anonError);
          toast.error(intl.formatMessage({
            id: "checkoutbutton-anonymous-signin-failed",
            description: "Failed to create anonymous session",
            defaultMessage: "Failed to start checkout. Please try again or sign in."
          }));
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
      
      // Track if user is anonymous for order metadata
      const isAnonymous = isUserAnonymous(data.user);

      // Check if Stripe is properly initialized
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

      // Build checkout payload based on whether we have a priceId or dynamic price
      const checkoutPayload: Record<string, unknown> = {
        userId: data.user?.id,
        email: data.user?.email,
        is_anonymous: isAnonymous,
      };

      if (priceId) {
        // Use pre-created Stripe price (existing behavior)
        checkoutPayload.priceId = priceId;
        // Service packages using priceId should still be marked as service_package
        checkoutPayload.order_type = order_type;
        if (name) checkoutPayload.package_name = name;
        if (description) checkoutPayload.package_description = description;
        if (package_id) checkoutPayload.package_id = package_id;
      } else if (price && name) {
        // Use dynamic price data (new behavior for service packages)
        checkoutPayload.price = price;
        checkoutPayload.name = name;
        checkoutPayload.currency = currency;
        checkoutPayload.order_type = order_type;
        checkoutPayload.package_name = name;
        if (description) checkoutPayload.package_description = description;
        if (package_id) checkoutPayload.package_id = package_id;
      } else {
        toast.error(intl.formatMessage({
          id: "checkoutbutton-invalid-config",
          description: "Invalid checkout configuration",
          defaultMessage: "Invalid checkout configuration. Please contact support."
        }));
        setIsLoading(false);
        return;
      }

      const { data: axiosData, status } = await axios.post(
        "/api/checkout",
        checkoutPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
        
      await stripe?.redirectToCheckout({ sessionId: axiosData.id });
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(intl.formatMessage({
        id: "checkoutbutton-error",
        description: "An error occurred during checkout",
        defaultMessage: "An error occurred during checkout. Please try again."
      }));
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
              handleCheckout();
            }}
            onExpire={() => setCaptchaToken(null)}
            size="compact"
          />
        </div>
      )}
      
      <button
        type="button"
        disabled={isLoading}
        className="w-full sm:w-auto bg-hit-pink-500 text-blog-black
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