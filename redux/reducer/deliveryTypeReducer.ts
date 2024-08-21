import * as types from '../actions/types';

// INITIAL STATE USER 
export const initialStoreState = {
  deliveryType: {
    deliveryOption: {}
  },
  deliveryOptions: [], // Assuming you have a list of options
}

// DELIVERY TYPE REDUCER
export const deliveryTypeReducer = (state = initialStoreState, action) => {
  switch (action.type) {
    case types.FETCH_DELIVERY_OPTIONS:
      return {
        ...state,
      };
    case types.UPDATE_DELIVERY_OPTION:
      return {
        ...state,
        deliveryType: action.payload,
      };
    case types.CREATE_DELIVERY_OPTION:
      return {
        ...state,
        deliveryOptions: [...state.deliveryOptions, action.payload],
      };
    default:
      return state
  }
}