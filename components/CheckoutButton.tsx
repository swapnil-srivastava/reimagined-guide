'use client';

import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import axios from "axios";

// supabase instance in the app
import { supaClient } from "../supa-client";

const CheckoutButton = ({  }) => {
    const handleCheckout = async() => {
        const { data } = await supaClient.auth.getUser();

        if (!data?.user) {
          toast.error("Please log in to create a new Stripe Checkout session");
          return;
        }
    
        const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        const stripe = await stripePromise;
        // const response = await fetch('/api/checkout', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ priceId: 'price_1Pe47VRomQdDoc7IzPHbnYkn', userId: data.user?.id, email: data.user?.email }),
        //   });
        // const session = await response.json();
        // await stripe?.redirectToCheckout({ sessionId: session.id });

        const { data: axiosData, status } = await axios.post(
            "/api/checkout",
            { priceId: 'price_1Pe47VRomQdDoc7IzPHbnYkn', userId: data.user?.id, email: data.user?.email },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        console.log("data ===> stripe", axiosData);
        await stripe?.redirectToCheckout({ sessionId: axiosData.id });


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