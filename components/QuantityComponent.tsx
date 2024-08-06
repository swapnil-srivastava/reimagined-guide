'use client'

import React from 'react';
import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from 'react-redux';
import { addToStoreProductQuantityDec, addToStoreProductQuantityInc } from '../redux/actions/actions';
import { PRODUCT } from '../database.types';

interface QuantityComponentProps {
  quantity: number | string;
  product: PRODUCT
  onQuantityChange: (newQuantity: number | string) => void;
  children : React.ReactNode
}

const QuantityComponent: React.FC<QuantityComponentProps> = ({ quantity, product, onQuantityChange, children })  => {

    const dispatch = useDispatch();

    const increment = () => {
      let currentQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
      if (!isNaN(currentQuantity)) {
        dispatch(addToStoreProductQuantityInc(product))
        onQuantityChange((currentQuantity + 1).toString());
      }
    }

    const decrement = () => {
      let currentQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
      if (!isNaN(currentQuantity) && currentQuantity > 0) {
        dispatch(addToStoreProductQuantityDec(product))
        onQuantityChange((currentQuantity - 1).toString());
      }
    }

    return (
      <>
        <div className="flex flex-row items-center gap-2">
            {/* Minus Button */}
            <FontAwesomeIcon icon={faCircleMinus} size="2xs" onClick={decrement} className="cursor-pointer"/>
            {/* Quantity */}
            <div className="text-sm">
              {children}
            </div>
            {/* Plus Button */}
            <FontAwesomeIcon icon={faCirclePlus} size="2xs" onClick={increment} className="cursor-pointer"/>
        </div>
      </>
    );
  };
  
  export default QuantityComponent;