import path from 'node:path';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

config({ path: path.resolve(process.cwd(), '.env') });

const normalizeDatabaseUrl = (url: string) => {
  if (!url) return url;
  if (url.includes('sslmode=') || url.includes('sslaccept=')) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}sslmode=require&sslaccept=accept_invalid_certs`;
};

const databaseUrl = normalizeDatabaseUrl(process.env.DIRECT_URL || process.env.DATABASE_URL || '');
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('silverT3CH@#5432', 10);
  const result = await prisma.user.upsert({
    where: { email: 'silvertech3l3ctrical@gmail.com' },
    update: {
      passwordHash,
      role: 'SUPER_ADMIN',
      approved: true,
    },
    create: {
      name: 'KUSF Super Admin',
      email: 'silvertech3l3ctrical@gmail.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      approved: true,
    },
  });

  console.log(JSON.stringify({ email: result.email, role: result.role, approved: result.approved }));
  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
