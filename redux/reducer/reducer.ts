import { combineReducers } from 'redux';
import { counterReducer } from './counterReducer';
import { supaReducer } from './supaReducer';
import { userReducer } from './userReducer';
import { storeReducer } from './storeReducer';

// COMBINED REDUCERS
const reducers = {
  counter: counterReducer,
  users: userReducer,
  supabase: supaReducer,
  store: storeReducer
}

export default combineReducers(reducers)