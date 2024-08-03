import React from "react";
import { FormattedMessage } from "react-intl";

function Products() {
  return (
    <>
      <div className="flex flex-wrap justify-center">
        <div className="font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black p-10">
            <FormattedMessage
                id="products-heading"
                description="Products" // Description should be a string literal
                defaultMessage="Products" // Message should be a string literal
            />
        </div>
      </div>
    </>
  );
}

export default Products;