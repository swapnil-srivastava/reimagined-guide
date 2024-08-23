import { CostActionTypes } from '../actions/actions';
import * as types from '../actions/types';

interface StoreState {
  subTotal: number;
  tax: number;
  deliveryCost: number;
  totalCost: number;
}

// INITIAL STATE USER 
export const initialStoreState: StoreState = {
  subTotal: 0,
  tax: 0,
  deliveryCost: 0,
  totalCost: 0,
}

// SUBTOTAL REDUCER
export const subTotalReducer = (state = initialStoreState, action: CostActionTypes) => {
  switch (action.type) {
    case types.UPDATE_SUBTOTAL:
      return {
        ...state,
        subTotal: action.subtotal,
    };
    case types.UPDATE_TAX:
      return {
        ...state,
        tax: action.tax,
    };
    case types.UPDATE_DELIVERY_COST:
      return {
        ...state,
        deliveryCost: action.deliveryCost,
    };
    case types.UPDATE_TOTAL_COST:
      return {
        ...state,
        totalCost: action.total,
    };
    default:
      return state
  }
}