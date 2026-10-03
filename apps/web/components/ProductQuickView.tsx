import CurrencyPriceComponent from './CurrencyPriceComponent';
import React from 'react';
import Image from 'next/image';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { useIntl } from 'react-intl';
import { supaClient } from '../supa-client';

interface ProductQuickViewProps {
  isOpen: boolean;
  onRequestClose: () => void;
  product: any;
}

export default function ProductQuickView({ isOpen, onRequestClose, product }: ProductQuickViewProps) {
  const intl = useIntl();
  if (!isOpen || !product) return null;

  const handleBuyNow = async () => {
    try {
      // The server prices the product from the products table; a signed-in
      // buyer is attached from their session token
      const { data: { session } } = await supaClient.auth.getSession();
      const { data } = await axios.post(
        '/api/checkout',
        { items: [{ id: product.id, quantity: 1 }] },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
        }
      );

      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId: data.id });
    } catch (err: any) {
      console.error(err);
      // toast or fallback
      alert(intl.formatMessage({ id: 'checkout-error', defaultMessage: 'Error starting checkout' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6">
      <div className="max-w-3xl w-full bg-white dark:bg-fun-blue-600 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2 h-72 relative">
            <Image
              src={product.image_url ?? '/mountains.jpg'} 
              alt={product.name}
              fill={true}
              className="object-cover rounded-lg"
            />
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            <div className="text-sm text-gray-600 dark:text-blog-white mb-4">{product.description}</div>
            <div className="mb-4">
              <CurrencyPriceComponent price={product.price} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleBuyNow} className="px-4 py-2 rounded-lg bg-fun-blue-600 text-white">Buy now</button>
              <button onClick={onRequestClose} className="px-4 py-2 rounded-lg border">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
