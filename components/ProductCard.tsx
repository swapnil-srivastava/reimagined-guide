'use client';

import Link from "next/link";
import { FormattedMessage } from "react-intl";
import moment from "moment";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

// CSS
import styles from "../styles/Admin.module.css";

// Components
import CurrencyPriceComponent from "./CurrencyPriceComponent";
import QuantityComponent from "./QuantityComponent";
import { useState } from "react";

// Post list to be used only with homepage
const ProductCard = ({  products,  loading = false, postsEnd = false, enableLoadMore = false, onQuantityChange }) => {

    const handleQuantityChange = (productId, newQuantity) => {
        const updatedProduct = products.find(product => product.id === productId);
        if (updatedProduct) {
            onQuantityChange({ ...updatedProduct, quantity: newQuantity });
        }
    };
    
    function generateContent(input) {
        if (!input) return;
        if (input.length > 18) {
            return input.substring(0, 18) + "...";
        }
        return input;
    }  

    return products ? products.map((product, index, array) => {
        const descriptionTrimmed = generateContent(product?.description);
        const nameTrimmed = generateContent(product?.name);
        const createdAtDateFormat = moment(product.created_at).isValid()
          ? moment(product.created_at).format("DD MMM YYYY")
          : moment(product.created_at?.toMillis()).format("DD MMM YYYY");

        return (<>
            {!loading &&
            !postsEnd &&
            enableLoadMore && (
                <>
                    <div className="flex h-96 lg:w-1/5 w-auto" key={product.id}>
                        <div className="flex h-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                            <div className="flex flex-col gap-2 justify-between">
                                {/* Product Image - TODO add the image url from the product list {product.imageUrl}*/} 
                                <div>
                                    <Image
                                            src={`/mountains.jpg`} 
                                            alt={product.name}
                                            width={300}
                                            height={300}
                                            className="rounded-lg"
                                        />
                                </div>

                                {/* Products Name, Price, Quantity, Add to Cart button */}
                                <div className="flex flex-col gap-2">
                                    {/* Product Name, Price and Quantity Section */}
                                    <div className="flex flex-col gap-1 text-2xl font-semibold">
                                        {/* Product Name */}
                                        <Link href={`/product-detail/${product.id}`} className="hover:underline underline-offset-2" >
                                            {nameTrimmed}
                                        </Link>
                                        {/* Price and Quantity */}
                                        <div className="flex flex-row justify-between">
                                            {/* Price */}
                                            <div className="text-sm">
                                                <CurrencyPriceComponent price={product.price}/>
                                            </div>

                                            {/* Quantity */}
                                            {/* Note: when the product.quantity should not coming the products but it should be handled in the website store integration pending */}
                                            <div>
                                                <QuantityComponent
                                                    quantity={product.quantity ?? 0}
                                                    onQuantityChange={(newQuantity) => handleQuantityChange(product.id, newQuantity)}
                                                >
                                                    {product.quantity ?? 0}
                                                </QuantityComponent>
                                            </div>
                                        </div>

                                        {/* Created At Date */}
                                        <div className="flex gap-1 text-xs self-start font-thin">
                                            <div>
                                                <FormattedMessage
                                                    id="product-card-created-at"
                                                    description="Created At" // Description should be a string literal
                                                    defaultMessage="Created at" // Message should be a string literal
                                                />
                                            </div>
                                            <div>{createdAtDateFormat}</div>
                                        </div>

                                    </div>

                                    {/* Add to Cart button section */}
                                    <div className="text-lg hover:text-xs flex items-center justify-end gap-2">
                                        <button className={styles.btnAdmin}>
                                            <FormattedMessage
                                                id="product-card-add-to-cart"
                                                description="Add to Cart" // Description should be a string literal
                                                defaultMessage="Add to Cart" // Message should be a string literal 
                                                />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
        )}
      )
    : <FormattedMessage
        id="product-card-no-products"
        description="Posts List End" // Description should be a string literal
        defaultMessage="No more products" // Message should be a string literal 
        />
 }

export default ProductCard;