import { DateTime } from "luxon";
import { supaServerClient } from "../../supa-server-client";
import { availableSlots } from "./booking";
import { modeOfLocation, specialtyCounts, VISIT_MODES } from "../doctors/directory";
import type { PublicClinic, PublicConsultation, PublicDoctor } from "../doctors/directory";
import type { BookingHost, BookingType, Clinic } from "../booking/types";

// Loads the public doctor directory. booking_hosts and booking_types are
// admin-only under RLS, so this reads with the service role and copies only
// the fields a patient may see into PublicDoctor (no login id, no internal
// ids, no admin notes). Only active doctors are listed, and not those whose
// registration has lapsed.

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

/** Columns added by the practice admin migration; absent until it is applied */
type HostExtras = {
  first_consult_fee_paise?: number | null;
  follow_up_fee_paise?: number | null;
  registration_valid_until?: string | null;
};

/** The practice's default fees, or nulls when practice settings don't exist yet */
async function practiceFees(): Promise<{ first: number | null; followUp: number | null }> {
  const { data, error } = await db()
    // Not in database.types.ts until the practice admin migration is applied
    .from("practice_settings" as never)
    .select("first_consult_fee_paise, follow_up_fee_paise")
    .maybeSingle();
  if (error || !data) return { first: null, followUp: null };
  const row = data as { first_consult_fee_paise: number | null; follow_up_fee_paise: number | null };
  return { first: row.first_consult_fee_paise, followUp: row.follow_up_fee_paise };
}

/** Active doctors (all, or the one with this slug) as hosts, without those whose registration has lapsed */
async function activeHosts(slug?: string): Promise<(BookingHost & HostExtras)[]> {
  let query = db().from("booking_hosts").select("*").eq("kind", "doctor").eq("active", true).order("name");
  if (slug) query = query.eq("slug", slug);
  const { data, error } = await query;
  if (error) throw new Error(`Loading doctors failed: ${error.message}`);
  const today = DateTime.now().setZone("Asia/Kolkata").toISODate()!;
  return ((data ?? []) as (BookingHost & HostExtras)[]).filter(
    (h) => !h.registration_valid_until || h.registration_valid_until >= today
  );
}

/** Runs fn over items a few at a time, so a long list doesn't open dozens of queries at once */
async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  return out;
}

/** Active doctors, or the one with this slug, ready for the public pages */
async function load(slug?: string): Promise<PublicDoctor[]> {
  const hosts = await activeHosts(slug);
  if (!hosts.length) return [];

  const hostIds = hosts.map((h) => h.id);
  const clinicIds = Array.from(new Set(hosts.map((h) => h.clinic_id).filter((id): id is string => !!id)));
  const [clinics, hours, links, fees] = await Promise.all([
    clinicIds.length
      ? db().from("clinics").select("*").in("id", clinicIds).eq("active", true)
      : Promise.resolve({ data: [] as Clinic[], error: null }),
    db().from("booking_weekly_hours").select("host_id, weekday, start_time, end_time").in("host_id", hostIds),
    db()
      .from("booking_type_hosts")
      .select("host_id, booking_types!inner(*)")
      .in("host_id", hostIds)
      .eq("booking_types.active", true),
    practiceFees(),
  ]);
  const failed = clinics.error || hours.error || links.error;
  if (failed) throw new Error(`Loading doctor details failed: ${failed.message}`);

  return inBatches(hosts, 4, async (host) => {
    const modes = VISIT_MODES.filter((mode) => (host.modes as string[]).includes(mode));
    // Only types in a mode the doctor offers (booking checks the same). The
    // longest (the full first visit) comes first; "next available" is for it.
    const types = (links.data ?? [])
      .filter((l) => l.host_id === host.id)
      .map((l) => l.booking_types as unknown as BookingType)
      .filter((t) => modes.includes(modeOfLocation(t.location_kind)))
      .sort((a, b) => b.duration_minutes - a.duration_minutes || a.name.localeCompare(b.name));
    const consultations: PublicConsultation[] = types.map((t) => ({
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
      modes,
      registration_number: host.registration_number,
      registration_council: host.registration_council,
      registration_verified: !!host.registration_verified_at,
      timezone: host.timezone,
      first_fee_paise: host.first_consult_fee_paise ?? fees.first,
      follow_up_fee_paise: host.follow_up_fee_paise ?? fees.followUp,
      clinic: clinic ? publicClinic(clinic) : null,
      weekly_hours: (hours.data ?? [])
        .filter((h) => h.host_id === host.id)
        .map(({ weekday, start_time, end_time }) => ({ weekday, start_time, end_time })),
      consultations,
      next_slots: await nextSlots(types[0], host),
    };
  });
}

/** Slugs of active doctors, for the sitemap and prebuilt pages (no availability lookups) */
export async function loadDoctorSlugs(): Promise<string[]> {
  return (await activeHosts()).map((h) => h.slug);
}

/** Specialties with how many active doctors have each (no availability lookups) */
export async function loadSpecialties() {
  const hosts = await activeHosts();
  return specialtyCounts(hosts.map((h) => ({ specialty: h.specialty })));
}

/** Every active doctor, A to Z */
export const loadDoctors = () => load();

/** One active doctor by slug, or null */
export async function loadDoctor(slug: string): Promise<PublicDoctor | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return null;
  const [doctor] = await load(slug);
  return doctor ?? null;
}
