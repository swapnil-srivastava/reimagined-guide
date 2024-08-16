import React from "react";
import { FormattedMessage } from "react-intl";

function Checkout() {
  return (
    <>
      <div className="flex flex-wrap justify-center">
        <div className="font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black p-10">
            <FormattedMessage
                id="checkout-heading"
                description="Checkout" // Description should be a string literal
                defaultMessage="Checkout" // Message should be a string literal
            />
        </div>
      </div>
    </>
  );
}

export default Checkout;
