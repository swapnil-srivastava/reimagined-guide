'use client';

import React, { useEffect, useState } from "react";
import { supaClient } from "../../supa-client";

interface InviteDetails {
    event_name: string;
    event_date: string;
    location: string;
    families: { family_name: string; kids: { kid_name: string; message: string }[] }[];
}

function Invite() {
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      const { data, error } = await supaClient
        .from('invites')
        .select(`
          event_name, 
          event_date, 
          location, 
          families (
            family_name,
            kids: rsvps (kid_name, message)
          )
        `)
        .single();

      if (error) {
        console.error('Error fetching invite details:', error);
      } else {
        setInviteDetails(data);
      }
    };

    fetchInviteDetails();
  }, []);

  if (!inviteDetails) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Invite Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p><strong>Event Name:</strong> {inviteDetails.event_name}</p>
        <p><strong>Event Date:</strong> {new Date(inviteDetails.event_date).toLocaleString()}</p>
        <p><strong>Location:</strong> {inviteDetails.location}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Families Invited</h2>
      <div className="space-y-4">
        {inviteDetails.families.map((family, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg shadow">
            <p className="font-medium">{family.family_name}</p>
            <ul className="list-disc list-inside">
              {family.kids.map((kid, kidIndex) => (
                <li key={kidIndex}>
                  {kid.kid_name} - {kid.message}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

}

export default Invite;
