'use client';

import { FormattedMessage } from "react-intl";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";

// Interfaces
import { PRODUCT } from "../database.types";

// Components
import QuantityComponent from "./QuantityComponent";
import CurrencyPriceComponent from "./CurrencyPriceComponent";
import AuthCheck from "./AuthCheck";
import AddressForm from "./AddressForm";

// Supabase User Profile
import { UserProfile } from "../lib/hooks";
import AddressCheck from "./AddressCheck";

// CSS
// import styles from "../styles/Admin.module.css";

export interface ProductWithQuantity extends PRODUCT {
    quantity: number;
}

interface CartPageProps {
    cartItems: ProductWithQuantity[];
    profile: UserProfile | null
}

const CartPage : React.FC<CartPageProps> = ({ cartItems, profile }) => {
    return (
      <>
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
                </div>
            </div>
        </div>
        
        <AuthCheck>  {/* if - signed in */ }
            <AddressCheck> {/* if - address */}
                {/* Cart delivery Type */}
                {/* Replace it with delivery types */}
                <div className="flex lg:h-96 lg:w-1/5 h-auto w-auto">
                    <div className="flex h-full w-full justify-center items-center p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                        <div className="flex flex-col gap-2 justify-center items-center">
                            <FontAwesomeIcon icon={faCirclePlus} size="3x" className="cursor-pointer"/>
                            <div className="text-lg">
                            <FormattedMessage
                                id="cart-page-delivery-type"
                                description="Select Delivery Type"
                                defaultMessage="Select Delivery Type"
                            />
                            </div>
                        </div>
                    </div>
                </div>
            </AddressCheck>   
        </AuthCheck>

        {/* <div className="flex h-full w-full px-10">
            <AddressForm profile={profile} />
        </div> */}

        {/* Detail Summary */}


      </>
    );
  };
  
  export default CartPage;