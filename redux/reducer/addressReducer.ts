import * as types from '../actions/types';

// INITIAL STATE USER 
export const initialStoreState = {
   customerAddress: {}
}

// ADDRESS REDUCER
export const addressReducer = (state = initialStoreState, { type, address }) => {
  switch (type) {
    default:
      return state
  }
}