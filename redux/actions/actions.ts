import { PRODUCT } from '../../database.types';
import * as types from './types'

// UPDATE THE USER 
export const userUpdate = (payload) => ({ type: types.USER_UPDATE, user: payload });

// UPDATE THE USERNAME
export const usernameUpdate = (payload) => ({ type: types.USERNAME_UPDATE, username: payload });

// UPDATE THE SUPABASE USER
export const supabaseUser = (payload) => ({ type: types.SUPABASE_USER, supbaseUser: payload });

// Add the product to the cart
export const addToCartInsert = (payload: PRODUCT) => ({ type: types.ADD_TO_CART_INSERT, product: payload });

// Update the product to the cart
export const addToCartUpdate = (payload) => ({ type: types.ADD_TO_CART_INSERT, product: payload });

// Delete the product to the cart
export const addToCartDelete = (payload) => ({ type: types.ADD_TO_CART_DELETE, product: payload });

// Increment the Product quantity by one 
export const addToCartProductQuantityInc = (payload: PRODUCT) => ({ type: types.ADD_TO_CART_PRODUCT_QUANTITY_INC, product: payload });

// Decrement the Product quantity by 
export const addToCartProductQuantityDec = (payload: PRODUCT) => ({ type: types.ADD_TO_CART_PRODUCT_QUANTITY_DEC, product: payload });