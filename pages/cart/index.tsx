'use client';

import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

// Components
import CartPage from "../../components/CartPage";
import { RootState } from "../../lib/interfaces/interface";

function Cart() {
  const selectStore = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectStore);

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

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
        <CartPage cartItems={cartItems} profile={profile}/>
      </div>
    </>
  );
}

export default Cart;
