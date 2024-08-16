'use client';

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
import moment from "moment";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

// Supabase
import { supaClient } from "../supa-client";

// CSS
import styles from "../styles/Admin.module.css";

// Components
import CurrencyPriceComponent from "./CurrencyPriceComponent";

// Product Schema
import schema from "../lib/product/productSchema.json";
import uischema from "../lib/product/uiProductSchema.json";

// Local Interface
import { PRODUCT } from "../database.types";
import { RootState } from "../lib/interfaces/interface";

// JSON Forms
import { JsonForms } from "@jsonforms/react";

// importing material for JSON Forms
import {
    materialCells,
    materialRenderers,
  } from "@jsonforms/material-renderers";

// Redux 
import { addToCartDelete, addToCartInsert } from '../redux/actions/actions';

interface producJSON {
    product_name: string;
    product_decription: string;
    product_price: number;
    product_stock: number;
}
  
function CreateProduct() {

    type PRODUCT_OBJ = Pick<PRODUCT, "name" | "price" | "description" | "stock">;
    type PRODUCTNAME = PRODUCT_OBJ["name"];
    type PRODUCTDESCRIPTION = PRODUCT_OBJ["description"];
    type PRODUCTPRICE = PRODUCT_OBJ["price"];
    type PRODUCTSTOCK = PRODUCT_OBJ["stock"];

    const selectUser = (state: RootState) => state.users;
    const { userInfo } = useSelector(selectUser);
    const { profile, session } = userInfo;

    const [data, setData] = useState<producJSON>();
    const [imageFile, setImageFile] = useState<File | null>(null);

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

      const uploadImage = async (): Promise<string | null> => {
        if (!imageFile || !profile?.id) return null;
    
        const fileName = `${profile.id}/${imageFile.name}`;

        const { data, error } = await supaClient.storage
          .from("product-images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });
        
        if (error) {
          console.error("Image upload error:", error.message);
          toast.error(`Error uploading image: ${error.message}`);
          return null;
        }
    
        // Get the public URL for the uploaded image
        const { data: publicUrlData } = supaClient.storage
            .from("product-images")
            .getPublicUrl(fileName);
    
        return publicUrlData.publicUrl;
      };

    // Create a new product in supabase postgres
    const createProduct = async () => {
        try {
            if (!data?.product_decription && !data?.product_name && !data?.product_price && !data.product_stock) return;

            const imageUrl = await uploadImage();
            
            const { data: supaData, error } = await supaClient
            .from("products")
            .insert([
                {
                    name: data?.product_name,
                    description: data?.product_decription,
                    price: data?.product_price,
                    stock: data?.product_stock,
                    user_id: profile?.id,  
                    image_url: imageUrl,
                },
            ]);
    
            if (error) {
              throw error;
            }
    
            toast.success("Product Created!!");
          } catch (error) {
            toast.error(`Error creating product: ${error.message}`);
          } finally {

          }
    };

    const clearProduct = async (e : React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        clearData();
    };

    return (
        <>
            <div className="flex flex-col gap-2 my-2 px-4 py-2 text-blog-black dark:bg-blog-white">
                <JsonForms
                    schema={schema}
                    uischema={uischema}
                    data={data}
                    renderers={materialRenderers}
                    cells={materialCells}
                    onChange={({ errors, data }) => setData(data)}
                />

                {/* Upload the image */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
                        Upload Product Image
                    </label>
                    <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                        className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                </div>

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
const ProductCard = ({  products,  loading = false, postsEnd = false, enableLoadMore = false }) => {

    const dispatch = useDispatch();

    const [ createProduct, setCreateProduct] = useState<boolean>(false);

    const handleAddProduct = (product: PRODUCT) => {
        dispatch(addToCartInsert(product));
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
                                <div className="flex lg:w-1/5 w-auto" key={product.id}>
                                    <div className="flex h-full p-4 hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                                        <div className="flex flex-col gap-2 justify-between">
                                            <div>
                                                <Image
                                                        src={product.image_url ?? `/mountains.jpg`} 
                                                        alt={product.name}
                                                        width={500}
                                                        height={500}
                                                        className="rounded-lg"
                                                    />
                                            </div>

                                            {/* Products Name, Price, Add to Cart button */}
                                            <div className="flex flex-col gap-2">
                                                {/* Product Name, Price */}
                                                <div className="flex flex-col gap-1 text-2xl font-semibold">
                                                    {/* Product Name */}
                                                    <Link href={`/product-detail/${product.id}`} className="hover:underline underline-offset-2" >
                                                        {nameTrimmed}
                                                    </Link>
                                                    {/* Price */}
                                                    <div className="flex flex-row justify-between">
                                                        {/* Price */}
                                                        <div className="text-sm">
                                                            <CurrencyPriceComponent price={product.price}/>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Add to Cart button section */}
                                                <div className="text-lg hover:text-xs flex items-center justify-end gap-2">
                                                    <button className={styles.btnAdmin} onClick={() => handleAddProduct(product)}>
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
            : <></> 
            // no more products
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
            <div className="flex lg:w-1/5 h-auto w-auto">
                <div className="flex h-full w-full p-4 justify-center items-center hover:px-5 lg:mx-0 mx-3 bg-blog-white dark:bg-fun-blue-600 dark:text-blog-white hover:rounded-3xl rounded-3xl drop-shadow-lg hover:drop-shadow-xl hover:brightness-125">
                    <div className="flex flex-col justify-center items-center">
                        <FontAwesomeIcon icon={faCircleXmark} className="cursor-pointer self-end pt-2" size="lg" onClick={() => setCreateProduct(!createProduct)}/>
                        <CreateProduct />
                    </div>
                </div>
            </div>
            }
        </>
    )
    
 }

export default ProductCard;