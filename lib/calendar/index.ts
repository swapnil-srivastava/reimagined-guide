// Calendar utilities for generating calendar event links
import moment from 'moment';

interface CalendarEventData {
  title: string;
  description?: string;
  location: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM:SS format
}

// Convert time to different formats for calendar links
const formatTimeForCalendar = (date: string, time: string): { start: string; end: string } => {
  // Parse the date and time
  const eventDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss');
  
  // Add 2 hours as default event duration
  const endDateTime = eventDateTime.clone().add(2, 'hours');
  
  return {
    start: eventDateTime.format('YYYYMMDDTHHmmss'),
    end: endDateTime.format('YYYYMMDDTHHmmss')
  };
};

// Generate Google Calendar link
export const generateGoogleCalendarLink = (eventData: CalendarEventData): string => {
  const { start, end } = formatTimeForCalendar(eventData.date, eventData.time);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventData.title,
    dates: `${start}/${end}`,
    details: eventData.description || '',
    location: eventData.location,
    sf: 'true',
    output: 'xml'
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Generate Outlook Calendar link
export const generateOutlookCalendarLink = (eventData: CalendarEventData): string => {
  const { start, end } = formatTimeForCalendar(eventData.date, eventData.time);
  
  // Convert to ISO format for Outlook
  const startISO = moment(`${eventData.date} ${eventData.time}`, 'YYYY-MM-DD HH:mm:ss').toISOString();
  const endISO = moment(`${eventData.date} ${eventData.time}`, 'YYYY-MM-DD HH:mm:ss').add(2, 'hours').toISOString();
  
  const params = new URLSearchParams({
    subject: eventData.title,
    startdt: startISO,
    enddt: endISO,
    body: eventData.description || '',
    location: eventData.location,
    path: '/calendar/action/compose'
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

// Generate Yahoo Calendar link
export const generateYahooCalendarLink = (eventData: CalendarEventData): string => {
  const { start, end } = formatTimeForCalendar(eventData.date, eventData.time);
  
  const params = new URLSearchParams({
    v: '60',
    title: eventData.title,
    st: start,
    et: end,
    desc: eventData.description || '',
    in_loc: eventData.location
  });
  
  return `https://calendar.yahoo.com/?${params.toString()}`;
};

// Generate ICS file content for download (works on mobile devices)
export const generateICSContent = (eventData: CalendarEventData): string => {
  const { start, end } = formatTimeForCalendar(eventData.date, eventData.time);
  const now = moment().format('YYYYMMDDTHHmmss');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//Your App//EN
BEGIN:VEVENT
UID:${now}@yourdomain.com
DTSTAMP:${now}Z
DTSTART:${start}Z
DTEND:${end}Z
SUMMARY:${eventData.title}
DESCRIPTION:${eventData.description || ''}
LOCATION:${eventData.location}
END:VEVENT
END:VCALENDAR`;
};

// Create downloadable ICS file
export const downloadICSFile = (eventData: CalendarEventData): void => {
  const icsContent = generateICSContent(eventData);
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${eventData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Detect platform and return appropriate calendar link
export const getCalendarLink = (eventData: CalendarEventData): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    // For iOS devices, use Google Calendar (most compatible)
    return generateGoogleCalendarLink(eventData);
  } else if (userAgent.includes('android')) {
    // For Android devices, use Google Calendar
    return generateGoogleCalendarLink(eventData);
  } else {
    // For desktop/other devices, use Google Calendar
    return generateGoogleCalendarLink(eventData);
  }
};

// Get all calendar options for dropdown
export const getAllCalendarOptions = (eventData: CalendarEventData) => [
  {
    name: 'Google Calendar',
    icon: '📅',
    link: generateGoogleCalendarLink(eventData),
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Outlook',
    icon: '📧',
    link: generateOutlookCalendarLink(eventData),
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    name: 'Yahoo Calendar',
    icon: '🟣',
    link: generateYahooCalendarLink(eventData),
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: 'Download (.ics)',
    icon: '💾',
    action: () => downloadICSFile(eventData),
    color: 'bg-green-500 hover:bg-green-600'
  }
];
