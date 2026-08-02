import fs from 'fs';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const sql = fs.readFileSync('prisma/schema.sql', 'utf8');
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DIRECT_URL/DATABASE_URL not set in env');

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } as any });
  try {
    console.log('Applying schema.sql to database...');
    await pool.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Failed to apply schema:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
