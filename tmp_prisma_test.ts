import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dbUrl = (() => {
  const env = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  if (!env) return env;
  if (env.includes('sslmode=') || env.includes('sslaccept=')) return env;
  const separator = env.includes('?') ? '&' : '?';
  return `${env}${separator}sslmode=require&sslaccept=accept_invalid_certs`;
})();

console.log('DB URL:', dbUrl);

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } as any });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$connect();
  const res = await prisma.$queryRaw`SELECT 1 as connected`;
  console.log('connected', res);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
