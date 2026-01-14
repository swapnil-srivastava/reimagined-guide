import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import FavoriteButton from "./FavoriteButton";
import CurrencyPriceComponent from "./CurrencyPriceComponent";
import ProductQuickView from "./ProductQuickView";

interface ProductCardProps {
  product: any;
  showFavoriteButton?: boolean;
  onFavoriteToggle?: () => void;
}

// ProductCardWithFavorites is a wrapper component that adds favorite functionality to the original ProductCard
const ProductCardWithFavorites = ({ product, showFavoriteButton = false, onFavoriteToggle }: ProductCardProps) => {
  console.log('ProductCardWithFavorites received product:', product);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  
  // Handle case where product data is missing or undefined
  if (!product) {
    console.warn('ProductCardWithFavorites received null or undefined product');
    return (
      <div className="w-full pb-5 rounded-3xl shadow-lg overflow-visible bg-gray-100 dark:bg-fun-blue-700 p-4">
        <p className="text-center text-gray-500 dark:text-gray-400">Product data unavailable</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-5 rounded-3xl shadow-lg overflow-visible group transition-transform duration-200 hover:shadow-xl hover:scale-[1.02]">
      <div className="relative w-full h-64 bg-gray-200 dark:bg-fun-blue-700 rounded-t-3xl overflow-hidden">
        {/* Image */}
        <Link href={`/product-detail/${product.id}`} passHref>
          <div className="w-full h-full cursor-pointer">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                layout="fill"
                objectFit="cover"
                className="transition-all duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-fun-blue-800">
                <span className="text-gray-500 dark:text-gray-400">
                  <FormattedMessage
                    id="product-card-no-image"
                    description="Text shown when product has no image"
                    defaultMessage="No image available"
                  />
                </span>
              </div>
            )}
          </div>
        </Link>
        
        {/* Favorite button */}
        {showFavoriteButton && (
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton productId={product.id} />
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white dark:bg-fun-blue-600">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blog-black dark:text-blog-black truncate">
            {product.name}
          </h3>
          <CurrencyPriceComponent price={product.price} />
        </div>
        
        <p className="text-gray-600 dark:text-blog-black text-sm mb-4 line-clamp-2 h-10">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <button
            onClick={() => setQuickViewOpen(true)}
            className="text-fun-blue-500 dark:text-blog-black hover:underline text-sm"
          >
            <FormattedMessage
              id="product-card-quick-view"
              description="Button to view product details"
              defaultMessage="Quick view"
            />
          </button>
          
          <button className="w-10 h-10 bg-fun-blue-300 dark:bg-fun-blue-300 dark:text-blog-black rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125">
            <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
          </button>
        </div>
      </div>
      
      {/* Quick view modal */}
      <ProductQuickView 
        isOpen={quickViewOpen} 
        onRequestClose={() => setQuickViewOpen(false)} 
        product={product} 
      />
    </div>
  );
};

export default ProductCardWithFavorites;
