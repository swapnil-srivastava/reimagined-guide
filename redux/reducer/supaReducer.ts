import { SupashipUserInfo } from '../../lib/use-session';
import * as types from '../actions/types';

// INITIAL STATE USER 
export const initialUserState: SupashipUserInfo = {
    session: null,
    profile: null,
}

// SUPABASE REDUCER
// TODO: SUPABASE session to added to the state
export const supaReducer = (state = initialUserState, { type, supbaseUser }) => {
    switch (type) {
      case types.SUPABASE_USER: {
          const newState = {
              ...state,
          }
          return newState;
      }
      default:
        return state
    }
  }