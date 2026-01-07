'use client';

import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import axios from "axios";
import { useIntl } from 'react-intl';

// supabase instance in the app
import { supaClient } from "../supa-client";

// Types
import { OrderType } from '../types/stripe';

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
}: CheckoutButtonProps) => {
  const intl = useIntl();

  const handleCheckout = async() => {
    const { data } = await supaClient.auth.getUser();

    if (!data?.user) {
      toast.error(intl.formatMessage({
        id: "checkoutbutton-login-required",
        description: "Please log in to create a new Stripe Checkout session",
        defaultMessage: "Please log in to create a new Stripe Checkout session"
      }));
      return;
    }

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    const stripe = await stripePromise;

    try {
      // Build checkout payload based on whether we have a priceId or dynamic price
      const checkoutPayload: Record<string, unknown> = {
        userId: data.user?.id,
        email: data.user?.email,
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
    }
  }

  return (
    <>
      <button
        type="button"
        className="w-full sm:w-auto bg-hit-pink-500 text-blog-black
        rounded-lg px-4 py-2 m-2
        transition-filter duration-500 hover:filter hover:brightness-125 
        focus:outline-none focus:ring-2 
        focus:ring-fun-blue-400 
        focus:ring-offset-2
        dark:text-blog-black"
        onClick={() => handleCheckout()}
      >
        {text}
      </button>
    </>
  );
};

export default CheckoutButton;