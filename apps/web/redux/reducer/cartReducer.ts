import * as types from '../actions/types';
import { PRODUCT_INITIAL_QUANTITY, PRODUCT_QUANTITY_INCREMENT, PRODUCT_QUANTITY_DECREMENT } from '../../lib/library';

// INITIAL STATE USER 
export const initialStoreState = {
   cartItems: []
}

// CART REDUCER
export const cartReducer = (state = initialStoreState, { type, product }) => {
  switch (type) {
    case types.ADD_TO_CART_INSERT: {
        const existingProduct = state && state.cartItems && state.cartItems.find(item => item.id === product.id);

        if (existingProduct) {
          // If product exists, add the new quantity to the existing quantity
          const quantityToAdd = product.quantity || 1;
          return {
            ...state,
            cartItems : state.cartItems.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
              )
            };
        } else {
          // If product doesn't exist, use the specified quantity or default to 1
          const quantity = product.quantity || 1;
          return {
            ...state,
            cartItems: [...state.cartItems, { ...product, quantity }],
            }
        }
    }
    case types.ADD_TO_CART_DELETE: {
        const newState = {
            ...state,
            cartItems: state.cartItems.filter(item => item.id !== product.id)
        }
        return newState;
    }
    case types.ADD_TO_CART_PRODUCT_QUANTITY_INC: {
        const newState = {
            ...state,
            cartItems: state.cartItems.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + PRODUCT_QUANTITY_INCREMENT } : item
              ),
        }
        return newState;
    }
    case types.ADD_TO_CART_PRODUCT_QUANTITY_DEC: {
        const newState = {
            ...state,
            cartItems: state.cartItems.map(item =>
                item.id === product.id && item.quantity > 0 ? { ...item, quantity: item.quantity - PRODUCT_QUANTITY_DECREMENT } : item
            ),
        }
        return newState;
    }
    default:
      return state
  }
}