import { createClient } from '@supabase/supabase-js';

// Support both Node.js (Vercel serverless) and Vite (browser)
const supabaseUrl = typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL
  ? process.env.VITE_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseKey = typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY
  ? process.env.VITE_SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
