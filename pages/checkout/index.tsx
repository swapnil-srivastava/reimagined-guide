import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import Link from "next/link";

// Redux
import { useDispatch, useSelector } from "react-redux";

// Interfaces
import { RootState } from "../../lib/interfaces/interface";
import { PRODUCT } from "../../database.types";

// Components
import AuthCheck from "../../components/AuthCheck";
import CurrencyPriceComponent from "../../components/CurrencyPriceComponent";

// CSS
import styles from "../../styles/Admin.module.css";

// Supabase
import { supaClient } from "../../supa-client";

// Actions
import { addToCartAddressCreate } from "../../redux/actions/actions";
import CalculateTotal from "../../components/CalculateTotal";

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
                                            <div className="flex gap-2">
                                                <div className="lg:text-xl text-xs">
                                                    <FormattedMessage
                                                        id="checkout-page-empty-cart"
                                                        description="quantity" // Description should be a string literal
                                                        defaultMessage="Quantity" // Message should be a string literal
                                                    />
                                                </div>
                                                <div>
                                                    :
                                                </div>
                                                <div className="lg:text-xl text-xs">
                                                    {cartItem.quantity}
                                                </div>
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
                                        id="checkout-page-empty-cart"
                                        description="Please add items into the shopping cart" // Description should be a string literal
                                        defaultMessage="Please add items into the shopping cart" // Message should be a string literal
                                    />
                                </div>
                                <Link href="/products" className="flex justify-center pt-5">
                                        <button className={styles.btnAdmin}>
                                            <FormattedMessage id="checkout-no-products-redirect-btn"
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
              { customerAddress && 
                <>
                  {/* Address Card */}
                  <div className="flex justify-start w-full lg:px-12 px-10 pb-3 pt-5 font-poppins dark:text-blog-white lg:text-2xl text-lg">
                      <FormattedMessage
                          id="checkout-page-address-card-heading"
                          description="Address" // Description should be a string literal
                          defaultMessage="Address" // Message should be a string literal
                      />
                  </div>
                  <div className="flex h-full w-full lg:px-10 px-5">
                      <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                          <div className="flex flex-row  w-full h-full gap-2 justify-between items-start">
                              {/* Address */}
                              <div className="font-poppins">
                                  <div className="text-base">{customerAddress?.address_line1}</div>
                                  <div className="text-base">{customerAddress?.address_line2}</div>
                                  <div className="flex flex-row gap-1 text-base">
                                      <div className="flex flex-row">
                                          <div>{customerAddress?.postal_code}</div>
                                          <div>,</div>
                                      </div>
                                      <div>{customerAddress?.city}</div>
                                  </div>
                                  <div className="text-base">{customerAddress?.state}</div>
                                  <div className="text-base">{customerAddress?.country}</div>
                              </div>
                          </div>
                      </div>
                  </div>
                </>
              }
              {/* Selected Delivery Section */}
              {
                <>
                    <div className="flex justify-start w-full lg:px-12 px-10 pb-3 pt-5 font-poppins dark:text-blog-white lg:text-2xl text-lg">
                        <FormattedMessage
                            id="checkout-delivery-heading"
                            description="Delivery" // Description should be a string literal
                            defaultMessage="Delivery" // Message should be a string literal
                        />
                    </div>
                    <div className="flex h-full w-full lg:px-10 px-5">
                        <div className="flex h-full w-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                            <div className="flex flex-row  w-full h-full gap-2 justify-between items-start">
                                {/* Select Deliery Options */}
                                <div className="flex gap-2">
                                    <FormattedMessage
                                        id="checkout-selected-delivery-type"
                                        description="Selected Delivery Type" // Description should be a string literal
                                        defaultMessage="Selected Delivery Type" // Message should be a string literal
                                    />
                                    <div>
                                        :
                                    </div>
                                    <div>
                                       {selectedDeliveryName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
              }
              {
                <>
                    <div className="flex justify-start w-full lg:px-12 px-10 pb-3 pt-5 font-poppins dark:text-blog-white lg:text-2xl text-lg">
                        <FormattedMessage
                            id="cart-page-subtotal-heading"
                            description="Subtotal"
                            defaultMessage="Subtotal"
                        />
                    </div>
                    <div className="flex h-full w-full lg:px-10 px-5 pb-5">
                        <CalculateTotal subTotal={subTotal} deliveryCost={deliveryCost} taxRate={tax} totalCost={totalCost} />
                    </div>
                </>
               }
               {
                <>
                    <div className="flex justify-center pt-5 pb-20">
                        <button className={styles.btnAdmin}>
                            <FormattedMessage id="chekcout-buy-now-btn"
                            description="Buy Now" // Description should be a string literal
                            defaultMessage="Buy Now" // Message should be a string literal
                            />
                        </button>
                    </div>
                </>
               }
        </AuthCheck>
      </div>
    </>
  );
}

export default Checkout;
