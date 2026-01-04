import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supaBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supaBaseUrl || !supaBaseKey) {
  throw new Error('Supabase configuration is required');
}

export const supaClient = createClient<Database>(
  supaBaseUrl, 
  supaBaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);