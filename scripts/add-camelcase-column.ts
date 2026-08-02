import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DIRECT_URL/DATABASE_URL not set');
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } as any });
  const sql = `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'universityStudentId'
  ) THEN
    ALTER TABLE athletes ADD COLUMN "universityStudentId" uuid;
    ALTER TABLE athletes ADD CONSTRAINT fk_athletes_university_student_camel FOREIGN KEY ("universityStudentId") REFERENCES university_students(id) ON DELETE SET NULL;
  END IF;
END$$;`;
  try {
    console.log('Applying camelCase athletes column...');
    await pool.query(sql);
    console.log('Applied successfully.');
  } catch (err) {
    console.error('Error applying camelCase addition:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
