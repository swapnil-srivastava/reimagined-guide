import * as types from '../actions/types';
import { PRODUCT_INITIAL_QUANTITY, PRODUCT_QUANTITY_INCREMENT, PRODUCT_QUANTITY_DECREMENT } from '../../lib/library';


// INITIAL STATE USER 
export const initialStoreState = {
   storeItems: []
}

// COUNTER REDUCER
export const storeReducer = (state = initialStoreState, { type, product }) => {
  switch (type) {
    case types.ADD_TO_STORE_INSERT: {
        const newProductWithQuantity = {
            ...product, 
            quantity: PRODUCT_INITIAL_QUANTITY
        }
        const newState = {
            ...state,
            storeItems: [...state.storeItems, newProductWithQuantity],
        }
        return newState;
    }
    case types.ADD_TO_STORE_DELETE: {
        const newState = {
            ...state,
            storeItems: state.storeItems.filter(item => item.id !== product.id)
        }
        return newState;
    }
    case types.ADD_TO_STORE_PRODUCT_QUANTITY_INC: {
        const newState = {
            ...state,
            storeItems: state.storeItems.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + PRODUCT_QUANTITY_INCREMENT } : item
              ),
        }
        return newState;
    }
    case types.ADD_TO_STORE_PRODUCT_QUANTITY_DEC: {
        const newState = {
            ...state,
            storeItems: state.storeItems.map(item =>
                item.id === product.id && item.quantity > 0 ? { ...item, quantity: item.quantity - PRODUCT_QUANTITY_DECREMENT } : item
            ),
        }
        return newState;
    }
    default:
      return state
  }
}