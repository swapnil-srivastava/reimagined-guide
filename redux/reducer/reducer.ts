import { combineReducers } from 'redux';
import { supaReducer } from './supaReducer';
import { userReducer } from './userReducer';
import { cartReducer } from './cartReducer';
import { addressReducer } from './addressReducer';
import { deliveryTypeReducer } from './deliveryTypeReducer';
import { subTotalReducer } from './subTotalReducer';

// COMBINED REDUCERS
const reducers = {
  users: userReducer,
  supabase: supaReducer,
  cart: cartReducer,
  address: addressReducer,
  deliveryType: deliveryTypeReducer,
  subtotal: subTotalReducer
}

export default combineReducers(reducers)