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
    
        console.log("called the supabase");

        const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

        const stripe = await stripePromise;

        console.log("called the stripe");

        const { data, status } = await axios.post(
            "/api/checkout",
            { priceId: 'price_1Pe47VRomQdDoc7IzPHbnYkn', userId: supabaseData.user?.id, email: supabaseData.user?.email },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

        console.log("data ===> stripe", data);
    
        await stripe?.redirectToCheckout({ sessionId: data.id });

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