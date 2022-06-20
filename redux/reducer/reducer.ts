import { combineReducers } from 'redux';
import { counterReducer } from './counterReducer';
import { userReducer } from './userReducer';

// COMBINED REDUCERS
const reducers = {
  counter: counterReducer,
  user: userReducer
}

export default combineReducers(reducers)