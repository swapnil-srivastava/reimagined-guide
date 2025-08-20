import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft,
  faShoppingBag,
  faMapMarkerAlt,
  faTruck,
  faReceipt,
  faLock,
  faCreditCard,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";

// Redux
import { useDispatch, useSelector } from "react-redux";

// Interfaces
import { RootState } from "../../lib/interfaces/interface";
import { PRODUCT } from "../../database.types";

// Components
import AuthCheck from "../../components/AuthCheck";
import CurrencyPriceComponent from "../../components/CurrencyPriceComponent";

// Supabase
import { supaClient } from "../../supa-client";

// Actions
import { addToCartAddressCreate } from "../../redux/actions/actions";

export interface ProductWithQuantity extends PRODUCT {
  quantity: number;
}

function Checkout() {

  const dispatch = useDispatch();

  const selectStore = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectStore);

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile } = userInfo;

  const selectAddress = (state: RootState) => state.address;
  const { customerAddress } = useSelector(selectAddress);

  const selectDeliveryType = (state: RootState) => state.deliveryType;
  const { deliveryType: { deliveryOption : { name: selectedDeliveryName }} } = useSelector(selectDeliveryType);

  const subTotal = useSelector((state : RootState) => state.subtotal?.subTotal);
  const deliveryCost = useSelector((state : RootState) => state.subtotal?.deliveryCost) || 0;
  const tax = useSelector((state : RootState) => state.subtotal?.tax);
  const totalCost = useSelector((state : RootState) => state.subtotal?.totalCost) || 0;

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkAddress = async () => {
      if (profile) {
        const { data, error } = await supaClient
          .from('addresses')
          .select('*')
          .eq('user_id', profile.id);

          const [ supaBaseAddress ] = data;
          dispatch(addToCartAddressCreate(supaBaseAddress));
      }
    };

    checkAddress();
  }, [profile, dispatch]);

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    // TODO: Implement Stripe checkout logic here
    // This will be called when user clicks the "Complete Order" button
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to success page or handle response
    }, 2000);
  };

  const totalItemsCount = cartItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  return (
    <AuthCheck>
      <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500">
        {/* Header */}
        <div className="bg-white dark:bg-fun-blue-800 shadow-sm border-b border-gray-200 dark:border-fun-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link 
                  href="/cart" 
                  className="text-gray-400 hover:text-fun-blue-500 dark:hover:text-blog-white transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-black dark:text-white">
                    <FormattedMessage
                      id="checkout-page-heading"
                      description="Secure Checkout"
                      defaultMessage="Secure Checkout"
                    />
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4" />
                <FormattedMessage
                  id="checkout-ssl-secured"
                  description="SSL Secured"
                  defaultMessage="SSL Secured"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Order Details */}
            <div className="space-y-6">
              
              {/* Order Summary */}
              <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-fun-blue-300/20 dark:bg-fun-blue-500/30 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faShoppingBag} className="w-5 h-5 text-fun-blue-500 dark:text-fun-blue-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    <FormattedMessage
                      id="checkout-order-summary"
                      description="Order Summary"
                      defaultMessage="Order Summary ({count} {count, plural, one {item} other {items}})"
                      values={{ count: totalItemsCount }}
                    />
                  </h2>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems && cartItems.length > 0 ? (
                    cartItems.map((cartItem) => (
                      <CheckoutItemCard key={cartItem.id} cartItem={cartItem} />
                    ))
                  ) : (
                    <EmptyCheckoutMessage />
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              {customerAddress && (
                <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-fun-blue-300/20 dark:bg-fun-blue-500/30 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-fun-blue-500 dark:text-fun-blue-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-black dark:text-white">
                      <FormattedMessage
                        id="checkout-delivery-address"
                        description="Delivery Address"
                        defaultMessage="Delivery Address"
                      />
                    </h2>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <div>{customerAddress.address_line1}</div>
                    {customerAddress.address_line2 && <div>{customerAddress.address_line2}</div>}
                    <div>{customerAddress.postal_code}, {customerAddress.city}</div>
                    {customerAddress.state && <div>{customerAddress.state}</div>}
                    <div>{customerAddress.country}</div>
                  </div>
                </div>
              )}

              {/* Delivery Method */}
              <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faTruck} className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    <FormattedMessage
                      id="checkout-delivery-method"
                      description="Delivery Method"
                      defaultMessage="Delivery Method"
                    />
                  </h2>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-black dark:text-white font-medium">
                    {selectedDeliveryName}
                  </span>
                  <span className="text-black dark:text-white font-semibold">
                    {deliveryCost > 0 ? (
                      <CurrencyPriceComponent price={deliveryCost} />
                    ) : (
                      <FormattedMessage
                        id="checkout-free-delivery"
                        description="FREE"
                        defaultMessage="FREE"
                      />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faReceipt} className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">
                    <FormattedMessage
                      id="checkout-payment-summary"
                      description="Payment Summary"
                      defaultMessage="Payment Summary"
                    />
                  </h2>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-fun-blue-600">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      <FormattedMessage
                        id="checkout-subtotal"
                        description="Subtotal"
                        defaultMessage="Subtotal:"
                      />
                    </span>
                    <span className="text-black dark:text-white font-semibold">
                      <CurrencyPriceComponent price={subTotal} />
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-fun-blue-600">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      <FormattedMessage
                        id="checkout-tax"
                        description="Tax (19%)"
                        defaultMessage="Tax (19%):"
                      />
                    </span>
                    <span className="text-black dark:text-white font-semibold">
                      <CurrencyPriceComponent price={tax} />
                    </span>
                  </div>

                  {/* Delivery Cost */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-fun-blue-600">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      <FormattedMessage
                        id="checkout-delivery-cost"
                        description="Delivery Cost"
                        defaultMessage="Delivery:"
                      />
                    </span>
                    <span className="text-black dark:text-white font-semibold">
                      {deliveryCost > 0 ? (
                        <CurrencyPriceComponent price={deliveryCost} />
                      ) : (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      )}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg px-4 mt-4">
                    <span className="text-lg font-bold text-black dark:text-white">
                      <FormattedMessage
                        id="checkout-total"
                        description="Total"
                        defaultMessage="Total:"
                      />
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      <CurrencyPriceComponent price={totalCost} />
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handleStripeCheckout}
                  disabled={isProcessing || !cartItems || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:brightness-110 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 disabled:transform-none"
                >
                  <div className="flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faCreditCard} className="w-5 h-5" />
                    {isProcessing ? (
                      <FormattedMessage
                        id="checkout-processing"
                        description="Processing..."
                        defaultMessage="Processing..."
                      />
                    ) : (
                      <FormattedMessage
                        id="checkout-complete-order"
                        description="Complete Order"
                        defaultMessage="Complete Order"
                      />
                    )}
                  </div>
                </button>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <FontAwesomeIcon icon={faShieldAlt} className="w-3 h-3" />
                  <FormattedMessage
                    id="checkout-security-notice"
                    description="Your payment information is secure and encrypted"
                    defaultMessage="Your payment information is secure and encrypted"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}

// CheckoutItemCard Component
function CheckoutItemCard({ cartItem }: { cartItem: ProductWithQuantity }) {
  return (
    <div className="group relative bg-white dark:bg-fun-blue-700 rounded-2xl shadow-md hover:shadow-lg border border-gray-100 dark:border-fun-blue-600 transition-all duration-300 ease-in-out hover:border-fun-blue-500 dark:hover:border-fun-blue-300 overflow-hidden">
      <div className="flex items-center p-6">
        {/* Product Image */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-fun-blue-600 shadow-sm">
            <Image
              src={cartItem.image_url ?? '/mountains.jpg'}
              alt={cartItem.name}
              width={80}
              height={80}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* Quantity Badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-fun-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {cartItem.quantity}
          </div>
        </div>
        
        {/* Product Details */}
        <div className="flex-1 ml-5 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg font-bold text-black dark:text-white truncate group-hover:text-fun-blue-500 dark:group-hover:text-fun-blue-300 transition-colors duration-200">
                {cartItem.name}
              </h3>
              {cartItem.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                  {cartItem.description}
                </p>
              )}
            </div>
            
            {/* Price Section */}
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                <CurrencyPriceComponent price={cartItem.price * cartItem.quantity} />
              </div>
              {cartItem.quantity > 1 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <CurrencyPriceComponent price={cartItem.price} />
                  <FormattedMessage
                    id="checkout-item-each"
                    description=" each"
                    defaultMessage=" each"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Row - Quantity Info and Subtotal */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-fun-blue-600">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-fun-blue-300/20 dark:bg-fun-blue-500/30 rounded-full">
                <div className="w-2 h-2 bg-fun-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-fun-blue-700 dark:text-fun-blue-300">
                  <FormattedMessage
                    id="checkout-item-quantity-label"
                    description="Quantity"
                    defaultMessage="Quantity: {count}"
                    values={{ count: cartItem.quantity }}
                  />
                </span>
              </div>
            </div>
            
            {/* Item Subtotal Breakdown */}
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <FormattedMessage
                  id="checkout-item-subtotal"
                  description="Item Total"
                  defaultMessage="Item Total"
                />
              </div>
              <div className="text-sm font-semibold text-black dark:text-white">
                <CurrencyPriceComponent price={cartItem.price * cartItem.quantity} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fun-blue-300/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}

// EmptyCheckoutMessage Component
function EmptyCheckoutMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-fun-blue-700 dark:to-fun-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <FontAwesomeIcon icon={faShoppingBag} className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">0</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-black dark:text-white mb-3">
        <FormattedMessage
          id="checkout-empty-cart"
          description="Your cart is empty"
          defaultMessage="Your cart is empty"
        />
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md leading-relaxed">
        <FormattedMessage
          id="checkout-empty-cart-description"
          description="Add some products to continue with your order"
          defaultMessage="Add some amazing products to your cart and come back to complete your order. We have great deals waiting for you!"
        />
      </p>
      
      <Link 
        href="/products"
        className="group bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2"
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faShoppingBag} className="w-5 h-5 group-hover:animate-bounce" />
          <FormattedMessage
            id="checkout-go-shopping"
            description="Continue Shopping"
            defaultMessage="Start Shopping"
          />
        </div>
      </Link>
    </div>
  );
}

export default Checkout;
