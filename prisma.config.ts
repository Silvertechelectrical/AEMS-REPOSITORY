import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/kusf_aems?schema=public';
const directUrl = process.env.DIRECT_URL ?? databaseUrl;

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
    directUrl,
  },
});
