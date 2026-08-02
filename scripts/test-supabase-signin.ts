import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !anon) {
  console.error('Missing anon key or URL');
  process.exit(1);
}

const supabase = createClient(url, anon);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'admin@kusf.org', password: 'Admin@123' });
  if (error) {
    console.error('Signin failed:', error.message);
    process.exit(1);
  }
  console.log('Signin success, user id:', data.user?.id);
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
