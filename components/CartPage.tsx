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

// CSS
// import styles from "../styles/Admin.module.css";

export interface ProductWithQuantity extends PRODUCT {
    quantity: number;
}

interface CartPageProps {
    cartItems: ProductWithQuantity[]
  }

const CartPage : React.FC<CartPageProps>= ({ cartItems }) => {
    return (
      <>
        <div className="flex h-full w-full px-10">
            <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                    {/* Product Row */}
                    {cartItems && cartItems.map((cartItem) => (
                        <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
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
      </>
    );
  };
  
  export default CartPage;