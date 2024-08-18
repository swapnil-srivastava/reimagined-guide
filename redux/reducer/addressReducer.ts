import * as types from '../actions/types';

// INITIAL STATE USER 
export const initialStoreState = {
   customerAddress: {}
}

// ADDRESS REDUCER
export const addressReducer = (state = initialStoreState, { type, address }) => {
  switch (type) {
    case types.ADD_TO_CART_ADDRESS_CREATE: {
      const newState = {
        ...state,
        customerAddress : {
          ...address
        }
      };
      return newState;
  };
  case types.ADD_TO_CART_ADDRESS_UPDATE: {
    const newState = {
      ...state,
      customerAddress : {
        ...address
      }
    };
    return newState;
  };
  case types.ADD_TO_CART_ADDRESS_DELETE: {
    const newState = {
      ...state,
      customerAddress : { }
    };
    return newState;
  };
    default:
      return state
  }
}