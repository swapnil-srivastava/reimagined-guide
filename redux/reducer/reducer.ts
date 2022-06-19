import { combineReducers } from 'redux';
import { counterReducer } from './counterReducer';

// COMBINED REDUCERS
const reducers = {
  counter: counterReducer
}

export default combineReducers(reducers)