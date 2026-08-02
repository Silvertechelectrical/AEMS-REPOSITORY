import { Pool } from 'pg';
import 'dotenv/config';

async function main(){
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } as any });
  const res = await pool.query(`SELECT id, email FROM users WHERE email = $1`, ['athlete@uon.ac.ke']);
  console.log(res.rows);
  await pool.end();
}

main().catch(e=>{ console.error(e); process.exit(1); });
