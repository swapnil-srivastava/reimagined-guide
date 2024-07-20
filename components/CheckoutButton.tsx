'use client';

import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import axios from "axios";

// supabase instance in the app
import { supaClient } from "../supa-client";

const CheckoutButton = ({  }) => {
    const handleCheckout = async() => {
        const { data: supabaseData } = await supaClient.auth.getUser();
    
        if (!supabaseData?.user) {
          toast.error("Please log in to create a new Stripe Checkout session");
          return;
        }
    
        const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

        const stripe = await stripePromise;

        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ priceId: 'prod_QV4GghJgMy0rNG', userId: supabaseData.user?.id, email: supabaseData.user?.email }),
          });

        const { data, status } = await axios.post(
            "/api/checkout",
            { priceId: 'prod_QV4GghJgMy0rNG', userId: supabaseData.user?.id, email: supabaseData.user?.email },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

        console.log("data ===> stripe", data);
        
        const session = await response.json();

        await stripe?.redirectToCheckout({ sessionId: session.id });

      }


    return (
      <>
        <button
            type="button"
            className="bg-hit-pink-500 text-blog-black
            rounded-lg px-4 py-2 m-2
            transition-filter duration-500 hover:filter hover:brightness-125 
            focus:outline-none focus:ring-2 
            focus:ring-fun-blue-400 
            focus:ring-offset-2
            dark:text-blog-black"
            onClick={() => handleCheckout()}
        >
            {"Let\'s get started"}
        </button>
      </>
    );
  };
  
  export default CheckoutButton;