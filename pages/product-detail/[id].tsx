import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { FormattedMessage, useIntl } from 'react-intl';
import { supaClient } from '../../supa-client';
import { PRODUCT } from '../../database.types';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartInsert } from '../../redux/actions/actions';
import { RootState } from '../../lib/interfaces/interface';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../components/Loader';
import Metatags from '../../components/Metatags';
import HeartButton from '../../components/ProductHeartButton';
import SimpleQuantityComponent from '../../components/SimpleQuantityComponent';
import CurrencyPriceComponent from '../../components/CurrencyPriceComponent';

// Define ProductWithQuantity interface for cart items
interface ProductWithQuantity extends PRODUCT {
  quantity: number;
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const intl = useIntl();
  const dispatch = useDispatch();
  
  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;
  
  const [product, setProduct] = useState<PRODUCT | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<PRODUCT[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      try {
        setLoading(true);
        setQuantity(1); // Reset quantity on product change
        
        const { data, error } = await supaClient
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProduct(data as PRODUCT);
          
          // Fetch related products (same category or by same creator)
          // First try to get products from the same user/creator
          let relatedQuery = supaClient
            .from('products')
            .select('*')
            .neq('id', id)
            .order('created_at', { ascending: false });
          
          // If we have user_id in the product, filter by that
          if (data.user_id) {
            relatedQuery = relatedQuery.eq('user_id', data.user_id);
          }
          
          const { data: relatedData, error: relatedError } = await relatedQuery.limit(4);
            
          if (!relatedError && relatedData && relatedData.length > 0) {
            setRelatedProducts(relatedData as PRODUCT[]);
          } else {
            // If no related products by same user, just get other products
            const { data: otherProducts, error: otherError } = await supaClient
              .from('products')
              .select('*')
              .neq('id', id)
              .limit(4);
              
            if (!otherError && otherProducts) {
              setRelatedProducts(otherProducts as PRODUCT[]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(
          intl.formatMessage({
            id: 'product-detail-fetch-error',
            description: 'Error fetching product',
            defaultMessage: 'Failed to load product details. Please try again.'
          })
        );
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [id, intl]);

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      // Dispatch action to add to cart
      // Clone the product object and add the quantity property
      const productWithQuantity: ProductWithQuantity = {
        ...product,
        quantity // Add quantity to the product for the cart
      };
      
      dispatch(addToCartInsert(productWithQuantity));
      
      toast.success(
        intl.formatMessage({
          id: 'product-detail-added-to-cart',
          description: 'Product added to cart',
          defaultMessage: 'Added to cart!'
        }),
        {
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
    } catch (error) {
      toast.error(
        intl.formatMessage({
          id: 'product-detail-add-to-cart-error',
          description: 'Add to cart error',
          defaultMessage: 'Failed to add item to cart. Please try again.'
        })
      );
    } finally {
      setTimeout(() => setAddingToCart(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader show={true} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="text-2xl font-semibold mb-4 dark:text-blog-white text-blog-black">
          <FormattedMessage
            id="product-detail-not-found"
            description="Product not found"
            defaultMessage="Product not found"
          />
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          <FormattedMessage
            id="product-detail-not-found-description"
            description="Product not found description"
            defaultMessage="The product you are looking for doesn't exist or has been removed."
          />
        </p>
        <button
          onClick={() => router.push('/products')}
          className="bg-hit-pink-500 text-blog-black rounded-lg px-4 py-2 transition-filter duration-500 hover:filter hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2 text-sm font-semibold flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <FormattedMessage
            id="product-detail-back-to-products"
            description="Back to products button"
            defaultMessage="Back to Products"
          />
        </button>
      </div>
    );
  }

  return (
    <>
      <Metatags 
        title={product.name || 'Product Detail'} 
        description={product.description || 'Product details'} 
        image={product.image_url || '/mountains.jpg'}
      />

      <div className="bg-blog-white dark:bg-fun-blue-500 min-h-screen">
        {/* Back button */}
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-blog-black dark:text-gray-300 dark:hover:text-blog-white transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
            <FormattedMessage
              id="product-detail-back"
              description="Back button"
              defaultMessage="Back"
            />
          </button>

          <div className="bg-white dark:bg-fun-blue-600 rounded-3xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image */}
              <div className="relative h-[400px] md:h-[500px] bg-gray-100 dark:bg-fun-blue-700">
                <Image
                  src={product.image_url || '/mountains.jpg'}
                  alt={product.name || 'Product image'}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <HeartButton product={product} />
                </div>
                
                {/* Stock badge */}
                <span className={`absolute left-4 top-4 text-xs font-medium px-3 py-1 rounded-full shadow-lg ${
                  (!product?.stock || product?.stock <= 0) 
                    ? "bg-red-500 text-white" 
                    : "bg-green-500 text-white"
                }`}>
                  {(!product?.stock || product?.stock <= 0) ? (
                    <FormattedMessage
                      id="product-detail-out-of-stock"
                      description="Out of stock badge"
                      defaultMessage="Out of Stock"
                    />
                  ) : (
                    <FormattedMessage
                      id="product-detail-in-stock"
                      description="In stock badge"
                      defaultMessage="In Stock"
                    />
                  )}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-6 md:p-8 flex flex-col">
                <h1 className="text-2xl md:text-3xl font-semibold text-blog-black dark:text-blog-white">
                  {product.name}
                </h1>
                
                <div className="mt-2 text-xl font-semibold text-hit-pink-500 dark:text-hit-pink-400">
                  <CurrencyPriceComponent price={product.price} />
                </div>
                
                <div className="my-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </div>
                
                {/* Divider */}
                <hr className="border-gray-200 dark:border-fun-blue-700 my-6" />
                
                {/* Quantity Selection */}
                {(product?.stock > 0) && (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <FormattedMessage
                            id="product-detail-quantity"
                            description="Quantity label"
                            defaultMessage="Quantity"
                          />
                        </label>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mr-1.5"></span>
                          <FormattedMessage
                            id="product-detail-stock-count"
                            description="Available in stock"
                            defaultMessage="{count} available"
                            values={{ count: product.stock }}
                          />
                        </div>
                      </div>
                      
                      <SimpleQuantityComponent 
                        quantity={quantity} 
                        setQuantity={setQuantity} 
                        maxQuantity={product.stock} 
                      />
                      
                      {/* Stock level indicator */}
                      <div className="mt-4 w-full">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>
                            <FormattedMessage
                              id="product-detail-stock-level"
                              description="Stock level"
                              defaultMessage="Stock Level"
                            />
                          </span>
                          <span>{Math.min(100, Math.round((product.stock / 100) * 100))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-fun-blue-700 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, Math.round((product.stock / 100) * 100))}%`,
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || !product.stock || product.stock <= 0}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 text-white rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md w-full mt-auto"
                    >
                      {addingToCart ? (
                        <>
                          <FontAwesomeIcon icon={faCheck} className="text-sm" />
                          <FormattedMessage
                            id="product-detail-added"
                            description="Added to cart"
                            defaultMessage="Added!"
                          />
                        </>
                      ) : !product.stock || product.stock <= 0 ? (
                        <>
                          <FontAwesomeIcon icon={faCircleXmark} className="text-sm" />
                          <FormattedMessage
                            id="product-detail-out-of-stock"
                            description="Out of stock"
                            defaultMessage="Out of Stock"
                          />
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
                          <FormattedMessage
                            id="product-detail-add-to-cart"
                            description="Add to cart button"
                            defaultMessage="Add to Cart"
                          />
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 mb-8">
              <h2 className="text-xl font-semibold mb-6 text-blog-black dark:text-blog-white">
                <FormattedMessage
                  id="product-detail-related-products"
                  description="Related products heading"
                  defaultMessage="You might also like"
                />
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div 
                    key={relatedProduct.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      // Use shallow routing to prevent full page reload
                      // This will update the URL but not remount the component
                      router.push(`/product-detail/${relatedProduct.id}`, undefined, { shallow: false });
                    }}
                  >
                    <div className="bg-white dark:bg-fun-blue-600 dark:text-blog-white rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:-translate-y-1 hover:brightness-125 hover:shadow-xl">
                      <div className="relative h-48">
                        <Image
                          src={relatedProduct.image_url || '/mountains.jpg'}
                          alt={relatedProduct.name || 'Related product image'}
                          fill
                          className="object-cover"
                        />
                        <span className={`absolute left-3 top-3 text-xs font-medium px-2 py-1 rounded-md shadow-lg ${
                          (!relatedProduct?.stock || relatedProduct?.stock <= 0) 
                            ? "bg-red-500 text-white" 
                            : "bg-green-500 text-white"
                        }`}>
                          {(!relatedProduct?.stock || relatedProduct?.stock <= 0) ? (
                            <FormattedMessage
                              id="product-card-out-of-stock"
                              description="Out of Stock"
                              defaultMessage="Out of Stock"
                            />
                          ) : (
                            <FormattedMessage
                              id="product-card-in-stock"
                              description="In stock"
                              defaultMessage="In Stock"
                            />
                          )}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-blog-black dark:text-blog-white line-clamp-1">
                          {relatedProduct.name}
                        </h3>
                        <div className="mt-1 text-hit-pink-500 dark:text-hit-pink-400 font-medium">
                          <CurrencyPriceComponent price={relatedProduct.price} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
