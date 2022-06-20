import { combineReducers } from 'redux';
import { counterReducer } from './counterReducer';
import { userReducer } from './userReducer';

// COMBINED REDUCERS
const reducers = {
  counter: counterReducer,
  users: userReducer
}

export default combineReducers(reducers)