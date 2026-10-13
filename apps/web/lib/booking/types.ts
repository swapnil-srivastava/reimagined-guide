import type { Database } from "../../database.types";

// Rows of the booking tables (migration 20261013200000_booking.sql)

type Tables = Database["public"]["Tables"];

export type BookingHost = Tables["booking_hosts"]["Row"];
export type BookingType = Tables["booking_types"]["Row"];
export type BookingTypeHost = Tables["booking_type_hosts"]["Row"];
export type BookingWeeklyHours = Tables["booking_weekly_hours"]["Row"];
export type BookingDateOverride = Tables["booking_date_overrides"]["Row"];
export type BookingBlock = Tables["booking_blocks"]["Row"];
export type Booking = Tables["bookings"]["Row"];

export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";

/** The slot rules of a booking type, as computeSlots takes them */
export const rulesOf = (type: BookingType) => ({
  duration_minutes: type.duration_minutes,
  slot_step_minutes: type.slot_step_minutes,
  buffer_before_minutes: type.buffer_before_minutes,
  buffer_after_minutes: type.buffer_after_minutes,
  min_notice_minutes: type.min_notice_minutes,
  max_days_ahead: type.max_days_ahead,
  daily_limit: type.daily_limit,
});
