// reuse the app's prisma instance to respect adapter/connection settings
const { prisma } = require('../apps/api/src/lib/prisma.js');

(async () => {
  try {
    await prisma.user.update({ where: { email: 'admin@kusf.org' }, data: { approved: true } });
    console.log('admin approved');
  } catch (e) {
    console.error('error approving admin:', e.message || e);
    process.exitCode = 1;
  } finally {
    try { await prisma.$disconnect(); } catch (_) {}
  }
})();
