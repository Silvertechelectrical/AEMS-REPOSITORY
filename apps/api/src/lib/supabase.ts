import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && serviceRoleKey) {
  supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export const hasSupabase = () => Boolean(supabaseClient);
export const getSupabase = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabaseClient;
};
