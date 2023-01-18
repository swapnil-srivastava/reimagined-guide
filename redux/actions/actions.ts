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