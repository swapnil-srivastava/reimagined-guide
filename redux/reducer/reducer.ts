import { combineReducers } from 'redux';
import { counterReducer } from './counterReducer';
import { supaReducer } from './supaReducer';
import { userReducer } from './userReducer';

// COMBINED REDUCERS
const reducers = {
  counter: counterReducer,
  users: userReducer,
  supabase: supaReducer
}

export default combineReducers(reducers)