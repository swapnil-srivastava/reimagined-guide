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
      try {
        const { data: eventsData, error } = await supaClient
          .from('events')
          .select('*');
  
        if (error) throw error;
  
        if (eventsData && eventsData.length > 0) {
          dispatch(fetchInviteEvents(eventsData));
          toast.success(`Retrieved Events`)
        } else {
          console.log("No events data returned from Supabase");
        }
      } catch (error) {
        toast.error(`Error fetching events: ${error}`)
      }
    };

    fetchEventDetails();
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Event Details</h1>
      {
        inviteEvents.map((inviteEvent, index, array) => ( 
            <div key={inviteEvent.id} className="bg-white shadow-md rounded-lg p-6 mb-6">
              <p><strong>Event Name:</strong> {inviteEvent.title}</p>
              <p><strong>Event Date:</strong> {new Date(inviteEvent.created_at).toLocaleString()}</p>
              <p><strong>Location:</strong> {inviteEvent.location}</p>
            </div>
          )
        )
      }
    </div>
  );

}

export default Invite;
