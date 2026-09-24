import type { NextApiRequest } from "next";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "../../database.types";

const supaBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supaBaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface AuthedRequest {
  user: User;
  /** Client acting as the caller, so row level security applies to every query */
  client: SupabaseClient<Database>;
}

/**
 * Resolves the caller from the `Authorization: Bearer <jwt>` header.
 * Returns null when the header is missing or the token is invalid.
 */
export async function getAuthedRequest(
  req: NextApiRequest
): Promise<AuthedRequest | null> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const client = createClient<Database>(supaBaseUrl, supaBaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error || !user) return null;

  return { user, client };
}
