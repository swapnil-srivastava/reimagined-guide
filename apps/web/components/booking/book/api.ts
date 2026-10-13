import type { PublicBooking, PublicContext } from "../../../lib/server/booking";
import type { Slot } from "../../../lib/booking/slots";

// Calls to the booking link's API routes (/api/booking/<token>/...)

export type { PublicBooking, PublicContext, Slot };

// One flat shape: the repo's tsconfig isn't strict, so a union wouldn't narrow
export interface ApiResult<T> {
  ok: boolean;
  status: number;
  error: string;
  /** Only set when ok */
  data: T;
}

export async function bookingApi<T>(token: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api/booking/${encodeURIComponent(token)}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: json.error ?? "server", data: undefined as unknown as T };
    return { ok: true, status: res.status, error: "", data: json as T };
  } catch {
    return { ok: false, status: 0, error: "network", data: undefined as unknown as T };
  }
}

/** The buyer's zone as the browser reports it */
export function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
