import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import fs from 'fs';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const adminCliSecret = process.env.ADMIN_CLI_SECRET ?? '';
const expectedSecret = process.env.SUPABASE_ADMIN_CLI_SECRET ?? '';

if (!url || !serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL in .env');
  process.exit(1);
}

if (!adminCliSecret || adminCliSecret !== expectedSecret) {
  console.error('Missing or invalid ADMIN_CLI_SECRET. This script is restricted to local admins.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const users = [
  { email: 'silvertech3l3ctrical@gmail.com', password: 'silverT3CH@#5432', user_metadata: { full_name: 'KUSF Super Admin', role: 'SUPER_ADMIN' } },
  { email: 'sports.officer@dkut.ac.ke', password: 'Admin@123', user_metadata: { full_name: 'DKUT Sports Officer', role: 'SPORTS_OFFICER' } },
  { email: 'coach@dkut.ac.ke', password: 'Admin@123', user_metadata: { full_name: 'DKUT Coach', role: 'COACH' } },
  { email: 'captain@dkut.ac.ke', password: 'Admin@123', user_metadata: { full_name: 'DKUT Captain', role: 'TEAM_CAPTAIN' } },
  { email: 'player1@dkut.ac.ke', password: 'Admin@123', user_metadata: { full_name: 'DKUT Player 1', role: 'ATHLETE' } },
];

async function upsertUsers() {
  for (const u of users) {
    try {
      // Try to get existing user by email via admin API
      const { data: list, error: listError } = await supabase.auth.admin.listUsers({ filter: `email.eq.${u.email}` } as any);
      if (listError) {
        // fallback to create
        console.warn('listUsers error:', listError.message);
      }

      if (list && (list as any).users && (list as any).users.length > 0) {
        console.log(`User exists: ${u.email}`);
        continue;
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        user_metadata: u.user_metadata,
        email_confirm: true,
      } as any);

      if (error) {
        console.error(`Failed to create ${u.email}:`, error.message);
      } else {
        console.log(`Created user ${u.email}`);
      }
    } catch (e: any) {
      console.error('Unexpected error for', u.email, e?.message || e);
    }
  }
}

upsertUsers().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
