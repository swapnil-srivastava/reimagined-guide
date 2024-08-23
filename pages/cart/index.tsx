'use client';

import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

// Components
import CartPage from "../../components/CartPage";
import { RootState } from "../../lib/interfaces/interface";
import { updateDeliveryCost, updateSubtotal, updateTax, updateTotalCost } from "../../redux/actions/actions";

function Cart() {
  const dispatch = useDispatch();
  
  const selectStore = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectStore);

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile } = userInfo;

  const selectAddress = (state: RootState) => state.address;
  const { customerAddress } = useSelector(selectAddress);

  const deliveryCost = useSelector((state: RootState) => state.deliveryType?.deliveryType?.deliveryOption?.deliveryPrice) || 0; // it need to zero otherwise total cost won"t be calcualted

  useEffect(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    dispatch(updateSubtotal(cartItems));
    dispatch(updateTax(subtotal));
    dispatch(updateDeliveryCost(deliveryCost));
    dispatch(updateTotalCost(subtotal, subtotal * 0.19, deliveryCost));
  }, [cartItems, deliveryCost, dispatch]);

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center items-center">
        <div className="font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black lg:p-10 p-5">
            <div>
              <FormattedMessage
                  id="cart-heading"
                  description="Cart" // Description should be a string literal
                  defaultMessage="Cart" // Message should be a string literal
              />
            </div>
        </div>
        <CartPage cartItems={cartItems} profile={profile} address={customerAddress} />
      </div>
    </>
  );
}

export default Cart;
