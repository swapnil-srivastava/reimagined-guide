'use client';

import Link from "next/link";
import { FormattedMessage } from "react-intl";
import moment from "moment";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import styles from "../styles/Admin.module.css";

// Post list to be used only with homepage
const ProductCard = ({  products,  loading = false, postsEnd = false, enableLoadMore = false }) => {
    
    function generateContent(input) {
        if (!input) return;
        if (input.length > 25) {
            return input.substring(0, 25) + "...";
        }
        return input;
    }  

    return products ? products.map((product, index, array) => {
        const descriptionTrimmed = generateContent(product?.description);
        const nameTrimmed = generateContent(product?.name);
        const dateFormat = moment(product.created_at).isValid()
          ? moment(product.created_at).format("DD MMM YYYY")
          : moment(product.created_at?.toMillis()).format("DD MMM YYYY");

        return (<>
            {!loading &&
            !postsEnd &&
            enableLoadMore && (
                <>
                    <Link className="flex h-96 lg:w-1/5 w-auto" href={`/${product.username}/${product.slug}`} key={product.id}>
                        <div className="flex h-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                            <div className="flex flex-col gap-2 justify-between">
                                {/* DATE and Author */}
                                <div>
                                    {/* author image and author name */}
                                    <div className="flex items-center gap-2">

                                        {/* DATE Div */}
                                        <div className="flex gap-1 self-start">
                                            {/* Author Name */}
                                            <div className="self-start hover:underline">
                                                <Link href={`/${product.username}`}>{`${product.username}`}</Link>
                                            </div>                                      
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {/* Post Title */}
                                    <div className="flex flex-col text-2xl font-semibold " >
                                        <Link href={`/${product.username}/${product.slug}`} className="hover:underline underline-offset-2" >
                                            {nameTrimmed}
                                        </Link>
                                        <div className="flex gap-2 text-xs self-end font-thin">
                                            <div>
                                                <FormattedMessage
                                                    id="product-card-pub"
                                                    description="Products" // Description should be a string literal
                                                    defaultMessage="Products" // Message should be a string literal
                                                />
                                            </div>
                                            <div>{dateFormat}</div>
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
                    </Link>
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