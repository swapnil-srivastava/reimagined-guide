import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { setCookieWithConsent, CookieCategory, EXPIRATION } from "./cookieManager";
import Cookies from "js-cookie";

const supaBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
export const supaClient = createClient<Database>(supaBaseUrl, supaBaseKey, {
  auth: {
    persistSession: true, // Default is true: stores session in localStorage
  },
});

// Extended auth methods with cookie handling
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supaClient.auth.signInWithPassword({
    email,
    password,
  });
  
  if (data?.session) {
    // Set a last login cookie as necessary
    setCookieWithConsent('last_login', new Date().toISOString(), CookieCategory.NECESSARY);
  }
  
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supaClient.auth.signInWithOAuth({
    provider: "google",
  });
  
  // If no error, set a login method cookie
  if (!error) {
    setCookieWithConsent('login_method', 'google', CookieCategory.NECESSARY);
  }
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supaClient.auth.signOut();
  
  // Clear any auth-related cookies
  Cookies.remove('last_login');
  Cookies.remove('login_method');
  
  return { error };
};
