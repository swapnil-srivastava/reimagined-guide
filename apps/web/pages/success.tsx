import React, { useState } from "react";
import Link from 'next/link';
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, 
  faHome, 
  faShoppingBag,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import type { NextPage } from 'next';

// Components
import ConvertAnonymousUser from "../components/ConvertAnonymousUser";

// Hooks
import { useAnonymousAuth } from "../lib/use-anonymous-auth";

const Success: NextPage = () => {
  const { isAnonymous } = useAnonymousAuth();
  const [showConvertPrompt, setShowConvertPrompt] = useState(true);
  
  return (
    <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500 flex items-center justify-center p-4 text-blog-black dark:text-blog-white">
      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-white dark:bg-fun-blue-600 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Animation */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FontAwesomeIcon 
                  icon={faCheckCircle} 
                  className="w-16 h-16 text-white"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              <FormattedMessage
                id="success-payment-complete"
                description="Payment Complete heading"
                defaultMessage="Payment Complete!"
              />
            </h1>
            <p className="text-green-100 text-lg">
              <FormattedMessage
                id="success-thank-you"
                description="Thank you message"
                defaultMessage="Thank you for your purchase"
              />
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Success Message */}
            <div className="text-center mb-8">
              <p className="text-gray-600 dark:text-blog-white text-lg leading-relaxed">
                <FormattedMessage
                  id="success-order-confirmed"
                  description="Order confirmed message"
                  defaultMessage="Your order has been confirmed and is being processed. You will receive a confirmation email shortly."
                />
              </p>
            </div>

            {/* Anonymous User Conversion Prompt */}
            {isAnonymous && showConvertPrompt && (
              <div className="mb-8">
                <ConvertAnonymousUser 
                  onSuccess={() => setShowConvertPrompt(false)}
                  onCancel={() => setShowConvertPrompt(false)}
                  className="border border-hit-pink-200 dark:border-fun-blue-500"
                />
              </div>
            )}

            {/* Email Notice */}
            <div className="bg-blue-50 dark:bg-fun-blue-700 rounded-xl p-4 mb-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-fun-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <FormattedMessage
                  id="success-email-notice"
                  description="Email confirmation notice"
                  defaultMessage="A confirmation email with your order details has been sent to your email address."
                />
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/products" className="block">
                <button className="w-full bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2">
                  <div className="flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faShoppingBag} className="w-5 h-5" />
                    <FormattedMessage
                      id="success-continue-shopping"
                      description="Continue shopping button"
                      defaultMessage="Continue Shopping"
                    />
                  </div>
                </button>
              </Link>

              <Link href="/" className="block">
                <button className="w-full bg-gray-100 dark:bg-fun-blue-700 hover:bg-gray-200 dark:hover:bg-fun-blue-800 text-gray-700 dark:text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2">
                  <div className="flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                    <FormattedMessage
                      id="success-go-home"
                      description="Go home button"
                      defaultMessage="Go to Homepage"
                    />
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-fun-blue-700 px-8 py-4 text-center border-t border-gray-100 dark:border-fun-blue-600">
            <p className="text-sm text-gray-500 dark:text-blog-white">
              <FormattedMessage
                id="success-questions"
                description="Questions contact message"
                defaultMessage="Questions? Contact us at contact@swapnilsrivastava.eu"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Success;