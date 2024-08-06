import { PRODUCT } from '../../database.types';
import * as types from './types'

// INCREMENT COUNTER BY 1
export const incrementCount = () => ({ type: types.INCREMENT });

// DECREMENT COUNTER BY 1
export const decrementCount = () => ({ type: types.DECREMENT });

// RESET COUNTER
export const resetCount = () => ({ type: types.RESET });

// UPDATE THE USER 
export const userUpdate = (payload) => ({ type: types.USER_UPDATE, user: payload });

// UPDATE THE USERNAME
export const usernameUpdate = (payload) => ({ type: types.USERNAME_UPDATE, username: payload });

// UPDATE THE SUPABASE USER
export const supabaseUser = (payload) => ({ type: types.SUPABASE_USER, supbaseUser: payload });

// Add the product to the store
export const addToStoreInsert = (payload: PRODUCT) => ({ type: types.ADD_TO_STORE_INSERT, product: payload });

// Update the product to the store
export const addToStoreUpdate = (payload) => ({ type: types.ADD_TO_STORE_INSERT, product: payload });

// Delete the product to the store
export const addToStoreDelete = (payload) => ({ type: types.ADD_TO_STORE_DELETE, product: payload });

// Increment the Product quantity by one 
export const addToStoreProductQuantityInc = (payload: PRODUCT) => ({ type: types.ADD_TO_STORE_PRODUCT_QUANTITY_INC, product: payload });

// Decrement the Product quantity by 
export const addToStoreProductQuantityDec = (payload: PRODUCT) => ({ type: types.ADD_TO_STORE_PRODUCT_QUANTITY_DEC, product: payload });