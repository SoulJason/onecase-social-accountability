import { createClient } from "@supabase/supabase-js";
import isDev from "../utils/isDev";

// Create a single supabase client for interacting with your database
const supabaseUrl = !isDev()
  ? process.env.SUPABASE_URL
  : process.env.SUPABASE_URL_DEV;
const supabaseAnonKey = !isDev()
  ? process.env.SUPABASE_ANON_KEY
  : process.env.SUPABASE_ANON_KEY_DEV;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
