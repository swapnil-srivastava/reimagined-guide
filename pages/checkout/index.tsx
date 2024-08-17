import React from "react";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import Link from "next/link";

// Redux
import { useSelector } from "react-redux";

// Interfaces
import { RootState } from "../../lib/interfaces/interface";
import { PRODUCT } from "../../database.types";

// Components
import AuthCheck from "../../components/AuthCheck";
import QuantityComponent from "../../components/QuantityComponent";
import CurrencyPriceComponent from "../../components/CurrencyPriceComponent";

// CSS
import styles from "../../styles/Admin.module.css";

export interface ProductWithQuantity extends PRODUCT {
  quantity: number;
}

function Checkout() {

  const selectStore = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectStore);

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile } = userInfo;

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center">
        <div className="self-center font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black p-10">
            <FormattedMessage
                id="checkout-heading"
                description="Checkout" // Description should be a string literal
                defaultMessage="Checkout" // Message should be a string literal
            />
        </div>
        <AuthCheck>
              {/* Shopping Cart Section */}
              <div className="flex h-full w-full lg:px-10 px-5 font-poppins">
                <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                    <div className="flex flex-col w-full h-full gap-2 justify-center items-center">
                        {/* Product Row */}
                        {cartItems && cartItems.map((cartItem : ProductWithQuantity) => (
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
        </AuthCheck>
      </div>
    </>
  );
}

export default Checkout;
