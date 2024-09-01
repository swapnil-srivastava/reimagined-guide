'use client';

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { supaClient } from "../../supa-client";

import { RootState } from "../../lib/interfaces/interface";
import { fetchInviteEvents } from "../../redux/actions/actions";
import toast from "react-hot-toast";

function Invite() {
  const dispatch = useDispatch();
  
  const selectInviteEvents = (state: RootState) => state.inviteEventsReducer;
  const { inviteEvents } = useSelector(selectInviteEvents);

  useEffect(() => {
    const fetchEventDetails = async () => {
        const { data : eventsData, error } = await supaClient
          .from('events')
          .select('*');

        console.log("useEffect", eventsData);

        dispatch(fetchInviteEvents(eventsData));
    };

    fetchEventDetails();
  }, []);

  function handleInvite() {
    const eventDummy = [
      {
          "id": "9d8d81b0-7a74-4fd3-a7f6-6d3bf4aedd47",
          "title": "aaaas",
          "description": "Mini Golf for everyone",
          "date": "2024-09-14",
          "time": "11:00:00",
          "location": "Rhonestraße 2a",
          "organizer_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
          "created_at": "2024-09-01T18:38:57.789001+00:00",
          "updated_at": "2024-09-01T18:38:57.789001+00:00"
      },
      {
          "id": "771c89ef-acb0-456c-b42b-9ab616f84b1e",
          "title": "Kinder SdasjkaskdhkpeilPlatz ",
          "description": "party with pizza",
          "date": "2024-09-14",
          "time": "17:00:00",
          "location": "Rhonestr. 2a ",
          "organizer_id": "c8ae336b-5fc3-43e7-8c33-d253b8361d79",
          "created_at": "2024-09-01T18:39:57.521153+00:00",
          "updated_at": "2024-09-01T18:39:57.521153+00:00"
      }
  ]
    dispatch(fetchInviteEvents(eventDummy));
  }

  if (!inviteEvents) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Event Details</h1>
      {
        inviteEvents.map((inviteEvent, index, array) => ( 
          <>
            <pre>{JSON.stringify(inviteEvent)}</pre>
            <div key={inviteEvent.id} className="bg-white shadow-md rounded-lg p-6 mb-6">
              <p><strong>Event Name:</strong> {inviteEvent.title}</p>
              <p><strong>Event Date:</strong> {new Date(inviteEvent.created_at).toLocaleString()}</p>
              <p><strong>Location:</strong> {inviteEvent.location}</p>
            </div>
          </>
          )
        )
      }

      <pre>
        {JSON.stringify(inviteEvents, null, 2)}
      </pre>
      
      <button type="button" onClick={() => handleInvite()}>Send Action</button>

      {/* <h2 className="text-2xl font-semibold mb-4">Families Invited</h2> */}
    </div>
  );

}

export default Invite;
