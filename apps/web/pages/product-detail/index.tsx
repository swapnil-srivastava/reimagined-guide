import React from "react";
import { FormattedMessage } from "react-intl";

function ProductDetail() {
  return (
    <>
      <div className="flex flex-wrap justify-center">
        <div className="font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black p-10">
            <FormattedMessage
                id="product-detail-heading"
                description="Product Detail" // Description should be a string literal
                defaultMessage="Product Detail" // Message should be a string literal
            />
        </div>
      </div>
    </>
  );
}

export default ProductDetail;