import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function main() {
  const conn = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } });

  const tableRes = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User'");
  console.log('USER TABLE:', JSON.stringify(tableRes.rows, null, 2));

  const emails = ['silvertech3l3ctrical@gmail.com', 'admin@kusf.org'];
  for (const email of emails) {
    const res = await pool.query('SELECT id, email, approved, role, "passwordHash" FROM public."User" WHERE email = $1', [email]);
    console.log('RESULT for', email, JSON.stringify(res.rows, null, 2));
    if (res.rows.length) {
      const row = res.rows[0];
      console.log('PASSWORD MATCH silverT3CH@#5432', email, await bcrypt.compare('silverT3CH@#5432', row.passwordHash));
      console.log('PASSWORD MATCH Admin@123', email, await bcrypt.compare('Admin@123', row.passwordHash));
    }
  }

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
