import React from "react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

// Components
import StorePage from "../../components/CartPage";
import { RootState } from "../../lib/interfaces/interface";

function Cart() {

  const selectStore = (state: RootState) => state.cart;
  const { cartItems } = useSelector(selectStore);

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center items-center">
        <div className="font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black p-10">
            <FormattedMessage
                id="cart-heading"
                description="Cart" // Description should be a string literal
                defaultMessage="Cart" // Message should be a string literal
            />
        </div>
        <StorePage cartItems={cartItems} />
      </div>
    </>
  );
}

export default Cart;
