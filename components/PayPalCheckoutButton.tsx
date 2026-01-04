import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';
import { useIntl } from 'react-intl';

interface PayPalCheckoutButtonProps {
  totalCost: number;
  tax: number;
  deliveryCost: number;
  cartItems: any[];
  email: string;
  userId: string;
  disabled: boolean;
  onSuccess: () => void;
  currency?: string;
}

const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
  totalCost,
  tax,
  deliveryCost,
  cartItems,
  email,
  userId,
  disabled,
  onSuccess,
  currency = 'EUR',
}) => {
  const intl = useIntl();

  const createOrder = async () => {
    try {
      const response = await fetch('/api/paypal-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          email,
          userId,
          currency,
          tax,
          deliveryCost,
          totalCost,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayPal API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to create PayPal order');
      }

      const { orderId } = await response.json();
      console.log('PayPal order created successfully:', orderId);
      return orderId;
    } catch (error: any) {
      console.error('PayPal create order error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(
        intl.formatMessage({
          id: 'paypal-create-order-error',
          description: 'Error creating PayPal order',
          defaultMessage: 'Failed to create PayPal order: {error}',
        }, { error: error.message })
      );
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await fetch('/api/paypal-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          userId,
          items: cartItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to capture PayPal payment');
      }

      const result = await response.json();
      console.log('PayPal payment successful:', result);

      toast.success(
        intl.formatMessage({
          id: 'paypal-payment-success',
          description: 'PayPal payment successful',
          defaultMessage: 'Payment successful! Your order is being processed.',
        })
      );

      // Call success callback (redirect to success page)
      onSuccess();
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      toast.error(
        intl.formatMessage({
          id: 'paypal-capture-error',
          description: 'Error capturing PayPal payment',
          defaultMessage: 'Failed to process payment: {error}',
        }, { error: error.message })
      );
    }
  };

  const onError = (error: any) => {
    console.error('PayPal error:', error);
    toast.error(
      intl.formatMessage({
        id: 'paypal-error',
        description: 'PayPal error',
        defaultMessage: 'PayPal payment failed. Please try again.',
      })
    );
  };

  const onCancel = () => {
    toast.error(
      intl.formatMessage({
        id: 'paypal-cancelled',
        description: 'PayPal payment cancelled',
        defaultMessage: 'Payment cancelled.',
      })
    );
  };

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    console.error('PayPal client ID is not configured');
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <FormattedMessage
          id="paypal-config-error"
          description="PayPal configuration error"
          defaultMessage="PayPal is not configured. Please contact support."
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalScriptProvider
        options={{
          clientId,
          currency,
          intent: 'capture',
          components: 'buttons',
          'disable-funding': 'credit,card,venmo,paylater',
        }}
      >
        <PayPalButtons
          disabled={disabled}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 55,
            tagline: false,
          }}
          fundingSource={undefined}
          forceReRender={[totalCost, cartItems.length, disabled]}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalCheckoutButton;
