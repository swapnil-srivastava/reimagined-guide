import type { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment';
import { supaServerClient } from '../../supa-server-client';
import { Database } from '../../database.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      console.log('POST request received:', req.body);
      console.log('Request headers authorization:', req.headers.authorization ? 'Present' : 'Missing');
      
      // Get the authorization token from the request headers
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!authToken) {
        console.log('No authorization token provided');
        return res.status(401).json({ 
          error: 'Authentication required. Please log in and try again.' 
        });
      }

      if (!supaServerClient) {
        console.log('Server client not available');
        return res.status(500).json({ 
          error: 'Server configuration error.' 
        });
      }
      
      // Get the current user from the JWT token using server client
      const { data: { user }, error: authError } = await supaServerClient.auth.getUser(authToken);
      console.log('Authenticated user ID:', user?.id);
      console.log('Auth error:', authError);
      
      if (authError || !user) {
        console.log('Authentication failed:', authError?.message);
        return res.status(401).json({ 
          error: 'Authentication failed. Please log in and try again.' 
        });
      }
      
      const { title, description, date, time, location, image_url } = req.body;
      const organizer_id = user.id;
      
      console.log('Extracted data:', { title, description, date, time, location, image_url, organizer_id });
      console.log('Expected admin ID:', process.env.NEXT_PUBLIC_SWAPNIL_ID);

      // Validate that the user is authorized (must be the admin user)
      if (organizer_id !== process.env.NEXT_PUBLIC_SWAPNIL_ID) {
        console.log('Authorization failed - ID mismatch');
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

      // Validate date format and convert using moment
      const dateObj = moment(date, 'YYYY-MM-DD', true);
      if (!dateObj.isValid()) {
        return res.status(400).json({ 
          error: 'Invalid date format. Please use YYYY-MM-DD format.' 
        });
      }
      
      // Format date for PostgreSQL
      const formattedDate = dateObj.format('YYYY-MM-DD');

      // Validate time format - handle both 12-hour (HH:MM AM/PM) and 24-hour (HH:MM) formats
      let convertedTime;
      
      // Check if time is in 12-hour format (contains AM/PM)
      const timeRegex12Hour = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
      const timeRegex24Hour = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (timeRegex12Hour.test(time)) {
        console.log('Time is in 12-hour format:', time);
        // Convert 12-hour format to 24-hour format for PostgreSQL
        const [timePart, period] = time.split(/\s+/);
        const [hours, minutes] = timePart.split(':').map(Number);
        let convertedHours = hours;
        
        if (period.toUpperCase() === 'PM' && hours !== 12) {
          convertedHours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
          convertedHours = 0;
        }
        
        convertedTime = `${convertedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      } else if (timeRegex24Hour.test(time)) {
        console.log('Time is in 24-hour format:', time);
        // Already in 24-hour format, just add seconds
        convertedTime = `${time}:00`;
      } else {
        console.log('Invalid time format received:', time);
        return res.status(400).json({ 
          error: 'Invalid time format. Please use HH:MM AM/PM or HH:MM (24-hour) format.' 
        });
      }

      console.log('Converted time for database:', convertedTime);

      console.log('Final data for database:', {
        title: title.trim(),
        description: description?.trim() || null,
        date: formattedDate,
        time: convertedTime,
        location: location.trim(),
        image_url: image_url || null,
        organizer_id
      });

      // Use the server client to insert the data
      const { data, error } = await supaServerClient
        .from('events')
        .insert([
          {
            title: title.trim(),
            description: description?.trim() || null,
            date: formattedDate,
            time: convertedTime,
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

      console.log('Event created successfully:', data);
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
      console.log('PUT request received:', req.body);
      
      // Get the authorization token from the request headers
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!authToken) {
        return res.status(401).json({ 
          error: 'Authentication required. Please log in and try again.' 
        });
      }

      if (!supaServerClient) {
        return res.status(500).json({ 
          error: 'Server configuration error.' 
        });
      }
      
      // Get the current user from the JWT token using server client
      const { data: { user }, error: authError } = await supaServerClient.auth.getUser(authToken);
      
      if (authError || !user) {
        return res.status(401).json({ 
          error: 'Authentication failed. Please log in and try again.' 
        });
      }

      const { id, title, description, date, time, location, image_url } = req.body;
      const organizer_id = user.id;

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

      // Validate date format and convert using moment
      const dateObj = moment(date, 'YYYY-MM-DD', true);
      if (!dateObj.isValid()) {
        return res.status(400).json({ 
          error: 'Invalid date format. Please use YYYY-MM-DD format.' 
        });
      }
      
      // Format date for PostgreSQL
      const formattedDate = dateObj.format('YYYY-MM-DD');

      // Validate time format - handle both 12-hour (HH:MM AM/PM) and 24-hour (HH:MM) formats
      let convertedTime;
      
      // Check if time is in 12-hour format (contains AM/PM)
      const timeRegex12Hour = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
      const timeRegex24Hour = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (timeRegex12Hour.test(time)) {
        console.log('PUT - Time is in 12-hour format:', time);
        // Convert 12-hour format to 24-hour format for PostgreSQL
        const [timePart, period] = time.split(/\s+/);
        const [hours, minutes] = timePart.split(':').map(Number);
        let convertedHours = hours;
        
        if (period.toUpperCase() === 'PM' && hours !== 12) {
          convertedHours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
          convertedHours = 0;
        }
        
        convertedTime = `${convertedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      } else if (timeRegex24Hour.test(time)) {
        console.log('PUT - Time is in 24-hour format:', time);
        // Already in 24-hour format, just add seconds
        convertedTime = `${time}:00`;
      } else {
        console.log('PUT - Invalid time format received:', time);
        return res.status(400).json({ 
          error: 'Invalid time format. Please use HH:MM AM/PM or HH:MM (24-hour) format.' 
        });
      }

      console.log('PUT - Converted time for database:', convertedTime);

      const { data, error } = await supaServerClient
        .from('events')
        .update({
          title: title.trim(),
          description: description?.trim() || null,
          date: formattedDate,
          time: convertedTime,
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
      console.log('DELETE request received:', req.body);
      
      // Get the authorization token from the request headers
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!authToken) {
        return res.status(401).json({ 
          error: 'Authentication required. Please log in and try again.' 
        });
      }

      if (!supaServerClient) {
        return res.status(500).json({ 
          error: 'Server configuration error.' 
        });
      }
      
      // Get the current user from the JWT token using server client
      const { data: { user }, error: authError } = await supaServerClient.auth.getUser(authToken);
      
      if (authError || !user) {
        return res.status(401).json({ 
          error: 'Authentication failed. Please log in and try again.' 
        });
      }

      const { id } = req.body;
      const organizer_id = user.id;

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

      const { error } = await supaServerClient
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
