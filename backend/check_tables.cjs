const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const tables = await p.$queryRawUnsafe('SHOW TABLES');
    console.log('Tables:', tables.map(t => Object.values(t)[0]).join(', '));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
})();
