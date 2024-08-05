'use client';

import { useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
import moment from "moment";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

// Supabase
import { supaClient } from "../supa-client";

// CSS
import styles from "../styles/Admin.module.css";

// Components
import CurrencyPriceComponent from "./CurrencyPriceComponent";
import QuantityComponent from "./QuantityComponent";

// Product Schema
import schema from "../lib/product/productSchema.json";
import uischema from "../lib/product/uiProductSchema.json";

// Local Interface
import { PRODUCTS } from "../database.types";
import { RootState } from "../lib/interfaces/interface";

// JSON Forms
import { JsonForms } from "@jsonforms/react";

import {
    materialCells,
    materialRenderers,
  } from "@jsonforms/material-renderers";

interface producJSON {
    product_name: string;
    product_decription: string;
    product_price: number;
    product_stock: number;
}
  
function CreateProduct() {

    type PRODUCT_OBJ = Pick<PRODUCTS, "name" | "price" | "description" | "stock">;
    type PRODUCTNAME = PRODUCT_OBJ["name"];
    type PRODUCTDESCRIPTION = PRODUCT_OBJ["description"];
    type PRODUCTPRICE = PRODUCT_OBJ["price"];
    type PRODUCTSTOCK = PRODUCT_OBJ["stock"];

    const selectUser = (state: RootState) => state.users;
    const { userInfo } = useSelector(selectUser);
    const { profile, session } = userInfo;

    const [data, setData] = useState<producJSON>();

    const clearData = () => {
        setData({
            product_name: "",
            product_decription: "",
            product_price: undefined,
            product_stock: undefined,
        });
    };

    // Validate length
    const isValidProductName =
        data?.product_name?.length > 2 && data?.product_name?.length < 30;

    // Validate length
    const isValidProductDescription =
        data?.product_decription?.length > 2 && data?.product_decription?.length < 200;

    // Validate Number
    const isValidProductPrice = (price: string): boolean => {
        // Check if price is numeric
        if (!/^\d+(\.\d{1,2})?$/.test(price)) {
          return false;
        }
      
        // Convert price to a number
        const priceValue = parseFloat(price);
      
        // Validate if price is greater than 0 and has valid length
        return priceValue > 0 && price.length >= 3 && price.length <= 10;
    }
      

    // Validate Number
    const isValidProductStock = (stock: string): boolean => {
        // Check if stock is numeric
        if (!/^\d+$/.test(stock)) {
          return false;
        }
      
        // Convert stock to a number
        const stockValue = parseInt(stock, 10);
      
        // Validate if stock is a positive integer
        return stockValue > 0 && stock.length <= 10;
      }

    // Create a new product in supabase postgres
    const createProduct = async () => {
        if (!data?.product_decription && !data?.product_name && !data?.product_price && !data.product_stock) return;

        // Tip: give all fields a default value here
        const { data: supaData, error } = await supaClient
            .from("products")
            .insert([
                {
                    name: data?.product_name,
                    description: data?.product_decription,
                    price: data?.product_price,
                    stock: data?.product_stock,
                    user_id: profile?.id,
                },
            ]);

        toast.success("Product Created!!");
    };

    const clearProduct = async (e) => {
        e.preventDefault();
        clearData();
    };

    return (
        <>
            <div className="flex flex-col gap-2 my-4 px-4 py-2 text-blog-black dark:bg-blog-white">
                <JsonForms
                    schema={schema}
                    uischema={uischema}
                    data={data}
                    renderers={materialRenderers}
                    cells={materialCells}
                    onChange={({ errors, data }) => setData(data)}
                />

                {/* Button Section */}
                <div className="flex self-center gap-2">
                    <button type="submit"
                        disabled={!isValidProductName && !isValidProductDescription}
                        className={styles.btnAdmin}
                        onClick={() => createProduct()}>
                        <FormattedMessage
                            id="create-product-create-btn"
                            description="Create" // Description should be a string literal
                            defaultMessage="Create" // Message should be a string literal
                        />
                    </button>
                    <button className={styles.btnAdmin} type="button" onClick={clearProduct}>
                        <FormattedMessage
                            id="create-product-cancel-btn"
                            description="Cancel" // Description should be a string literal
                            defaultMessage="Cancel" // Message should be a string literal
                        />
                    </button>
                </div>
            </div>
        </>
    );
}

// Product list to be used only with products page
const ProductCard = ({  products,  loading = false, postsEnd = false, enableLoadMore = false, onQuantityChange }) => {

    const [ createProduct, setCreateProduct] = useState<boolean>(false);

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

    return (
        <>
            {
                products ? products.map((product, index, array) => {
                const descriptionTrimmed = generateContent(product?.description);
                const nameTrimmed = generateContent(product?.name);
                const createdAtDateFormat = moment(product.created_at).isValid()
                ? moment(product.created_at).format("DD MMM YYYY")
                : moment(product.created_at?.toMillis()).format("DD MMM YYYY");

                return (
                    <>
                        {!loading &&
                        !postsEnd &&
                        enableLoadMore && (
                            <>
                                <div className="flex lg:h-96 h-auto lg:w-1/5 w-auto" key={product.id}>
                                    <div className="flex h-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                                        <div className="flex flex-col gap-2 justify-between">
                                            {/* Product Image - TODO add the image url from the product list {product.imageUrl}*/} 
                                            <div>
                                                <Image
                                                        src={`/mountains.jpg`} 
                                                        alt={product.name}
                                                        width={500}
                                                        height={500}
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
                )
                }
            )
            : <FormattedMessage
                id="product-card-no-products"
                description="Posts List End" // Description should be a string literal
                defaultMessage="No more products" // Message should be a string literal 
                />
            }

            {/* Create Product Card */}
            <div className="flex lg:h-96 lg:w-1/5 h-auto w-auto">
                <div className="flex h-full w-full justify-center items-center p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                    <div className="flex flex-col gap-2 justify-center items-center">
                        <FontAwesomeIcon icon={faCirclePlus} size="3x" className="cursor-pointer" onClick={() => setCreateProduct(!createProduct)}/>
                        <div className="text-lg">
                        <FormattedMessage
                            id="product-card-create-product"
                            description="Create Product"
                            defaultMessage="Create Product"
                        />
                        </div>
                    </div>
                </div>
            </div>

            {createProduct && 
            <div className="flex lg:h-96 lg:w-1/5 h-auto w-auto">
                <div className="flex h-full w-full p-4 justify-center items-center hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                    <div className="flex flex-col gap-2 justify-center items-center">
                        <CreateProduct />
                    </div>
                </div>
            </div>
            }
        </>
    )
    
 }

export default ProductCard;