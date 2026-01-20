import React from "react";
import { FormattedMessage } from "react-intl";
import type { NextPage } from 'next';

const ProductDetail: NextPage = () => {
  return (
    <>
      <div className="flex flex-wrap justify-center bg-blog-white dark:bg-fun-blue-500 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-poppins lg:text-5xl text-3xl dark:text-blog-white text-blog-black">
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