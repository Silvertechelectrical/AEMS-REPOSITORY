import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

async function main(){
  const conn = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  console.log('CONNECTED TO', conn);

  const schemaRes = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name ILIKE '%user%' ORDER BY table_schema, table_name");
  console.log('TABLES', JSON.stringify(schemaRes.rows, null, 2));

  const emails = ['silvertech3l3ctrical@gmail.com', 'admin@kusf.org'];
  for (const email of emails) {
    const res = await pool.query('SELECT id, email, approved, role, password_hash FROM "User" WHERE email = $1', [email]);
    console.log('RESULT from "User"', email, JSON.stringify(res.rows, null, 2));
    if (res.rows.length) {
      const row = res.rows[0];
      console.log('MATCH silverT3CH@#5432', email, await bcrypt.compare('silverT3CH@#5432', row.password_hash));
      console.log('MATCH Admin@123', email, await bcrypt.compare('Admin@123', row.password_hash));
    }
  }

  const res2 = await pool.query('SELECT id, email, approved, role, password_hash FROM users WHERE email = $1', ['silvertech3l3ctrical@gmail.com']);
  console.log('RESULT from users', JSON.stringify(res2.rows, null, 2));

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
