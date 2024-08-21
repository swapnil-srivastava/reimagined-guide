'use client';

import { FormattedMessage } from "react-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

// Interfaces
import { ADDRESS, PRODUCT } from "../database.types";

// Components
import QuantityComponent from "./QuantityComponent";
import CurrencyPriceComponent from "./CurrencyPriceComponent";
import AuthCheck from "./AuthCheck";
import AddressForm, { addressJSON } from "./AddressForm";
import DeliveryOptions from "./DeliveryOptions";
import CalculateTotal from "./CalculateTotal";

// Supabase User Profile
import { UserProfile } from "../lib/hooks";

// Supabase
import { supaClient } from "../supa-client";

// CSS
import styles from "../styles/Admin.module.css";

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
    
    const selectedDelivery = useSelector((state : RootState) => state.deliveryType.deliveryType.deliveryOption);
    
    const [editSavedAddress , setEditSavedAddress] = useState<boolean>(false);

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
    }, [profile]);

    const handleProductDelete = (product: PRODUCT) => {
        dispatch(addToCartDelete(product));
    };

    return (
      <>        
         {/*   if - signed in */ }  
         <AuthCheck>
            <div className="flex justify-start w-full lg:px-12 px-10 pb-3 font-poppins dark:text-blog-white lg:text-2xl text-lg">
                <FormattedMessage
                    id="cart-page-shopping-cart-card-heading"
                    description="Shopping Cart" // Description should be a string literal
                    defaultMessage="Shopping Cart" // Message should be a string literal
                />
            </div>
            {/* Shopping Cart Section */}
            <div className="flex h-full w-full lg:px-10 px-5 font-poppins">
                <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                    <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                        {/* Product Row */}
                        {cartItems && cartItems.map((cartItem) => (
                            <div key={cartItem.id} className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                                <div className="flex flex-row gap-2 h-full w-full">
                                    <div className="flex">
                                        <Image 
                                            src={cartItem.image_url ?? `/mountains.jpg`} 
                                            alt={cartItem.name}
                                            width={250}
                                            height={250}
                                            className="rounded-lg"
                                        />
                                    </div>
                                    <div className="flex flex-col w-full justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="lg:text-xl text-xs">{cartItem.name}</div>
                                                <div className="lg:text-xl text-xs">{cartItem.description}</div>
                                            </div>
                                            <FontAwesomeIcon icon={faCircleXmark} className="cursor-pointer" size="xl" onClick={() => handleProductDelete(cartItem)}/>
                                        </div>
                                        <div className="flex flex-row justify-between items-center">
                                            <div>
                                                <QuantityComponent product={cartItem}>
                                                    {cartItem.quantity}
                                                </QuantityComponent>
                                            </div>
                                            <div className="lg:text-2xl text-xs">
                                                <CurrencyPriceComponent price={cartItem.price}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* If there are no items in cart */}
                        {cartItems && cartItems.length === 0 &&
                            <div className="flex flex-col items-center gap-2 justify-center h-full w-full">
                                <div className="text-center">
                                    <FormattedMessage
                                        id="cart-page-empty-cart"
                                        description="Please add items into the shopping cart" // Description should be a string literal
                                        defaultMessage="Please add items into the shopping cart" // Message should be a string literal
                                    />
                                </div>
                                <Link href="/products" className="flex justify-center pt-5">
                                        <button className={styles.btnAdmin}>
                                            <FormattedMessage 
                                                id="cart-page-no-products-redirect-btn"
                                                description="Go to products page" // Description should be a string literal
                                                defaultMessage="Go to products page" // Message should be a string literal
                                                />
                                        </button>
                                </Link>
                            </div>
                        }
                    </div>
                </div>
            </div>
            {/* Address Section */}
            { address && !editSavedAddress
                ? <>
                 {/* Address Card */}
                    <div className="flex justify-start w-full lg:px-12 px-10 pb-3 pt-5 font-poppins dark:text-blog-white lg:text-2xl text-lg">
                        <FormattedMessage
                            id="cart-page-address-card-heading"
                            description="Address" // Description should be a string literal
                            defaultMessage="Address" // Message should be a string literal
                        />
                    </div>
                    <div className="flex h-full w-full lg:px-10 px-5">
                        <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                            <div className="flex flex-row  w-full h-full gap-2 justify-between items-start">
                                {/* Address */}
                                <div className="font-poppins">
                                    <div className="text-base">{address?.address_line1}</div>
                                    <div className="text-base">{address?.address_line2}</div>
                                    <div className="flex flex-row gap-1 text-base">
                                        <div className="flex flex-row">
                                            <div>{address?.postal_code}</div>
                                            <div>,</div>
                                        </div>
                                        <div>{address?.city}</div>
                                    </div>
                                    <div className="text-base">{address?.state}</div>
                                    <div className="text-base">{address?.country}</div>
                                </div>
                                {/* Edit icon */}
                                <div>
                                    <FontAwesomeIcon icon={faPenToSquare} className="cursor-pointer" size="lg" onClick={() => setEditSavedAddress(true)}/>
                                </div>
                            </div>
                        </div>
                    </div>
                  </>
                : <>
                    <AddressForm
                        profile={profile}
                        addressState={address}
                        editSavedAddress={editSavedAddress}
                        setEditSavedAddress={setEditSavedAddress}
                    />
                  </>
            }
            {/* Delivery Options section */}
            {   
                <>
                    <div className="flex justify-start w-full lg:px-12 px-10 pb-3 pt-5 font-poppins dark:text-blog-white lg:text-2xl text-lg">
                        <FormattedMessage
                            id="cart-page-delivery-cards-heading"
                            description="Delivery" // Description should be a string literal
                            defaultMessage="Delivery" // Message should be a string literal
                        />
                    </div>
                    <DeliveryOptions/>
                </>
            }
            {/* Subtotal section  */}
            {   
                <>
                    <div className="flex justify-start w-full lg:px-12 px-10 pb-3 pt-5 font-poppins dark:text-blog-white lg:text-2xl text-lg">
                        <FormattedMessage
                            id="cart-page-subtotal-heading"
                            description="Subtotal" // Description should be a string literal
                            defaultMessage="Subtotal" // Message should be a string literal
                        />
                    </div>
                    <div className="flex h-full w-full lg:px-10 px-5 pb-5">
                        <CalculateTotal products={cartItems} deliveryCost={selectedDelivery && selectedDelivery?.deliveryPrice}/>
                    </div>
                </>
            }
            {/* Go to Checkout page button */}
            {   
                <>
                    <Link href="/checkout" className="flex justify-center pt-5 pb-20">
                        <button className={styles.btnAdmin}>
                            <FormattedMessage id="cart-page-checkout-btn"
                            description="Checkout" // Description should be a string literal
                            defaultMessage="Checkout" // Message should be a string literal
                            />
                        </button>
                    </Link>
                </>
            }
        </AuthCheck>
      </>
    );
};
  
  export default CartPage;

