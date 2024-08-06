import * as types from '../actions/types';


// INITIAL STATE USER 
export const initialStoreState = {
   storeItems: []
}

// COUNTER REDUCER
export const storeReducer = (state = initialStoreState, { type, product }) => {
  switch (type) {
    case types.ADD_TO_STORE_INSERT: {
        const newState = {
            ...state,
            storeItems: [...state.storeItems, product],
        }
        return newState;
    }
    case types.ADD_TO_STORE_DELETE: {
        // TODO
        const newState = [
            // ...state,
        ]
        return newState;
    }
    case types.ADD_TO_STORE_UPDATE: {
        // TODO
        const newState = [
            // ...state,
        ]
        return newState;
    }
    default:
      return state
  }
}