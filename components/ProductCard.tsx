'use client';

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { FormattedMessage, useIntl } from "react-intl";
import moment from "moment";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleXmark, faEye, faPlus, faCheck, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

// Supabase
import { supaClient } from "../supa-client";

// CSS
import styles from "../styles/Admin.module.css";

// Components
import CurrencyPriceComponent from "./CurrencyPriceComponent";
import ProductQuickView from "./ProductQuickView";

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
    const intl = useIntl();

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
          toast.error(intl.formatMessage({
            id: "productcard-error-uploading-image",
            description: "Error uploading image",
            defaultMessage: "Error uploading image: {error}"
          }, { error: error.message }));
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
    
            toast.success(intl.formatMessage({
                id: "productcard-product-created",
                description: "Product Created!!",
                defaultMessage: "Product Created!!"
            }));
          } catch (error) {
            toast.error(intl.formatMessage({
              id: "productcard-error-creating-product",
              description: "Error creating product",
              defaultMessage: "Error creating product: {error}"
            }, { error: error.message }));
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
    const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
    const [quickViewOpen, setQuickViewOpen] = useState<boolean>(false);
    const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({});
    const intl = useIntl();

    const handleAddProduct = (product: PRODUCT) => {
        // Set loading state for this specific product
        setAddingToCart(prev => ({ ...prev, [product.id]: true }));
        
        dispatch(addToCartInsert(product));
        
        // Show success toast with product name
        toast.success(
            intl.formatMessage({
                id: "product-card-added-to-cart-toast",
                description: "Product added to cart toast",
                defaultMessage: "{productName} added to cart!"
            }, { productName: product.name }),
            {
                duration: 2000,
                position: 'bottom-center',
                style: {
                    background: '#10B981',
                    color: '#fff',
                    fontWeight: '500',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                }
            }
        );
        
        // Reset loading state after a brief delay to show success animation
        setTimeout(() => {
            setAddingToCart(prev => ({ ...prev, [product.id]: false }));
        }, 1000);
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
            {/* Loading state */}
            {loading && (
                <div className="w-full flex justify-center items-center py-8">
                    <div className="text-sm text-gray-500">Loading products...</div>
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full px-4 sm:px-6 lg:px-8">
                {Array.isArray(products) && products.map((product: PRODUCT) => {
                    const descriptionTrimmed = generateContent(product?.description);
                    const nameTrimmed = generateContent(product?.name);
                    let createdAtDateFormat = '';
                    try {
                        if (product?.created_at) {
                            // created_at might be a string, number, or Firestore-like Timestamp with toMillis
                            const raw = product.created_at as any;
                            const candidate = typeof raw === 'object' && typeof raw.toMillis === 'function' ? raw.toMillis() : raw;
                            createdAtDateFormat = moment(candidate).isValid() ? moment(candidate).format("DD MMM YYYY") : '';
                        }
                    } catch (e) {
                        createdAtDateFormat = '';
                    }

                    return (
                        <div key={product.id} className="w-full">
                            <article className="relative group flex flex-col bg-blog-white dark:bg-fun-blue-500 dark:text-blog-white rounded-3xl drop-shadow-lg overflow-hidden hover:scale-[1.01] transition-transform">
                                <div className="w-full h-48 relative overflow-hidden">
                                <Image
                                    src={product.image_url ?? `/mountains.jpg`}
                                    alt={product.name ?? 'product image'}
                                    fill={false}
                                    width={500}
                                    height={500}
                                    className="object-cover w-full h-48"
                                />
                                {/* Badge */}
                                {(product?.stock === 0 || product?.stock === null) ? (
                                    <span className="absolute left-3 top-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-lg z-20">Out of stock</span>
                                ) : (product as any)?.isNew || new Date(product?.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) ? (
                                    <span className="absolute left-3 top-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-lg z-20">New</span>
                                ) : null}
                                {/* Quick view */}
                                <button 
                                    aria-label="Quick view" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setQuickViewProduct(product); 
                                        setQuickViewOpen(true);
                                    }} 
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className="absolute right-3 top-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20 active:bg-gray-100 dark:active:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 touch-manipulation md:hover:bg-gray-100 md:dark:hover:bg-gray-700"
                                >
                                    <FontAwesomeIcon icon={faCirclePlus} className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        <Link href={`/product-detail/${product.id}`} className="hover:underline underline-offset-2">
                                            {nameTrimmed}
                                        </Link>
                                    </h3>
                                    {descriptionTrimmed && <p className="mt-2 text-sm text-gray-600 dark:text-blog-white">{descriptionTrimmed}</p>}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm">
                                        <CurrencyPriceComponent price={product.price} />
                                    </div>
                                    <div className="text-xs text-gray-400">{createdAtDateFormat}</div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button 
                                        aria-label={`Add ${product.name} to cart`} 
                                        className={`
                                            py-2 px-4 
                                            font-medium text-sm 
                                            bg-hit-pink-500 
                                            text-white 
                                            border border-hit-pink-500 
                                            rounded-lg 
                                            flex items-center gap-2 
                                            transition-colors duration-200 
                                            active:bg-hit-pink-600 
                                            focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            touch-manipulation
                                            ${addingToCart[product.id] ? 'bg-green-600 border-green-600' : 'md:hover:bg-hit-pink-600 md:hover:border-hit-pink-600'}
                                        `}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddProduct(product);
                                        }}
                                        onTouchEnd={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        disabled={addingToCart[product.id]}
                                    >
                                        {addingToCart[product.id] ? (
                                            <>
                                                <FontAwesomeIcon icon={faCheck} className="text-sm" />
                                                <FormattedMessage id="product-card-added" description="Added!" defaultMessage="Added!" />
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
                                                <FormattedMessage id="product-card-add-to-cart" description="Add to Cart" defaultMessage="Add to Cart" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                    );
                })}

                {/* Create Product Card as one grid item */}
                <div className="w-full">
                    <div className="flex items-center justify-center bg-blog-white dark:bg-fun-blue-500 dark:text-blog-white rounded-3xl drop-shadow-lg p-4">
                        <div className="flex flex-col gap-2 justify-center items-center">
                            <FontAwesomeIcon 
                                icon={faCirclePlus} 
                                size="3x" 
                                className="cursor-pointer touch-manipulation" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCreateProduct(!createProduct);
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            />
                            <div className="text-lg">
                                <FormattedMessage id="product-card-create-product" description="Create Product" defaultMessage="Create Product" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Product Form (expanded) */}
                {createProduct && (
                    <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 w-full">
                        <div className="w-full p-4 bg-blog-white dark:bg-fun-blue-500 dark:text-blog-white rounded-3xl drop-shadow-lg">
                            <div className="flex justify-end">
                                <FontAwesomeIcon 
                                    icon={faCircleXmark} 
                                    className="cursor-pointer touch-manipulation" 
                                    size="lg" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCreateProduct(!createProduct);
                                    }}
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                />
                            </div>
                            <CreateProduct />
                        </div>
                    </div>
                )}

                {/* Quick view modal */}
                <ProductQuickView isOpen={quickViewOpen} onRequestClose={() => setQuickViewOpen(false)} product={quickViewProduct} />
            </div>
        </>
    );

};

export default ProductCard;