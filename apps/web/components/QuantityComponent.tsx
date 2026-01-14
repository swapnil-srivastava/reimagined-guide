'use client'

import React from 'react';
import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from 'react-redux';
import { addToCartProductQuantityDec, addToCartProductQuantityInc } from '../redux/actions/actions';
import { PRODUCT } from '../database.types';

export interface ProductWithQuantity extends PRODUCT {
  quantity: number;
}

interface QuantityComponentProps {
  product: ProductWithQuantity
  children : React.ReactNode
}

const QuantityComponent: React.FC<QuantityComponentProps> = ({ product, children })  => {

    const dispatch = useDispatch();

    const increment = () => {
      if (!isNaN(product && product.quantity)) {
        dispatch(addToCartProductQuantityInc(product));
      }
    }

    const decrement = () => {
      if (!isNaN(product && product.quantity) && (product && product.quantity) > 0) {
        dispatch(addToCartProductQuantityDec(product));
      }
    }

    return (
      <>
        <div className="flex flex-row items-center gap-3">
            {/* Minus Button */}
            <button
              onClick={decrement}
              className="w-8 h-8 bg-gray-100 dark:bg-fun-blue-600 hover:bg-gray-200 dark:hover:bg-fun-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 text-gray-600 dark:text-white"
            >
              <FontAwesomeIcon icon={faCircleMinus} className="w-4 h-4" />
            </button>
            
            {/* Quantity */}
            <div className="min-w-[2rem] text-center bg-blog-white dark:bg-fun-blue-700 text-blog-black dark:text-blog-white px-3 py-1 rounded-lg font-medium text-sm border border-gray-200 dark:border-fun-blue-500">
              {children}
            </div>
            
            {/* Plus Button */}
            <button
              onClick={increment}
              className="w-8 h-8 bg-gray-100 dark:bg-fun-blue-600 hover:bg-gray-200 dark:hover:bg-fun-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 text-gray-600 dark:text-white"
            >
              <FontAwesomeIcon icon={faCirclePlus} className="w-4 h-4" />
            </button>
        </div>
      </>
    );
  };
  
  export default QuantityComponent;