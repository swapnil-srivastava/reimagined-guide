import { DateTime } from "luxon";
import { supaServerClient } from "../../supa-server-client";
import { availableSlots } from "./booking";
import { modeOfLocation, VISIT_MODES } from "../doctors/directory";
import type { PublicClinic, PublicConsultation, PublicDoctor, VisitMode } from "../doctors/directory";
import type { BookingHost, BookingType, Clinic } from "../booking/types";

// Loads the public doctor directory. booking_hosts and booking_types are
// admin-only under RLS, so this reads with the service role and copies only
// the fields a patient may see into PublicDoctor (no login id, no internal
// ids, no admin notes). Only active doctors are listed.

/** How far ahead "next available" looks */
const NEXT_SLOTS_DAYS = 14;
/** Free times shown on a profile */
const NEXT_SLOTS_SHOWN = 6;

/** False when the service role key is missing, e.g. in a local build */
export const directoryConfigured = !!supaServerClient;

function db() {
  if (!supaServerClient) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return supaServerClient;
}

const publicClinic = (clinic: Clinic): PublicClinic => ({
  name: clinic.name,
  address_line1: clinic.address_line1,
  address_line2: clinic.address_line2,
  city: clinic.city,
  state: clinic.state,
  postcode: clinic.postcode,
  phone: clinic.phone,
  map_url: clinic.map_url,
});

/** Next free times of the doctor's first consultation; none when slots can't be worked out */
async function nextSlots(type: BookingType | undefined, host: BookingHost): Promise<string[]> {
  if (!type) return [];
  const from = new Date();
  const to = DateTime.fromJSDate(from).plus({ days: NEXT_SLOTS_DAYS }).toJSDate();
  try {
    const slots = await availableSlots(type, host, from, to);
    return slots.slice(0, NEXT_SLOTS_SHOWN).map((s) => s.start);
  } catch (error) {
    // The list still shows without times rather than failing as a whole
    console.error(`Next free times for ${host.slug} failed:`, error);
    return [];
  }
}

/** Active doctors, or the one with this slug, ready for the public pages */
async function load(slug?: string): Promise<PublicDoctor[]> {
  let hostsQuery = db().from("booking_hosts").select("*").eq("kind", "doctor").eq("active", true).order("name");
  if (slug) hostsQuery = hostsQuery.eq("slug", slug);
  const { data: hosts, error } = await hostsQuery;
  if (error) throw new Error(`Loading doctors failed: ${error.message}`);
  if (!hosts?.length) return [];

  const hostIds = hosts.map((h) => h.id);
  const clinicIds = Array.from(new Set(hosts.map((h) => h.clinic_id).filter((id): id is string => !!id)));
  const [clinics, hours, links] = await Promise.all([
    clinicIds.length
      ? db().from("clinics").select("*").in("id", clinicIds).eq("active", true)
      : Promise.resolve({ data: [] as Clinic[], error: null }),
    db().from("booking_weekly_hours").select("host_id, weekday, start_time, end_time").in("host_id", hostIds),
    db()
      .from("booking_type_hosts")
      .select("host_id, is_default, booking_types!inner(*)")
      .in("host_id", hostIds)
      .eq("booking_types.active", true),
  ]);
  const failed = clinics.error || hours.error || links.error;
  if (failed) throw new Error(`Loading doctor details failed: ${failed.message}`);

  return Promise.all(
    hosts.map(async (host) => {
      // The default type first (it is the one "next available" is for), then shortest first
      const types = (links.data ?? [])
        .filter((l) => l.host_id === host.id)
        .sort((a, b) => Number(b.is_default) - Number(a.is_default))
        .map((l) => l.booking_types as unknown as BookingType);
      const [first, ...rest] = types;
      const ordered = first ? [first, ...rest.sort((a, b) => a.duration_minutes - b.duration_minutes)] : [];
      const consultations: PublicConsultation[] = ordered.map((t) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
        duration_minutes: t.duration_minutes,
        mode: modeOfLocation(t.location_kind),
      }));
      const clinic = (clinics.data ?? []).find((c) => c.id === host.clinic_id);
      return {
        slug: host.slug,
        name: host.name,
        title: host.title,
        qualification: host.qualification,
        specialty: host.specialty,
        bio: host.bio,
        languages: host.languages ?? [],
        photo_url: host.photo_url,
        modes: VISIT_MODES.filter((mode) => (host.modes as string[]).includes(mode)) as VisitMode[],
        registration_number: host.registration_number,
        registration_council: host.registration_council,
        registration_verified: !!host.registration_verified_at,
        timezone: host.timezone,
        clinic: clinic ? publicClinic(clinic) : null,
        weekly_hours: (hours.data ?? [])
          .filter((h) => h.host_id === host.id)
          .map(({ weekday, start_time, end_time }) => ({ weekday, start_time, end_time })),
        consultations,
        next_slots: await nextSlots(ordered[0], host),
      };
    })
  );
}

/** Slugs of active doctors, for the sitemap (no availability lookups) */
export async function loadDoctorSlugs(): Promise<string[]> {
  const { data, error } = await db().from("booking_hosts").select("slug").eq("kind", "doctor").eq("active", true);
  if (error) throw new Error(`Loading doctors failed: ${error.message}`);
  return (data ?? []).map((d) => d.slug);
}

/** Every active doctor, A to Z */
export const loadDoctors = () => load();

/** One active doctor by slug, or null */
export async function loadDoctor(slug: string): Promise<PublicDoctor | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return null;
  const [doctor] = await load(slug);
  return doctor ?? null;
}
