/// <reference types="vite/client" />

import { createClient } from "@supabase/supabase-js";

// Use import.meta.env instead of process.env in Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase Environment Variables in .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
