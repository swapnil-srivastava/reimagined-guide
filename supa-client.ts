import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supaBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supaBaseUrl || !supaBaseKey) {
  console.error('Supabase configuration missing:', {
    hasUrl: !!supaBaseUrl,
    hasKey: !!supaBaseKey,
    env: process.env.NODE_ENV
  });
}

export const supaClient = createClient<Database>(
  supaBaseUrl || '', 
  supaBaseKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);