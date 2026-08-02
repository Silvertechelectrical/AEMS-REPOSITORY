import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function main(){
  const conn = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  const emails = ['silvertech3l3ctrical@gmail.com','admin@kusf.org'];
  for (const email of emails) {
    const res = await pool.query('SELECT id, email, approved, role, password_hash FROM users WHERE email = $1', [email]);
    console.log('RESULT', email, JSON.stringify(res.rows, null, 2));
    if (res.rows.length) {
      console.log('MATCH silverT3CH@#5432', email, await bcrypt.compare('silverT3CH@#5432', res.rows[0].password_hash));
      console.log('MATCH Admin@123', email, await bcrypt.compare('Admin@123', res.rows[0].password_hash));
    }
  }
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
