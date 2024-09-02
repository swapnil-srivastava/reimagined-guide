import * as types from '../actions/types';

export interface inviteEvent {
    id: string;
    location: string;
    title: string;
    description: string;
    date: string;
    image_url: string;
    time: string;
    organizer_id: string;
    created_at: string;
    updated_at: string;
}
  
export interface InviteEventsState {
    inviteEvents: inviteEvent[] | null;
}

// INITIAL STATE EVENT 
const initialEventState: InviteEventsState = {
    inviteEvents: [
        {
            "id": "9d8d81b0-7a74-4fd3-a7f6-6d3bf4aedd47",
            "title": "Schwarzlichthelden Minigolf",
            "description": "Miniature golf course",
            "date": "2024-09-14",
            "time": "11:00:00",
            "location": "Berger Str. 138, 60385 Frankfurt am Main",
            "organizer_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
            "created_at": "2024-09-01T18:38:57.789001+00:00",
            "updated_at": "2024-09-01T18:38:57.789001+00:00",
            "image_url": null
        },
        {
            "id": "771c89ef-acb0-456c-b42b-9ab616f84b1e",
            "title": "Kinder Spielplatz",
            "description": "party with pizza",
            "date": "2024-09-14",
            "time": "17:00:00",
            "location": "Rhonestraße 2a, 60528 Frankfurt am Main",
            "organizer_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
            "created_at": "2024-09-01T18:39:57.521153+00:00",
            "updated_at": "2024-09-01T18:39:57.521153+00:00",
            "image_url": null
        }
    ],
};

// EVENT REDUCER
export const inviteEventsReducer = (state = initialEventState, action: any) : InviteEventsState => {
  switch (action.type) {
    case types.FETCH_EVENT_REQUEST: {
      const newState = { 
        ...state,
        inviteEvents: [
          ...action.eventInvites
        ]
      };
      return newState
    }
    default:
      return state
  }
}