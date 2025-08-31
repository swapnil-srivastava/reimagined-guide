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

  // Use CSS custom properties for dark mode that work with Tailwind
  const getInputStyles = () => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      color: '#0a0a0a',
      '& input': {
        color: '#0a0a0a',
        WebkitTextFillColor: 'currentColor',
        '&::placeholder': {
          color: 'rgba(156, 163, 175, 0.7)',
          opacity: 1,
        },
        '::placeholder': {
          color: 'rgba(156, 163, 175, 0.7)',
          opacity: 1,
        },
        '::-webkit-input-placeholder': {
          color: 'rgba(156, 163, 175, 0.7)',
        },
        ':-ms-input-placeholder': {
          color: 'rgba(156, 163, 175, 0.7)',
        },
      },
      '& textarea': {
        color: '#0a0a0a',
        WebkitTextFillColor: 'currentColor',
        '&::placeholder': {
          color: 'rgba(156, 163, 175, 0.7)',
          opacity: 1,
        },
        '::placeholder': {
          color: 'rgba(156, 163, 175, 0.7)',
          opacity: 1,
        },
        '::-webkit-input-placeholder': {
          color: 'rgba(156, 163, 175, 0.7)',
        },
      },
      '& fieldset': {
        borderColor: 'rgba(156, 163, 175, 0.5)',
      },
      '&:hover fieldset': {
        borderColor: '#00539c',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00539c',
      },
      // Dark mode overrides
      'html.dark &': {
        color: '#fbfbfb',
        '& input': {
          color: '#fbfbfb',
          WebkitTextFillColor: '#fbfbfb',
          '&::placeholder': {
            color: 'rgba(235, 235, 235, 0.6)',
            opacity: 1,
          },
          '::placeholder': {
            color: 'rgba(235, 235, 235, 0.6)',
            opacity: 1,
          },
          '::-webkit-input-placeholder': {
            color: 'rgba(235, 235, 235, 0.6)',
          },
        },
        '& textarea': {
          color: '#fbfbfb',
          WebkitTextFillColor: '#fbfbfb',
          '&::placeholder': {
            color: 'rgba(235, 235, 235, 0.6)',
            opacity: 1,
          },
          '::placeholder': {
            color: 'rgba(235, 235, 235, 0.6)',
            opacity: 1,
          },
          '::-webkit-input-placeholder': {
            color: 'rgba(235, 235, 235, 0.6)',
          },
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(156, 163, 175, 0.8)',
      '&.Mui-focused': {
        color: '#00539c',
      },
    },
  });

  const getChildInputStyles = () => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white',
      color: '#0a0a0a',
      '& input': {
        color: '#0a0a0a',
        WebkitTextFillColor: 'currentColor',
        '&::placeholder': {
          color: 'rgba(107, 114, 128, 0.7)',
          opacity: 1,
        },
        '::-webkit-input-placeholder': {
          color: 'rgba(107, 114, 128, 0.7)',
        },
      },
      '& fieldset': {
        borderColor: 'rgba(156, 163, 175, 0.5)',
      },
      '&:hover fieldset': {
        borderColor: '#00539c',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00539c',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(107, 114, 128, 0.8)',
      '&.Mui-focused': {
        color: '#00539c',
      },
    },
  });


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
    <div className="bg-white dark:bg-fun-blue-600 rounded-xl p-6 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 font-poppins">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center border-b border-gray-200 dark:border-fun-blue-500 pb-4">
          <Typography variant="h5" className="text-blog-black dark:text-blog-white font-semibold flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faHeart} className="text-hit-pink-500" />
            <FormattedMessage
              id="rsvpform-title"
              description="RSVP for Event"
              defaultMessage="RSVP for Event"
            />
          </Typography>
          <Typography variant="body2" className="text-gray-600 dark:text-gray-300 mt-2">
            <FormattedMessage
              id="rsvpform-subtitle"
              description="Let us know if you can join us"
              defaultMessage="Let us know if you can join us for this special celebration!"
            />
          </Typography>
        </div>

        {/* Family Name */}
        <div className="space-y-2">
          <div className="[&_input]:text-blog-black [&_textarea]:text-blog-black dark:[&_input]:text-blog-white dark:[&_textarea]:text-blog-white">
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
              className="bg-white dark:bg-fun-blue-600"
              InputLabelProps={{ className: 'text-blog-black dark:text-blog-white' }}
              inputProps={{ className: 'text-blog-black dark:text-blog-white placeholder:text-gray-500 dark:placeholder:text-gray-300' }}
              sx={getInputStyles()}
            />
          </div>
        </div>

        {/* Attendance Checkbox */}
        <div className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-4">
          <FormControlLabel
            control={
              <Checkbox
                checked={isAttending}
                onChange={(e) => setIsAttending(e.target.checked)}
                sx={{
                  color: '#00539c',
                  '&.Mui-checked': {
                    color: '#00539c',
                  },
                }}
              />
            }
            label={
              <span className="text-blog-black dark:text-blog-white font-medium">
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
            <Typography variant="h6" className="text-blog-black dark:text-blog-white font-medium">
              <FormattedMessage
                id="rsvpform-kids-section-title"
                description="Children attending"
                defaultMessage="Children Attending"
              />
            </Typography>
            <button
              type="button"
              onClick={handleAddKid}
              className="w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)] bg-fun-blue-300 dark:bg-fun-blue-400 text-blog-black p-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125"
            >
              <FontAwesomeIcon icon={faPlus} className="text-sm" />
            </button>
          </div>

          {kids.map((kid, index) => (
            <div key={index} className="bg-gray-50 dark:bg-fun-blue-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Typography variant="subtitle2" className="text-blog-black dark:text-blog-white">
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
                  InputLabelProps={{ className: 'text-blog-black dark:text-blog-white' }}
                  inputProps={{ className: 'text-blog-black dark:text-blog-white placeholder:text-gray-500 dark:placeholder:text-gray-300' }}
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
                    InputLabelProps={{ className: 'text-blog-black dark:text-blog-white' }}
                    inputProps={{ className: 'text-blog-black dark:text-blog-white placeholder:text-gray-500 dark:placeholder:text-gray-300' }}
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
                    InputLabelProps={{ className: 'text-blog-black dark:text-blog-white' }}
                    inputProps={{ className: 'text-blog-black dark:text-blog-white placeholder:text-gray-500 dark:placeholder:text-gray-300' }}
                    sx={getChildInputStyles()}
                  />
                </Box>
              </Box>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <Typography variant="h6" className="text-blog-black dark:text-blog-white font-medium">
            <FormattedMessage
              id="rsvpform-contact-section-title"
              description="Contact Information"
              defaultMessage="Contact Information"
            />
            <span className="text-gray-500 text-sm ml-2">
              <FormattedMessage
                id="rsvpform-contact-optional"
                description="(optional)"
                defaultMessage="(optional)"
              />
            </span>
          </Typography>
          
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <div className="flex-1 [&_input]:text-blog-black dark:[&_input]:text-blog-white">
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
                InputLabelProps={{ className: 'text-blog-black dark:text-blog-white' }}
                inputProps={{ className: 'text-blog-black dark:text-blog-white placeholder:text-gray-500 dark:placeholder:text-gray-300' }}
                sx={getInputStyles()}
              />
            </div>

            <div className="flex-1 [&_input]:text-blog-black dark:[&_input]:text-blog-white">
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
                InputLabelProps={{ className: 'text-blog-black dark:text-blog-white' }}
                inputProps={{ className: 'text-blog-black dark:text-blog-white placeholder:text-gray-500 dark:placeholder:text-gray-300' }}
                sx={getInputStyles()}
              />
            </div>
          </Box>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <div className="[&_input]:text-blog-black [&_textarea]:text-blog-black dark:[&_input]:text-blog-white dark:[&_textarea]:text-blog-white">
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
              InputLabelProps={{ className: 'text-blog-black dark:text-blog-white' }}
              inputProps={{ className: 'text-blog-black dark:text-blog-white placeholder:text-gray-500 dark:placeholder:text-gray-300' }}
              sx={getInputStyles()}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-hit-pink-500 to-hit-pink-600 hover:from-hit-pink-600 hover:to-hit-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hit-pink-400 focus:ring-offset-2 shadow-sm font-medium"
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