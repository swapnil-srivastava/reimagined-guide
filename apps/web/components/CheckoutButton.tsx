'use client';

import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import axios from "axios";
import { useIntl } from 'react-intl';

// supabase instance in the app
import { supaClient } from "../supa-client";

const CheckoutButton = ({ priceId, text = "Let\'s get started" }) => {
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

        const { data: axiosData, status } = await axios.post(
            "/api/checkout",
            { priceId: priceId, userId: data.user?.id, email: data.user?.email },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          
        await stripe?.redirectToCheckout({ sessionId: axiosData.id });
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