# Event Management System

## Overview
A comprehensive admin event management system has been implemented to allow authorized users to create, edit, and delete events for the invite page.

## Key Features

### 1. Authorization & Security
- **Admin Only Access**: Only users with ID matching `NEXT_PUBLIC_SWAPNIL_ID` environment variable can manage events
- **API Authorization**: All event management API endpoints validate user authorization before processing requests
- **Access Control**: Unauthorized users see a clear "Access Denied" message

### 2. Event Management Interface (`/admin/events`)
- **Create Events**: Full form with title, date, time, location, description, and image URL
- **Edit Events**: Click edit button to modify existing events
- **Delete Events**: Confirmation dialog before deleting events
- **Real-time Updates**: Event list refreshes after any changes

### 3. API Endpoints (`/api/events`)
- **POST**: Create new events with validation
- **PUT**: Update existing events 
- **DELETE**: Remove events with authorization check
- **Validation**: Date format (YYYY-MM-DD), time format (HH:MM AM/PM), required fields

### 4. Enhanced Invite Page Features
- **Time-based Organization**: Events automatically categorized as upcoming/past
- **Year-wise Sections**: Events grouped by year with collapsible sections
- **Visual Indicators**: Status badges (Upcoming, Today, Past Event)
- **Progressive Enhancement**: Past events styled with reduced opacity and grayscale
- **Smart Defaults**: Past years (2024 and earlier) collapsed by default

### 5. Navigation Integration
- **Admin Navigation**: Calendar Plus icon in navbar for authorized users only
- **Quick Access**: Direct link to event management from main navigation
- **Tooltip Support**: Helpful tooltips for all navigation elements

## Database Schema

### Events Table Structure
```sql
- id: UUID (Primary Key, Auto-generated)
- title: TEXT (Required)
- description: TEXT (Optional)
- date: DATE (Required)
- time: TIME (Required)
- location: TEXT (Required)
- image_url: TEXT (Optional)
- organizer_id: UUID (Required - links to user)
- created_at: TIMESTAMP (Auto-generated)
- updated_at: TIMESTAMP (Auto-updated)
```

## File Structure

### Components
- `components/EventManagement.tsx` - Main admin interface for event management
- `components/RSVPForm.tsx` - Enhanced RSVP form with family management

### Pages
- `pages/admin/events.tsx` - Admin events page wrapper
- `pages/invite/index.tsx` - Enhanced invite page with time-based organization
- `pages/api/events.ts` - Event management API endpoints
- `pages/api/rsvp.ts` - RSVP submission API

### Features
- **Internationalization**: All UI text supports multiple languages via react-intl
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Full dark mode support throughout the interface
- **Loading States**: Proper loading indicators and error handling
- **Toast Notifications**: User feedback for all operations

## Security Considerations

1. **Environment Variable Security**: Admin ID stored in environment variable
2. **API Validation**: Server-side validation for all inputs
3. **Authorization Checks**: Multiple layers of authorization verification
4. **SQL Injection Prevention**: Using Supabase parameterized queries
5. **Input Sanitization**: All user inputs are trimmed and validated

## Usage Instructions

### For Admin Users
1. Navigate to `/admin/events` or click the calendar icon in the navbar
2. Click "Create Event" to add new events
3. Fill out the required fields (title, date, time, location)
4. Optionally add description and image URL
5. Save the event - it will appear on the invite page immediately

### For Regular Users
1. Visit `/invite` to see all events
2. Events are automatically organized by time and year
3. Click "RSVP for this Event" to respond to invitations
4. Past events are hidden by default but can be shown

## Technical Implementation

### Event Organization Logic
```typescript
const organizeEventsByTimeAndYear = (events) => {
  // Separates events into upcoming/past based on current date
  // Groups by year for better organization
  // Sorts appropriately (upcoming: chronological, past: reverse chronological)
}
```

### Authorization Pattern
```typescript
const isAuthorized = userInfo.session?.user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID;
```

This implementation provides a complete, secure, and user-friendly event management system that integrates seamlessly with the existing application architecture.
