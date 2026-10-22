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

// Doctors (migration 20261022170000_doctors_data_model.sql)
export type Clinic = Tables["clinics"]["Row"];
export type ClinicMember = Tables["clinic_members"]["Row"];
export type Patient = Tables["patients"]["Row"];
export type ConsentVersion = Tables["consent_versions"]["Row"];
export type PatientConsent = Tables["patient_consents"]["Row"];
export type Case = Tables["cases"]["Row"];

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
