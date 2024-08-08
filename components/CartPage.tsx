'use client';

import { FormattedMessage } from "react-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

// Interfaces
import { PRODUCT } from "../database.types";

// Components
import QuantityComponent from "./QuantityComponent";
import CurrencyPriceComponent from "./CurrencyPriceComponent";
import AuthCheck from "./AuthCheck";
import AddressForm, { addressJSON } from "./AddressForm";

// Supabase User Profile
import { UserProfile } from "../lib/hooks";

// Supabase
import { supaClient } from "../supa-client";

// CSS
import styles from "../styles/Admin.module.css";

export interface ProductWithQuantity extends PRODUCT {
    quantity: number;
}

interface CartPageProps {
    cartItems: ProductWithQuantity[];
    profile: UserProfile | null;
}

const CartPage : React.FC<CartPageProps> = ({ cartItems, profile }) => {
    const [addressState , setAddressState] = useState<addressJSON>();
    const [editSavedAddress , setEditSavedAddress] = useState<boolean>(false);

    useEffect(() => {
      const checkAddress = async () => {
        if (profile) {
          const { data, error } = await supaClient
            .from('addresses')
            .select('*')
            .eq('user_id', profile.id);
  
          const [ address ] = data
          setAddressState(address);
        }
      };

      checkAddress();
    }, [profile]);

    return (
      <>        
         {/*   if - signed in */ }  
         <AuthCheck>
            {/* Cart Items */}
            <div className="flex h-full w-full px-10">
                <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                    <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                        {/* Product Row */}
                        {cartItems && cartItems.map((cartItem) => (
                            <div key={cartItem.id} className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                                <div className="flex flex-row gap-2 h-full w-full">
                                    <div className="flex">
                                        <Image src={`/mountains.jpg`} 
                                            alt={cartItem.name}
                                            width={250}
                                            height={250}
                                            className="rounded-lg"
                                        />
                                    </div>
                                    <div className="flex flex-col w-full justify-between">
                                        <div>
                                            <div>{cartItem.name}</div>
                                            <div>{cartItem.description}</div>
                                        </div>
                                        <div className="flex flex-row justify-between">
                                            <div>
                                                <QuantityComponent product={cartItem}>
                                                    {cartItem.quantity}
                                                </QuantityComponent>
                                            </div>
                                            <div>
                                                <CurrencyPriceComponent price={cartItem.price}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {cartItems && cartItems.length === 0 &&
                            <div className="flex flex-col gap-2">
                                <FormattedMessage
                                    id="cart-page-empty-cart"
                                    description="Please add items into the shopping cart" // Description should be a string literal
                                    defaultMessage="Please add items into the shopping cart" // Message should be a string literal
                                />
                                <Link href="/products" className="flex justify-center pt-5">
                                        <button className={styles.btnAdmin}>
                                            <FormattedMessage id="cart-page-no-products-redirect-btn"
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
            { addressState && !editSavedAddress
                ? <>
                 {/* Address Card */}
                    <div className="flex h-full w-full p-10">
                        <div className="flex h-full lg:w-1/5 w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                            <div className="flex flex-row  w-full h-full gap-2 justify-between items-start">
                                {/* Address */}
                                <div className="font-poppins">
                                    <div>
                                        <FormattedMessage
                                            id="cart-page-address-card"
                                            description="Address" // Description should be a string literal
                                            defaultMessage="Address" // Message should be a string literal
                                        />
                                    </div>
                                    <div className="text-xs">{addressState?.address_line1}</div>
                                    <div className="text-xs">{addressState?.address_line2}</div>
                                    <div className="flex flex-row gap-1 text-xs">
                                        <div className="flex flex-row">
                                            <div>{addressState?.postal_code}</div>
                                            <div>,</div>
                                        </div>
                                        <div>{addressState?.city}</div>
                                    </div>
                                    <div className="text-xs">{addressState?.state}</div>
                                    <div className="text-xs">{addressState?.country}</div>
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
                        addressState={addressState}
                        setAddressState={setAddressState}
                        editSavedAddress={editSavedAddress}
                        setEditSavedAddress={setEditSavedAddress}
                    />
                </>
            }
        </AuthCheck>
      </>
    );
  };
  
  export default CartPage;

