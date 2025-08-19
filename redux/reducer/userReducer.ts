import * as types from '../actions/types';


// INITIAL STATE USER 
export const initialUserState = {
    user: {},
    username: null
}

// USER REDUCER
export const userReducer = (state = initialUserState, { type, user, username }) => {
  switch (type) {
    case types.USER_UPDATE: {
        const newState = {
            ...state,
            user: user
        }
        return newState;
    }
    case types.USERNAME_UPDATE: {
        const newState = {
            ...state,
            username: username
        }
        return newState;
    }
    case types.USER_LOGOUT: {
        // Clear all user state on logout
        return initialUserState;
    }
    default:
      return state
  }
}