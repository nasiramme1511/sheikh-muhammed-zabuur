const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const tables = ['Lesson', 'AudioLesson', 'VideoLesson', 'Resource', 'Bookmark'];
    for (const t of tables) {
      console.log(`\n=== ${t} ===`);
      const fks = await p.$queryRawUnsafe(`SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${t.toLowerCase()}' AND REFERENCED_TABLE_NAME IS NOT NULL`);
      for (const fk of fks) {
        console.log(`${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      }
    }
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
})();
