import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supaBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supaBaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side client with service role key (bypasses RLS)
// If no service key is provided, this will be null and we'll fall back to other methods
export const supaServerClient = supaBaseServiceKey ? 
  createClient<Database>(supaBaseUrl, supaBaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : null;
