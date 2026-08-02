import { Pool } from 'pg';
import 'dotenv/config';

async function main(){
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } as any });
  const res = await pool.query(`SELECT id, user_id, full_name FROM athletes`);
  console.log('athletes rows:', res.rows);
  await pool.end();
}

main().catch(e=>{ console.error(e); process.exit(1); });
