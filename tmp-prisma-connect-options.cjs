const { PrismaClient } = require('@prisma/client');
const url = process.env.DATABASE_URL || 'postgresql://postgres.vzusmlzwryluybysffrk:X0JNe9GsQ9IRjecZ@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1';
const prisma = new PrismaClient({ datasourceUrl: url });
prisma.$connect()
  .then(() => {
    console.log('connected');
    return prisma.$disconnect();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
