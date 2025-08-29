import type { NextApiRequest, NextApiResponse } from 'next';
import { supaClient } from '../../supa-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { title, description, date, time, location, image_url, organizer_id } = req.body;

      // Validate that the user is authorized (must be the admin user)
      if (organizer_id !== process.env.NEXT_PUBLIC_SWAPNIL_ID) {
        return res.status(403).json({ 
          error: 'Unauthorized. Only the admin user can create events.' 
        });
      }

      // Validate required fields
      if (!title || !date || !time || !location) {
        return res.status(400).json({ 
          error: 'Missing required fields. Title, date, time, and location are required.' 
        });
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ 
          error: 'Invalid date format. Please use YYYY-MM-DD format.' 
        });
      }

      // Validate time format (HH:MM AM/PM)
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
      if (!timeRegex.test(time)) {
        return res.status(400).json({ 
          error: 'Invalid time format. Please use HH:MM AM/PM format.' 
        });
      }

      const { data, error } = await supaClient
        .from('events')
        .insert([
          {
            title: title.trim(),
            description: description?.trim() || null,
            date,
            time,
            location: location.trim(),
            image_url: image_url || null,
            organizer_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('*')
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
          error: 'Failed to create event. Please try again.' 
        });
      }

      res.status(201).json({ 
        message: 'Event created successfully!', 
        event: data 
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ 
        error: 'An unexpected error occurred. Please try again.' 
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, title, description, date, time, location, image_url, organizer_id } = req.body;

      // Validate that the user is authorized (must be the admin user)
      if (organizer_id !== process.env.NEXT_PUBLIC_SWAPNIL_ID) {
        return res.status(403).json({ 
          error: 'Unauthorized. Only the admin user can update events.' 
        });
      }

      // Validate required fields
      if (!id || !title || !date || !time || !location) {
        return res.status(400).json({ 
          error: 'Missing required fields. ID, title, date, time, and location are required.' 
        });
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ 
          error: 'Invalid date format. Please use YYYY-MM-DD format.' 
        });
      }

      // Validate time format (HH:MM AM/PM)
      const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
      if (!timeRegex.test(time)) {
        return res.status(400).json({ 
          error: 'Invalid time format. Please use HH:MM AM/PM format.' 
        });
      }

      const { data, error } = await supaClient
        .from('events')
        .update({
          title: title.trim(),
          description: description?.trim() || null,
          date,
          time,
          location: location.trim(),
          image_url: image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
          error: 'Failed to update event. Please try again.' 
        });
      }

      res.status(200).json({ 
        message: 'Event updated successfully!', 
        event: data 
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ 
        error: 'An unexpected error occurred. Please try again.' 
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id, organizer_id } = req.body;

      // Validate that the user is authorized (must be the admin user)
      if (organizer_id !== process.env.NEXT_PUBLIC_SWAPNIL_ID) {
        return res.status(403).json({ 
          error: 'Unauthorized. Only the admin user can delete events.' 
        });
      }

      if (!id) {
        return res.status(400).json({ 
          error: 'Event ID is required.' 
        });
      }

      const { error } = await supaClient
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
          error: 'Failed to delete event. Please try again.' 
        });
      }

      res.status(200).json({ 
        message: 'Event deleted successfully!' 
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ 
        error: 'An unexpected error occurred. Please try again.' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
