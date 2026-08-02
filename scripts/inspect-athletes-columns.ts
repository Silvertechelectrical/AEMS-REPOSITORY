import { Pool } from 'pg';
import 'dotenv/config';

async function main(){
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } as any });
  const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='athletes' ORDER BY ordinal_position`);
  console.log('athletes columns:', res.rows.map(r=>r.column_name).join(', '));
  await pool.end();
}

main().catch(e=>{ console.error(e); process.exit(1); });
