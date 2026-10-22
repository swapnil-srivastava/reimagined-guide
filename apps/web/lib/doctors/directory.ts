// The public doctor directory (/book-appointment, /doctors, /doctors/<slug>).
// Pure: the shapes the pages get, plus search, filters and sorting, so the
// list page and the tests use exactly the same rules. The server side that
// loads these from the database is lib/server/doctors.ts.

export type VisitMode = "in_person" | "video" | "audio";

export const VISIT_MODES: VisitMode[] = ["in_person", "video", "audio"];

/** What a patient may see about a clinic */
export interface PublicClinic {
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  phone: string | null;
  map_url: string | null;
}

/** An active booking type the doctor offers */
export interface PublicConsultation {
  slug: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  mode: VisitMode;
}

/** What a patient may see about a doctor. Never the login or internal ids. */
export interface PublicDoctor {
  slug: string;
  name: string;
  title: string | null;
  qualification: string | null;
  specialty: string | null;
  bio: string | null;
  languages: string[];
  photo_url: string | null;
  modes: VisitMode[];
  registration_number: string | null;
  registration_council: string | null;
  /** An admin checked the registration with the council */
  registration_verified: boolean;
  /** The doctor's own zone; working hours are wall-clock times in it */
  timezone: string;
  clinic: PublicClinic | null;
  weekly_hours: { weekday: number; start_time: string; end_time: string }[];
  consultations: PublicConsultation[];
  /** Next free start times (UTC ISO) of the first consultation, soonest first */
  next_slots: string[];
}

export type Availability = "any" | "today" | "week";
export type SortKey = "next" | "name";

export interface DirectoryFilters {
  query: string;
  /** "" means every specialty */
  specialty: string;
  languages: string[];
  modes: VisitMode[];
  availability: Availability;
  sort: SortKey;
}

export const NO_FILTERS: DirectoryFilters = {
  query: "",
  specialty: "",
  languages: [],
  modes: [],
  availability: "any",
  sort: "next",
};

/** Lower case, accents removed, so "dermato" finds "Dermatologist" */
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** True when every word typed appears in the doctor's name, specialty, qualification or languages */
export function matchesQuery(doctor: PublicDoctor, query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = fold(
    [doctor.name, doctor.title, doctor.specialty, doctor.qualification, ...doctor.languages].filter(Boolean).join(" ")
  );
  return words.every((word) => haystack.includes(word));
}

/** Drops free times that passed since the page was built (pages are cached for a few minutes) */
export function withoutPastSlots(doctors: PublicDoctor[], now: number): PublicDoctor[] {
  return doctors.map((d) => ({ ...d, next_slots: d.next_slots.filter((s) => Date.parse(s) > now) }));
}

/** The doctor's first free time, or null when none is published */
export const nextSlot = (doctor: PublicDoctor): string | null => doctor.next_slots[0] ?? null;

/**
 * True when the doctor's next free time falls in the window. "Today" and
 * "this week" are the visitor's own (their zone), ending at local midnight
 * and seven days from now.
 */
export function availableWithin(doctor: PublicDoctor, availability: Availability, now: Date, zone: string): boolean {
  if (availability === "any") return true;
  const next = nextSlot(doctor);
  if (!next) return false;
  const at = Date.parse(next);
  if (availability === "week") return at < now.getTime() + 7 * 24 * 60 * 60 * 1000;
  return sameDay(new Date(at), now, zone);
}

function sameDay(a: Date, b: Date, zone: string): boolean {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" });
  return day.format(a) === day.format(b);
}

export function filterDoctors(
  doctors: PublicDoctor[],
  filters: DirectoryFilters,
  now: Date,
  zone: string
): PublicDoctor[] {
  const list = doctors.filter(
    (doctor) =>
      matchesQuery(doctor, filters.query) &&
      (!filters.specialty || doctor.specialty === filters.specialty) &&
      // A doctor matches when they speak any one of the chosen languages
      (!filters.languages.length || filters.languages.some((l) => doctor.languages.includes(l))) &&
      (!filters.modes.length || filters.modes.some((mode) => doctor.modes.includes(mode))) &&
      availableWithin(doctor, filters.availability, now, zone)
  );
  return sortDoctors(list, filters.sort);
}

/** "next": soonest free time first, doctors without one last; then by name */
export function sortDoctors(doctors: PublicDoctor[], sort: SortKey): PublicDoctor[] {
  const byName = (a: PublicDoctor, b: PublicDoctor) => a.name.localeCompare(b.name);
  if (sort === "name") return [...doctors].sort(byName);
  return [...doctors].sort((a, b) => {
    const na = nextSlot(a);
    const nb = nextSlot(b);
    if (na && nb && na !== nb) return Date.parse(na) - Date.parse(nb);
    if (na && !nb) return -1;
    if (!na && nb) return 1;
    return byName(a, b);
  });
}

/** Specialties with how many doctors have each, most common first */
export function specialtyCounts(doctors: PublicDoctor[]): { specialty: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const doctor of doctors) {
    if (doctor.specialty) counts.set(doctor.specialty, (counts.get(doctor.specialty) ?? 0) + 1);
  }
  return Array.from(counts, ([specialty, count]) => ({ specialty, count })).sort(
    (a, b) => b.count - a.count || a.specialty.localeCompare(b.specialty)
  );
}

/** Every language some doctor speaks, A to Z */
export function allLanguages(doctors: PublicDoctor[]): string[] {
  return Array.from(new Set(doctors.flatMap((d) => d.languages))).sort((a, b) => a.localeCompare(b));
}

/** How many filters (not search or sort) are switched on, for the Filters button badge */
export function activeFilterCount(filters: DirectoryFilters): number {
  return filters.languages.length + filters.modes.length + (filters.availability === "any" ? 0 : 1);
}

/** One line of a clinic's address: "FC Road, Pune, Maharashtra 411004" */
export function clinicAddress(clinic: PublicClinic): string {
  const place = [clinic.state, clinic.postcode].filter(Boolean).join(" ");
  return [clinic.address_line1, clinic.address_line2, clinic.city, place].filter(Boolean).join(", ");
}

/** Booking types' location kind ('phone' is an audio call), as a visit mode */
export function modeOfLocation(kind: string): VisitMode {
  if (kind === "in_person") return "in_person";
  if (kind === "phone") return "audio";
  return "video";
}

/** Weekly hours grouped for display: one row per weekday, Monday first, with every range that day */
export function hoursByWeekday(hours: PublicDoctor["weekly_hours"]): { weekday: number; ranges: [string, string][] }[] {
  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    weekday,
    ranges: hours
      .filter((h) => h.weekday === weekday)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map((h) => [h.start_time.slice(0, 5), h.end_time.slice(0, 5)] as [string, string]),
  }));
}

/** Reads the list page's filters from its URL (?q=&specialty=&lang=&mode=&when=&sort=) */
export function filtersFromQuery(query: Record<string, string | string[] | undefined>): DirectoryFilters {
  const one = (key: string) => {
    const value = query[key];
    return (Array.isArray(value) ? value[0] : value)?.slice(0, 100) ?? "";
  };
  const many = (key: string) =>
    one(key)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 10);
  const when = one("when");
  return {
    query: one("q"),
    specialty: one("specialty"),
    languages: many("lang"),
    modes: many("mode").filter((m): m is VisitMode => (VISIT_MODES as string[]).includes(m)),
    availability: when === "today" || when === "week" ? when : "any",
    sort: one("sort") === "name" ? "name" : "next",
  };
}

/** The URL query for a set of filters, leaving out everything at its default */
export function filtersToQuery(filters: DirectoryFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.query.trim()) query.q = filters.query.trim();
  if (filters.specialty) query.specialty = filters.specialty;
  if (filters.languages.length) query.lang = filters.languages.join(",");
  if (filters.modes.length) query.mode = filters.modes.join(",");
  if (filters.availability !== "any") query.when = filters.availability;
  if (filters.sort !== "next") query.sort = filters.sort;
  return query;
}
