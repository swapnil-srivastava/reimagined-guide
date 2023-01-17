import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supaBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supaClient = createClient<Database>(supaBaseUrl, supaBaseKey);