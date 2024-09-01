'use client';

import React, { useEffect, useState } from "react";
import { supaClient } from "../../supa-client";

function RSVP() {
    const [familyName, setFamilyName] = useState('');
    const [kids, setKids] = useState([{ name: '', message: '' }]);
    const [inviteId, setInviteId] = useState<number | null>(null);

    useEffect(() => {
        const fetchInviteId = async () => {
            const { data, error } = await supaClient
            .from('invites')
            .select('id')
            .single();
            if (data) setInviteId(data.id);
            if (error) console.error('Error fetching invite:', error);
        };
        fetchInviteId();
    }, []);

    const handleAddKid = () => {
        setKids([...kids, { name: '', message: '' }]);
    };
    
    const handleKidChange = (index: number, field: 'name' | 'message', value: string) => {
        const newKids = kids.map((kid, i) => {
            if (i === index) {
            return { ...kid, [field]: value };
            }
            return kid;
        });
        setKids(newKids);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteId) return;
    
        const user = supaClient.auth.user();
        if (!user) {
          console.error('User not authenticated');
          return;
        }
    
        // Insert family
        const { data: familyData, error: familyError } = await supaClient
          .from('families')
          .insert({ invite_id: inviteId, family_name: familyName, user_id: user.id })
          .single();
    
        if (familyError) {
          console.error('Error inserting family:', familyError);
          return;
        }
    
        // Insert RSVPs for each kid
        for (const kid of kids) {
          const { error: rsvpError } = await supaClient
            .from('rsvps')
            .insert({ family_id: familyData.id, kid_name: kid.name, message: kid.message });
    
          if (rsvpError) {
            console.error('Error inserting RSVP:', rsvpError);
          }
        }
    
        alert('RSVP submitted successfully!');
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">RSVP</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="familyName" className="block mb-1">Family Name:</label>
              <input
                type="text"
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
            </div>
    
            {kids.map((kid, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  placeholder="Kid's Name"
                  value={kid.name}
                  onChange={(e) => handleKidChange(index, 'name', e.target.value)}
                  required
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Message"
                  value={kid.message}
                  onChange={(e) => handleKidChange(index, 'message', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
    
            <button
              type="button"
              onClick={handleAddKid}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Another Kid
            </button>
    
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Submit RSVP
            </button>
          </form>
        </div>
      );
    };

export default RSVP;
