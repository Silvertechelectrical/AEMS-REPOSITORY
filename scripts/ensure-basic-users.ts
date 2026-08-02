import { Pool } from 'pg';
import 'dotenv/config';
import bcrypt from 'bcrypt';

async function main(){
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } as any });
  const passwordHash = await bcrypt.hash('silverT3CH@#5432', 10);
  const users = [
    { name: 'KUSF Super Admin', email: 'silvertech3l3ctrical@gmail.com', role: 'SUPER_ADMIN' },
    { name: 'Coach Maina', email: 'coach@uon.ac.ke', role: 'COACH' },
    { name: 'John Otieno', email: 'athlete@uon.ac.ke', role: 'ATHLETE' },
  ];

  for (const u of users) {
    try {
      const r = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, approved, created_at, updated_at)
         VALUES ($1,$2,$3,$4,true,now(),now())
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, approved = true RETURNING *`,
        [u.name, u.email, passwordHash, u.role]
      );
      console.log('ensured user', u.email, r.rows[0].id);
    } catch (e) {
      console.error('failed to ensure user', u.email, e?.message || e);
    }
  }

  await pool.end();
}

main().catch(e=>{ console.error(e); process.exit(1); });
