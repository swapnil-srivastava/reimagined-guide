import * as types from '../actions/types';

// INITIAL STATE USER 
export const initialStoreState = {
   customerAddress: {}
}

// ADDRESS REDUCER
export const addressReducer = (state = initialStoreState, { type, address }) => {
  switch (type) {
    case types.ADD_TO_CART_INSERT: {
      console.log("types.ADD_TO_CART_INSERT ::: ", address);
      // const newState = {
      //   ...state,
      //   customerAddress : ...address
      // }
      return state;
  }
    default:
      return state
  }
}