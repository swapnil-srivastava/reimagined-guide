'use client';

import { FormattedMessage, useIntl } from "react-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrash, 
  faPenToSquare, 
  faShoppingBag, 
  faMapMarkerAlt,
  faTruck,
  faReceipt,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

// Interfaces
import { ADDRESS, PRODUCT } from "../database.types";

// Components
import QuantityComponent from "./QuantityComponent";
import CurrencyPriceComponent from "./CurrencyPriceComponent";
import AuthCheck from "./AuthCheck";
import AddressForm, { addressJSON } from "./AddressForm";
import DeliveryOptions from "./DeliveryOptions";

// Supabase User Profile
import { UserProfile } from "../lib/hooks";

// Supabase
import { supaClient } from "../supa-client";

// Redux
import { addToCartAddressCreate, addToCartDelete } from "../redux/actions/actions";
import { RootState } from "../lib/interfaces/interface";

export interface ProductWithQuantity extends PRODUCT {
    quantity: number;
}

interface CartPageProps {
    cartItems: ProductWithQuantity[];
    profile: UserProfile | null;
    address: ADDRESS | null ;
}

interface deliveryOptionState {
    deliveryOption: deliveryOptions;
}

interface deliveryOptions {
    id: string; 
    name: string; 
    description: string;
    deliveryPrice: number;
}

const CartPage : React.FC<CartPageProps> = ({ cartItems, profile, address }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    
    const subTotal = useSelector((state : RootState) => state.subtotal?.subTotal);
    const deliveryCost = useSelector((state : RootState) => state.subtotal?.deliveryCost) || 0;
    const tax = useSelector((state : RootState) => state.subtotal?.tax);
    const totalCost = useSelector((state : RootState) => state.subtotal?.totalCost) || 0;

    const [editSavedAddress , setEditSavedAddress] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchedAddress, setFetchedAddress] = useState<ADDRESS | null>(null);

    // Calculate total quantity of all items in cart
    const totalItemsCount = cartItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

    useEffect(() => {
      const checkAddress = async () => {
        if (profile?.id) {
          setIsLoading(true);
          try {
            const { data, error } = await supaClient
              .from('addresses')
              .select('*')
              .eq('user_id', profile.id);
    
            if (error) {
              console.error('Error fetching address:', error);
              setIsLoading(false);
              return;
            }

            const [ supaBaseAddress ] = data || [];
            if (supaBaseAddress) {
              dispatch(addToCartAddressCreate(supaBaseAddress));
              setFetchedAddress(supaBaseAddress);
            }
          } catch (error) {
            console.error('Error fetching address:', error);
          } finally {
            setIsLoading(false);
          }
        } else {
          // For anonymous users, no need to fetch from DB
          setIsLoading(false);
        }
      };

      checkAddress();
    }, [profile, dispatch]);

    const handleProductDelete = (product: PRODUCT) => {
        dispatch(addToCartDelete(product));
    };

    return (
      <AuthCheck allowAnonymous={true}>
        <div className="min-h-screen bg-blog-white dark:bg-fun-blue-500 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Link 
                  href="/products"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-fun-blue-500 dark:hover:text-blog-white transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                  <FormattedMessage
                    id="cart-continue-shopping"
                    description="Continue Shopping"
                    defaultMessage="Continue Shopping"
                  />
                </Link>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-fun-blue-500 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faShoppingBag} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-blog-black dark:text-blog-white">
                    <FormattedMessage
                      id="cart-page-shopping-cart-card-heading"
                      description="Shopping Cart"
                      defaultMessage="Shopping Cart"
                    />
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    <FormattedMessage
                      id="cart-items-count"
                      description="Items in cart count"
                      defaultMessage="{count} {count, plural, one {item} other {items}} in your cart"
                      values={{ count: totalItemsCount }}
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cart Items Section */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 overflow-hidden">
                  
                  {/* Cart Items */}
                  {cartItems && cartItems.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-fun-blue-600">
                      {cartItems.map((cartItem) => (
                        <CartItemCard 
                          key={cartItem.id} 
                          cartItem={cartItem} 
                          onDelete={handleProductDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyCartMessage />
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  
                  {/* Order Summary */}
                  <OrderSummary 
                    subTotal={subTotal}
                    deliveryCost={deliveryCost}
                    tax={tax}
                    totalCost={totalCost}
                    cartItems={cartItems}
                  />

                {/* Address Section */}
                <AddressSection 
                  address={fetchedAddress || address}
                  profile={profile}
                  isLoading={isLoading}
                  editSavedAddress={editSavedAddress}
                  setEditSavedAddress={setEditSavedAddress}
                />

                  {/* Delivery Options */}
                  <DeliverySection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthCheck>
    );
};

// Cart Item Card Component
function CartItemCard({ cartItem, onDelete }: { 
  cartItem: ProductWithQuantity; 
  onDelete: (product: PRODUCT) => void;
}) {
  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-fun-blue-700 transition-colors duration-200">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <Image 
              src={cartItem.image_url ?? `/mountains.jpg`} 
              alt={cartItem.name || 'Product image'}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-blog-black dark:text-blog-white truncate">
                {cartItem.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {cartItem.description}
              </p>
            </div>
            
            {/* Delete Button */}
            <button
              onClick={() => onDelete(cartItem)}
              className="ml-4 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
              aria-label="Remove item"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </div>

          {/* Quantity and Price */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <QuantityComponent product={cartItem}>
                {cartItem.quantity}
              </QuantityComponent>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-blog-black dark:text-blog-white">
                <CurrencyPriceComponent price={cartItem.price * cartItem.quantity} />
              </div>
              {cartItem.quantity > 1 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <CurrencyPriceComponent price={cartItem.price} /> each
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty Cart Message Component
function EmptyCartMessage() {
  return (
    <div className="p-12 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        <FontAwesomeIcon icon={faShoppingBag} className="w-10 h-10 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-blog-black dark:text-blog-white mb-2">
        <FormattedMessage
          id="cart-page-empty-cart-title"
          description="Your cart is empty"
          defaultMessage="Your cart is empty"
        />
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        <FormattedMessage
          id="cart-page-empty-cart"
          description="Please add items into the shopping cart"
          defaultMessage="Please add items into the shopping cart"
        />
      </p>
      
      <Link href="/products">
        <button className="bg-hit-pink-500 hover:brightness-110 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-105">
          <FormattedMessage 
            id="cart-page-no-products-redirect-btn"
            description="Go to products page"
            defaultMessage="Go to products page"
          />
        </button>
      </Link>
    </div>
  );
}

// Order Summary Component
function OrderSummary({ 
  subTotal, 
  deliveryCost, 
  tax, 
  totalCost, 
  cartItems 
}: {
  subTotal: number;
  deliveryCost: number;
  tax: number;
  totalCost: number;
  cartItems: ProductWithQuantity[];
}) {
  if (!cartItems || cartItems.length === 0) return null;

  return (
    <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faReceipt} className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-blog-black dark:text-blog-white">
          <FormattedMessage
            id="cart-order-summary"
            description="Order Summary"
            defaultMessage="Order Summary"
          />
        </h2>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-fun-blue-600">
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            <FormattedMessage
              id="calculate-total-subtotal-text"
              description="Subtotal"
              defaultMessage="Subtotal:"
            />
          </span>
          <span className="text-blog-black dark:text-blog-white font-semibold">
            € {subTotal?.toFixed(2)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-fun-blue-600">
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            <FormattedMessage
              id="calculate-total-tax-text"
              description="Tax (19%)"
              defaultMessage="Tax (19%):"
            />
          </span>
          <span className="text-blog-black dark:text-blog-white font-semibold">
            € {tax?.toFixed(2)}
          </span>
        </div>

        {/* Delivery Cost */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-fun-blue-600">
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            <FormattedMessage
              id="calculate-total-delivery-cost-text"
              description="Delivery Cost"
              defaultMessage="Delivery Cost:"
            />
          </span>
          <span className="text-blog-black dark:text-blog-white font-semibold">
            € {deliveryCost?.toFixed(2)}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-3 bg-gradient-to-r from-fun-blue-500/10 to-fun-blue-600/10 dark:from-fun-blue-500/20 dark:to-fun-blue-600/20 rounded-lg px-4 mt-4">
          <span className="text-lg font-bold text-blog-black dark:text-blog-white">
            <FormattedMessage
              id="calculate-total-text"
              description="Total"
              defaultMessage="Total:"
            />
          </span>
          <span className="text-xl font-bold text-fun-blue-500 dark:text-blue-300">
            € {totalCost?.toFixed(2)}
          </span>
        </div>
      </div>

      <Link href="/checkout" className="block">
        <button className="w-full bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-500 hover:brightness-110 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105">
          <FormattedMessage 
            id="cart-page-checkout-btn"
            description="Checkout"
            defaultMessage="Proceed to Checkout"
          />
        </button>
      </Link>
    </div>
  );
}

// Address Section Component
function AddressSection({
  address,
  editSavedAddress,
  setEditSavedAddress,
  profile,
  isLoading
}: {
  address: ADDRESS | null;
  editSavedAddress: boolean;
  setEditSavedAddress: (value: boolean) => void;
  profile: UserProfile | null;
  isLoading: boolean;
}) {
  // Check if we have a valid address with actual data (not just an empty object)
  const hasValidAddress = address && 
    address.address_line1 && 
    address.address_line1.trim() !== '';

  if (editSavedAddress) {
    return (
      <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 p-6">
        <AddressForm
          profile={profile}
          addressState={address}
          editSavedAddress={editSavedAddress}
          setEditSavedAddress={setEditSavedAddress}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-blog-black dark:text-blog-white">
          <FormattedMessage
            id="cart-page-address-card-heading"
            description="Address"
            defaultMessage="Delivery Address"
          />
        </h2>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      ) : hasValidAddress ? (
        <div className="flex justify-between items-start">
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div>{address.address_line1}</div>
            {address.address_line2 && <div>{address.address_line2}</div>}
            <div>
              {address.postal_code}, {address.city}
            </div>
            {address.state && <div>{address.state}</div>}
            <div>{address.country}</div>
          </div>
          
          <button
            onClick={() => setEditSavedAddress(true)}
            className="p-2 text-gray-400 hover:text-hit-pink-500 dark:hover:text-hit-pink-400 transition-colors duration-200"
            aria-label="Edit address"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <FormattedMessage
              id="cart-no-address"
              description="No delivery address"
              defaultMessage="No delivery address added"
            />
          </p>
          <button
            onClick={() => setEditSavedAddress(true)}
            className="bg-hit-pink-500 hover:brightness-110 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FormattedMessage
              id="cart-add-address"
              description="Add address"
              defaultMessage="Add Address"
            />
          </button>
        </div>
      )}
    </div>
  );
}

// Delivery Section Component
function DeliverySection() {
  return (
    <div className="bg-white dark:bg-fun-blue-800 rounded-2xl shadow-lg border border-gray-200 dark:border-fun-blue-600 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faTruck} className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-xl font-semibold text-blog-black dark:text-blog-white">
          <FormattedMessage
            id="cart-page-delivery-cards-heading"
            description="Delivery"
            defaultMessage="Delivery Options"
          />
        </h2>
      </div>
      
      <DeliveryOptions />
    </div>
  );
}
  
export default CartPage;

