import { combineReducers } from 'redux';
import { counterReducer } from './counterReducer';
import { supaReducer } from './supaReducer';
import { userReducer } from './userReducer';
import { cartReducer } from './cartReducer';

// COMBINED REDUCERS
const reducers = {
  counter: counterReducer,
  users: userReducer,
  supabase: supaReducer,
  cart: cartReducer
}

export default combineReducers(reducers)