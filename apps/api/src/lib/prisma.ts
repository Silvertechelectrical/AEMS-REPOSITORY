import path from 'node:path';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const envPath = path.resolve(process.cwd(), '.env');
config({ path: envPath });

const normalizeDatabaseUrl = (url: string) => {
  if (url.includes('sslmode=') || url.includes('sslaccept=')) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}sslmode=require&sslaccept=accept_invalid_certs`;
};

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/kusf_aems?schema=public');
const directUrl = normalizeDatabaseUrl(process.env.DIRECT_URL ?? databaseUrl);
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = directUrl;

if (process.env.NODE_ENV !== 'production' && databaseUrl.includes('sslaccept=accept_invalid_certs')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const connectDatabase = async () => {
  await prisma.$connect();
};

export const ensureSeedData = async () => {
  await connectDatabase();

  const existingAdmin = await prisma.user.findUnique({ where: { email: 'silvertech3l3ctrical@gmail.com' } });
  if (existingAdmin) {
    return prisma;
  }

  const passwordHash = await bcrypt.hash('silverT3CH@#5432', 10);

  await prisma.university.upsert({
    where: { code: 'UON' },
    update: {},
    create: { name: 'University of Nairobi', code: 'UON', location: 'Nairobi' },
  });

  const dkut = await prisma.university.upsert({
    where: { code: 'DKUT' },
    update: {},
    create: { name: 'Dedan Kimathi University of Technology', code: 'DKUT', location: 'Nyeri' },
  });

  await prisma.sport.upsert({
    where: { name: 'Football' },
    update: {},
    create: { name: 'Football', category: 'Team Sport' },
  });

  await prisma.sport.upsert({
    where: { name: 'Basketball' },
    update: {},
    create: { name: 'Basketball', category: 'Team Sport' },
  });

  await prisma.sport.upsert({
    where: { name: 'Athletics' },
    update: {},
    create: { name: 'Athletics', category: 'Track & Field' },
  });

  await prisma.user.upsert({
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

  const sportsOfficer = await prisma.user.upsert({
    where: { email: 'sports.officer@dkut.ac.ke' },
    update: {},
    create: {
      name: 'DKUT Sports Officer',
      email: 'sports.officer@dkut.ac.ke',
      passwordHash,
      role: 'SPORTS_OFFICER',
      universityId: dkut.id,
    },
  });

  const coach = await prisma.user.upsert({
    where: { email: 'coach@dkut.ac.ke' },
    update: {},
    create: {
      name: 'DKUT Coach',
      email: 'coach@dkut.ac.ke',
      passwordHash,
      role: 'COACH',
      universityId: dkut.id,
    },
  });

  const captainUser = await prisma.user.upsert({
    where: { email: 'captain@dkut.ac.ke' },
    update: {},
    create: {
      name: 'DKUT Captain',
      email: 'captain@dkut.ac.ke',
      passwordHash,
      role: 'TEAM_CAPTAIN',
      universityId: dkut.id,
    },
  });

  const playerOne = await prisma.user.upsert({
    where: { email: 'player1@dkut.ac.ke' },
    update: {},
    create: {
      name: 'DKUT Player 1',
      email: 'player1@dkut.ac.ke',
      passwordHash,
      role: 'ATHLETE',
      universityId: dkut.id,
    },
  });

  const footballSport = await prisma.sport.findUnique({ where: { name: 'Football' } });

  await prisma.athlete.upsert({
    where: { userId: captainUser.id },
    update: {},
    create: {
      userId: captainUser.id,
      fullName: captainUser.name,
      dateOfBirth: new Date('2004-05-20'),
      gender: 'Male',
      nationality: 'Kenyan',
      phone: '+254700000010',
      universityId: dkut.id,
      sportId: footballSport!.id,
      eligibilityStatus: 'APPROVED',
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.athlete.upsert({
    where: { userId: playerOne.id },
    update: {},
    create: {
      userId: playerOne.id,
      fullName: playerOne.name,
      dateOfBirth: new Date('2005-03-11'),
      gender: 'Female',
      nationality: 'Kenyan',
      phone: '+254700000011',
      universityId: dkut.id,
      sportId: footballSport!.id,
      eligibilityStatus: 'PENDING',
      verificationStatus: 'PENDING',
    },
  });

  await prisma.document.upsert({
    where: { id: 'seed-document' },
    update: {},
    create: {
      id: 'seed-document',
      athleteId: (await prisma.athlete.findFirst({ where: { userId: captainUser.id } }))!.id,
      documentType: 'ID',
      fileUrl: 'https://example.com/id.pdf',
      verificationStatus: 'VERIFIED',
    },
  });

  console.log('Seeded PostgreSQL starter data for AEMS.');
  return prisma;
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};
