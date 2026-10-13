import { useCallback, useEffect, useState } from "react";
import { supaClient } from "../../../supa-client";
import type {
  Booking,
  BookingBlock,
  BookingDateOverride,
  BookingHost,
  BookingType,
  BookingTypeHost,
  BookingWeeklyHours,
} from "../../../lib/booking/types";

export interface BookingAdminData {
  hosts: BookingHost[];
  types: BookingType[];
  typeHosts: BookingTypeHost[];
  weeklyHours: BookingWeeklyHours[];
  overrides: BookingDateOverride[];
  blocks: BookingBlock[];
  bookings: Booking[];
}

const EMPTY: BookingAdminData = {
  hosts: [],
  types: [],
  typeHosts: [],
  weeklyHours: [],
  overrides: [],
  blocks: [],
  bookings: [],
};

/**
 * Everything the booking admin page shows. Row level security only lets
 * admins read these tables, so for anyone else every list comes back empty.
 * The volume is small (one host, a few bookings a week), so it all loads at
 * once and every save reloads it.
 */
export function useBookingAdmin() {
  const [data, setData] = useState<BookingAdminData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    // Past bookings and blocks from the last 90 days are kept in view
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const [hosts, types, typeHosts, weeklyHours, overrides, blocks, bookings] = await Promise.all([
      supaClient.from("booking_hosts").select("*").order("created_at"),
      supaClient.from("booking_types").select("*").order("created_at"),
      supaClient.from("booking_type_hosts").select("*"),
      supaClient.from("booking_weekly_hours").select("*").order("weekday").order("start_time"),
      supaClient.from("booking_date_overrides").select("*").order("date").order("start_time"),
      supaClient.from("booking_blocks").select("*").gte("ends_at", since).order("starts_at"),
      supaClient.from("bookings").select("*").gte("starts_at", since).order("starts_at"),
    ]);
    const failed = [hosts, types, typeHosts, weeklyHours, overrides, blocks, bookings].find((r) => r.error);
    if (failed?.error) {
      console.error("Loading booking data failed", failed.error);
      setError(failed.error.message);
    } else {
      setError(null);
    }
    setData({
      hosts: hosts.data ?? [],
      types: types.data ?? [],
      typeHosts: typeHosts.data ?? [],
      weeklyHours: weeklyHours.data ?? [],
      overrides: overrides.data ?? [],
      blocks: blocks.data ?? [],
      bookings: bookings.data ?? [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
