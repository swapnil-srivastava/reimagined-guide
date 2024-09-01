'use client';

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { supaClient } from "../../supa-client";

import { RootState } from "../../lib/interfaces/interface";
import { fetchInviteEvents } from "../../redux/actions/actions";
import toast from "react-hot-toast";

function Invite() {
  const dispatch = useDispatch();

  const { inviteEvents } = useSelector((state: RootState) => state.inviteEvents);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data, error } = await supaClient
          .from('events')
          .select('*')

        if (error) throw error;
        
        dispatch(fetchInviteEvents(data));
        
        toast.success(`Success Event Retrived`);

      } catch (error) {
        toast.error(`Error Event : ${error.message}`);
      }
    };

    fetchEventDetails();
  }, []);


  if (!inviteEvents) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Event Details</h1>
      { 
        inviteEvents && inviteEvents.map((inviteEvent, index, array) => ( 
          <div key={inviteEvent.id} className="bg-white shadow-md rounded-lg p-6 mb-6">
            <p><strong>Event Name:</strong> {inviteEvent.title}</p>
            <p><strong>Event Date:</strong> {new Date(inviteEvent.created_at).toLocaleString()}</p>
            <p><strong>Location:</strong> {inviteEvent.location}</p>
          </div>
          )
        )
      }

      <pre>
        {JSON.stringify(inviteEvents)}
      </pre>

      {/* <h2 className="text-2xl font-semibold mb-4">Families Invited</h2> */}
    </div>
  );

}

export default Invite;
