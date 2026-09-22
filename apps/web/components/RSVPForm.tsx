'use client';

import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Typography, Box, IconButton } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faHeart, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

interface Kid {
  name: string;
  age: string;
  allergies: string;
}

interface RSVPFormProps {
  eventId: string;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ eventId }) => {
  const intl = useIntl();
  const [familyName, setFamilyName] = useState('');
  const [kids, setKids] = useState<Kid[]>([{ name: '', age: '', allergies: '' }]);
  const [message, setMessage] = useState('');
  const [isAttending, setIsAttending] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theme tokens resolve against the active `theme-<color>-<mode>` class on
  // <html>, so a single definition covers light and dark. The fields are
  // transparent on purpose: they already sit on a --surface-inset panel, and
  // MUI's outlined variant reads from its fieldset border.
  const getInputStyles = () => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      '& input': {
        color: 'var(--text-primary)',
        WebkitTextFillColor: 'currentColor',
        '&::placeholder': {
          color: 'var(--text-muted)',
          opacity: 1,
        },
        '::placeholder': {
          color: 'var(--text-muted)',
          opacity: 1,
        },
        '::-webkit-input-placeholder': {
          color: 'var(--text-muted)',
        },
        ':-ms-input-placeholder': {
          color: 'var(--text-muted)',
        },
      },
      '& textarea': {
        color: 'var(--text-primary)',
        WebkitTextFillColor: 'currentColor',
        '&::placeholder': {
          color: 'var(--text-muted)',
          opacity: 1,
        },
        '::placeholder': {
          color: 'var(--text-muted)',
          opacity: 1,
        },
        '::-webkit-input-placeholder': {
          color: 'var(--text-muted)',
        },
      },
      '& fieldset': {
        borderColor: 'var(--border-subtle)',
      },
      '&:hover fieldset': {
        borderColor: 'var(--color-primary)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--color-primary)',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'var(--text-muted)',
      '&.Mui-focused': {
        color: 'var(--color-primary)',
      },
    },
  });

  // Nested kid fields use the same tokens; kept as a separate call site so the
  // two groups can diverge again later without touching every <TextField>.
  const getChildInputStyles = getInputStyles;


  const handleAddKid = () => {
    setKids([...kids, { name: '', age: '', allergies: '' }]);
  };

  const handleRemoveKid = (index: number) => {
    if (kids.length > 1) {
      const newKids = kids.filter((_, i) => i !== index);
      setKids(newKids);
    }
  };

  const handleKidChange = (index: number, field: keyof Kid, value: string) => {
    const newKids = [...kids];
    newKids[index][field] = value;
    setKids(newKids);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!familyName.trim()) {
      toast.error(intl.formatMessage({
        id: "rsvpform-family-name-required",
        description: "Family name is required",
        defaultMessage: "Family name is required"
      }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          eventId, 
          familyName: familyName.trim(), 
          kids: kids.filter(kid => kid.name.trim()), 
          message: message.trim(), 
          isAttending, 
          email: email.trim(), 
          phone: phone.trim() 
        }),
      });
      
      if (response.ok) {
        toast.success(intl.formatMessage({
          id: "rsvpform-submit-success",
          description: "RSVP submitted successfully",
          defaultMessage: "RSVP submitted successfully! Thank you for responding."
        }));
        // Reset form
        setFamilyName('');
        setKids([{ name: '', age: '', allergies: '' }]);
        setMessage('');
        setIsAttending(false);
        setEmail('');
        setPhone('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit RSVP');
      }
    } catch (error) {
      console.error('RSVP submission error:', error);
      toast.error(intl.formatMessage({
        id: "rsvpform-submit-error",
        description: "Failed to submit RSVP",
        defaultMessage: "Failed to submit RSVP. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl p-6 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 font-poppins">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center border-b border-[var(--border-subtle)] pb-4">
          <Typography variant="h5" className="text-[var(--text-primary)] font-semibold flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faHeart} className="text-hit-pink-500" />
            <FormattedMessage
              id="rsvpform-title"
              description="RSVP for Event"
              defaultMessage="RSVP for Event"
            />
          </Typography>
          <Typography variant="body2" className="text-[var(--text-primary)] opacity-70 mt-2">
            <FormattedMessage
              id="rsvpform-subtitle"
              description="Let us know if you can join us"
              defaultMessage="Let us know if you can join us for this special celebration!"
            />
          </Typography>
        </div>

        {/* Family Name */}
        <div className="space-y-2">
          <TextField
            label={intl.formatMessage({
              id: "rsvpform-family-name-label",
              description: "Family Name",
              defaultMessage: "Family Name"
            })}
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            fullWidth
            required
            variant="outlined"
            sx={getInputStyles()}
          />
        </div>

        {/* Attendance Checkbox */}
        <div className="bg-transparent border border-[var(--border-subtle)] rounded-lg p-4">
          <FormControlLabel
            control={
              <Checkbox
                checked={isAttending}
                onChange={(e) => setIsAttending(e.target.checked)}
                sx={{
                  color: 'var(--color-primary)',
                  '&.Mui-checked': {
                    color: 'var(--color-primary)',
                  },
                }}
              />
            }
            label={
              <span className="text-[var(--text-primary)] font-medium">
                {intl.formatMessage({
                  id: "rsvpform-will-attend-label",
                  description: "We will attend the event",
                  defaultMessage: "Yes, we will attend the event!"
                })}
              </span>
            }
          />
        </div>

        {/* Kids Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h6" className="text-[var(--text-primary)] font-medium">
              <FormattedMessage
                id="rsvpform-kids-section-title"
                description="Children attending"
                defaultMessage="Children Attending"
              />
            </Typography>
            <button
              type="button"
              onClick={handleAddKid}
              className="w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] bg-[var(--color-primary-light)] text-[#0a0a0a] p-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125"
            >
              <FontAwesomeIcon icon={faPlus} className="text-sm" />
            </button>
          </div>

          {kids.map((kid, index) => (
            <div key={index} className="bg-transparent border border-[var(--border-subtle)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Typography variant="subtitle2" className="text-[var(--text-primary)]">
                  <FormattedMessage
                    id="rsvpform-kid-section-title"
                    description="Child {index}"
                    defaultMessage="Child {index}"
                    values={{ index: index + 1 }}
                  />
                </Typography>
                {kids.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveKid(index)}
                    size="small"
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-sm" />
                  </IconButton>
                )}
              </div>
              <Box display="flex" gap={2} flexDirection="column">
                <TextField
                  label={intl.formatMessage({
                    id: "rsvpform-kid-name-label",
                    description: "Child's Name",
                    defaultMessage: "Child's Name"
                  })}
                  value={kid.name}
                  onChange={(e) => handleKidChange(index, 'name', e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={getChildInputStyles()}
                />
                <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                  <TextField
                    label={intl.formatMessage({
                      id: "rsvpform-kid-age-label",
                      description: "Age",
                      defaultMessage: "Age"
                    })}
                    value={kid.age}
                    onChange={(e) => handleKidChange(index, 'age', e.target.value)}
                    variant="outlined"
                    size="small"
                    type="number"
                    sx={{
                      width: { xs: '100%', sm: '120px' },
                      ...getChildInputStyles(),
                    }}
                  />
                  <TextField
                    label={intl.formatMessage({
                      id: "rsvpform-kid-allergies-label",
                      description: "Allergies/Dietary Restrictions",
                      defaultMessage: "Allergies/Dietary Restrictions"
                    })}
                    value={kid.allergies}
                    onChange={(e) => handleKidChange(index, 'allergies', e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder={intl.formatMessage({
                      id: "rsvpform-kid-allergies-placeholder",
                      description: "e.g., peanuts, dairy, gluten-free",
                      defaultMessage: "e.g., peanuts, dairy, gluten-free"
                    })}
                    sx={getChildInputStyles()}
                  />
                </Box>
              </Box>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <Typography variant="h6" className="text-[var(--text-primary)] font-medium">
            <FormattedMessage
              id="rsvpform-contact-section-title"
              description="Contact Information"
              defaultMessage="Contact Information"
            />
            <span className="text-[var(--text-primary)] opacity-60 text-sm ml-2">
              <FormattedMessage
                id="rsvpform-contact-optional"
                description="(optional)"
                defaultMessage="(optional)"
              />
            </span>
          </Typography>
          
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <div className="flex-1">
              <TextField
                label={intl.formatMessage({
                  id: "rsvpform-email-label",
                  description: "Email",
                  defaultMessage: "Email"
                })}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                type="email"
                variant="outlined"
                sx={getInputStyles()}
              />
            </div>

            <div className="flex-1">
              <TextField
                label={intl.formatMessage({
                  id: "rsvpform-phone-label",
                  description: "Phone Number",
                  defaultMessage: "Phone Number"
                })}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                type="tel"
                variant="outlined"
                sx={getInputStyles()}
              />
            </div>
          </Box>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <TextField
            label={intl.formatMessage({
              id: "rsvpform-message-label",
              description: "Special message or notes",
              defaultMessage: "Special message or notes"
            })}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder={intl.formatMessage({
              id: "rsvpform-message-placeholder",
              description: "Share your excitement or any special requests...",
              defaultMessage: "Share your excitement or any special requests..."
            })}
            sx={getInputStyles()}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:brightness-105 disabled:from-gray-400 disabled:to-gray-500 disabled:text-white text-[#0a0a0a] rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 shadow-sm font-medium"
          >
            <FontAwesomeIcon 
              icon={faPaperPlane} 
              className={`${isSubmitting ? 'animate-pulse' : ''}`} 
            />
            <FormattedMessage
              id="rsvpform-submit-button"
              description="Submit RSVP"
              defaultMessage={isSubmitting ? "Submitting..." : "Submit RSVP"}
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RSVPForm;