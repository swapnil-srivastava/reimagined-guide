import * as types from '../actions/types';


// INITIAL STATE USER 
export const initialUserState = {
    user: {},
    username: null
}

// COUNTER REDUCER
export const userReducer = (state = initialUserState, { type, user, username }) => {
  switch (type) {
    case types.USER_UPDATE: {
        const newState = {
            ...state,
            user: user
        }
        console.log('===============USER_UPDATE=====================');
        console.log(user);
        console.log('================USER_UPDATE====================');
        debugger
        return newState;
    }
    case types.USERNAME_UPDATE: {
        console.log('=============USERNAME_UPDATE=======================');
        console.log(user);
        console.log('==============USERNAME_UPDATE======================');
        const newState = {
            ...state,
            username: username
        }
        console.log('=============USERNAME_UPDATE======newState=================');
        console.log(newState);
        console.log('==============USERNAME_UPDATE=======newState===============');
        return newState;
    }
    default:
      return state
  }
}