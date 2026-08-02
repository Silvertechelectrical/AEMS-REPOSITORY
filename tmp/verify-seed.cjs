const { prisma } = require('./../apps/api/src/lib/prisma.ts');

(async () => {
  const counts = await Promise.all([
    prisma.university.count(),
    prisma.sport.count(),
    prisma.user.count(),
    prisma.athlete.count(),
    prisma.document.count(),
  ]);

  console.log(JSON.stringify({
    universities: counts[0],
    sports: counts[1],
    users: counts[2],
    athletes: counts[3],
    documents: counts[4],
  }));

  await prisma.$disconnect();
})();
