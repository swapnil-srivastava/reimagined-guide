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
        <div className="flex flex-row items-center gap-2">
            {/* Minus Button */}
            <FontAwesomeIcon icon={faCircleMinus} size="xl" onClick={decrement} className="cursor-pointer"/>
            {/* Quantity */}
            <div className="text-sm">
              {children}
            </div>
            {/* Plus Button */}
            <FontAwesomeIcon icon={faCirclePlus} size="xl" onClick={increment} className="cursor-pointer"/>
        </div>
      </>
    );
  };
  
  export default QuantityComponent;