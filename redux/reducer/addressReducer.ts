import * as types from '../actions/types';

// INITIAL STATE USER 
export const initialStoreState = {
   customerAddress: {}
}

// ADDRESS REDUCER
export const addressReducer = (state = initialStoreState, { type, address }) => {
  switch (type) {
    case types.ADD_TO_CART_INSERT: {
      const newState = {
        ...state,
        customerAddress : {
          ...address
        }
      };
      return newState;
  }
    default:
      return state
  }
}