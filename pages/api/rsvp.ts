import type { NextApiRequest, NextApiResponse } from 'next';
import { supaClient } from '../../supa-client';

interface Kid {
  name: string;
  age: string;
}

interface RSVPData {
  eventId: string;
  familyName: string;
  kids: Kid[];
  message: string;
  isAttending: boolean;
  email?: string;
  phone?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { eventId, familyName, kids, message, isAttending, email, phone }: RSVPData = req.body;

    // Validate required fields
    if (!eventId || !familyName) {
      return res.status(400).json({ message: 'Event ID and family name are required' });
    }

    // Insert RSVP into database
    const { data, error } = await supaClient
      .from('rsvps')
      .insert({
        event_id: eventId,
        family_name: familyName,
        kids: kids,
        message: message,
        is_attending: isAttending,
        email: email,
        phone: phone,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    res.status(200).json({ 
      message: 'RSVP submitted successfully', 
      data: data[0] 
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Failed to submit RSVP',
      details: error.message 
    });
  }
}
