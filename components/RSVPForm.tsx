'use client';

import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Typography, Box } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';

const RSVPForm = ({ eventId }) => {
  const intl = useIntl();
  const [familyName, setFamilyName] = useState('');
  const [kids, setKids] = useState([{ name: '', age: '' }]);
  const [message, setMessage] = useState('');
  const [isAttending, setIsAttending] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddKid = () => {
    setKids([...kids, { name: '', age: '' }]);
  };

  const handleKidChange = (index, field, value) => {
    const newKids = [...kids];
    newKids[index][field] = value;
    setKids(newKids);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, familyName, kids, message, isAttending, email, phone }),
      });
      
      if (response.ok) {
        console.log('RSVP submitted successfully');
      } else {
        console.error('Failed to submit RSVP');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6">RSVP for Event</Typography>
      
      <TextField
        label={intl.formatMessage({
          id: "rsvpform-family-name-label",
          description: "Family Name",
          defaultMessage: "Family Name"
        })}
        value={familyName}
        onChange={(e) => setFamilyName(e.target.value)}
        fullWidth
        margin="normal"
      />

      {kids.map((kid, index) => (
        <Box key={index} display="flex" gap={2}>
          <TextField
            label={intl.formatMessage({
              id: "rsvpform-kid-name-label",
              description: "Kid {index} Name",
              defaultMessage: "Kid {index} Name"
            }, { index: index + 1 })}
            value={kid.name}
            onChange={(e) => handleKidChange(index, 'name', e.target.value)}
            margin="normal"
          />
          <TextField
            label={intl.formatMessage({
              id: "rsvpform-kid-age-label",
              description: "Kid {index} Age",
              defaultMessage: "Kid {index} Age"
            }, { index: index + 1 })}
            value={kid.age}
            onChange={(e) => handleKidChange(index, 'age', e.target.value)}
            margin="normal"
          />
        </Box>
      ))}

      <Button onClick={handleAddKid} variant="outlined" style={{ margin: '10px 0' }}>
        <FormattedMessage
          id="rsvpform-add-another-kid"
          description="Add Another Kid"
          defaultMessage="Add Another Kid"
        />
      </Button>

      <TextField
        label={intl.formatMessage({
          id: "rsvpform-message-label",
          description: "Message for Birthday Girl",
          defaultMessage: "Message for Birthday Girl"
        })}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
      />

      <TextField
        label={intl.formatMessage({
          id: "rsvpform-email-label",
          description: "Email (optional)",
          defaultMessage: "Email (optional)"
        })}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label={intl.formatMessage({
          id: "rsvpform-phone-label",
          description: "Phone Number (optional)",
          defaultMessage: "Phone Number (optional)"
        })}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
        margin="normal"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={isAttending}
            onChange={(e) => setIsAttending(e.target.checked)}
          />
        }
        label={intl.formatMessage({
          id: "rsvpform-will-attend-label",
          description: "We will attend the event",
          defaultMessage: "We will attend the event"
        })}
      />

      <Button type="submit" variant="contained" color="primary">
        <FormattedMessage
          id="rsvpform-submit-button"
          description="Submit RSVP"
          defaultMessage="Submit RSVP"
        />
      </Button>
    </form>
  );
};

export default RSVPForm;