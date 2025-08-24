'use client'

import React from 'react';
import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SimpleQuantityComponentProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxQuantity?: number;
}

const QuantityComponent: React.FC<SimpleQuantityComponentProps> = ({ quantity, setQuantity, maxQuantity = 999 }) => {
    const increment = () => {
      if (quantity < maxQuantity) {
        setQuantity(quantity + 1);
      }
    }

    const decrement = () => {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }

    return (
      <div className="flex flex-row items-center gap-3 max-w-[200px]">
          {/* Minus Button */}
          <button
            onClick={decrement}
            disabled={quantity <= 1}
            className="w-10 h-10 bg-fun-blue-300 hover:bg-fun-blue-400 dark:bg-fun-blue-600 dark:hover:bg-fun-blue-500 rounded-full flex items-center justify-center transition-all duration-200 text-blog-black dark:text-blog-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-fun-blue-400 focus:ring-offset-2"
          >
            <FontAwesomeIcon icon={faCircleMinus} className="w-4 h-4" />
          </button>
          
          {/* Quantity */}
          <div className="flex-grow text-center bg-white dark:bg-fun-blue-700 text-blog-black dark:text-blog-white px-3 py-2 rounded-lg font-medium text-base border border-gray-200 dark:border-fun-blue-600 shadow-inner">
            {quantity}
          </div>
          
          {/* Plus Button */}
          <button
            onClick={increment}
            disabled={quantity >= maxQuantity}
            className="w-10 h-10 bg-hit-pink-500 hover:bg-hit-pink-600 dark:bg-hit-pink-600 dark:hover:bg-hit-pink-700 rounded-full flex items-center justify-center transition-all duration-200 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2"
          >
            <FontAwesomeIcon icon={faCirclePlus} className="w-4 h-4" />
          </button>
      </div>
    );
}

export default QuantityComponent;
