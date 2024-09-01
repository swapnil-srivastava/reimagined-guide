import * as types from '../actions/types';

export interface inviteEvent {
    id: string;
    location: string;
    title: string;
    description: string;
    date: string;
    time: string;
    organizer_id: string;
    created_at: string;
    updated_at: string;
}
  
export interface InviteEventsState {
    inviteEvents: {
      inviteEvents: inviteEvent[] | null;
    }
}

// INITIAL STATE EVENT 
const initialEventState: InviteEventsState = {
    inviteEvents: {
      inviteEvents : []
    },
};

// EVENT REDUCER
export const inviteEventsReducer = (state = initialEventState, action: any) : InviteEventsState => {
  switch (action.type) {
    case types.FETCH_EVENT_REQUEST: {
      console.log("state", state);
      console.log("action", action);
      return {
        ...state,
        inviteEvents: {
          ...state.inviteEvents,
          inviteEvents: [
            ...state.inviteEvents.inviteEvents,
            ...action.inviteEvents
          ]
        }
      };
    }
    default:
      return state
  }
}