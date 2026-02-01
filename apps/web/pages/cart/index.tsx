'use client';

import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

// Components
import CartPage from "../../components/CartPage";
import { RootState } from "../../lib/interfaces/interface";
import { updateDeliveryCost, updateSubtotal, updateTax, updateTotalCost } from "../../redux/actions/actions";

const Cart: NextPage = () => {
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
    <div className="bg-blog-white dark:bg-fun-blue-500 min-h-screen text-blog-black dark:text-blog-white">
      <CartPage cartItems={cartItems} profile={profile} address={customerAddress} />
    </div>
  );
}

export default Cart;
