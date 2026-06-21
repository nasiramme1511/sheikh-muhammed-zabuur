const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const tables = ['Lesson', 'AudioLesson', 'VideoLesson', 'Resource', 'Bookmark'];
    for (const t of tables) {
      console.log(`\n=== ${t} ===`);
      const fks = await p.$queryRawUnsafe(
        `SELECT CONSTRAINT_NAME, DELETE_RULE, UPDATE_RULE FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = '${t.toLowerCase()}'`
      );
      for (const fk of fks) {
        console.log(`${fk.CONSTRAINT_NAME}: ON DELETE ${fk.DELETE_RULE}, ON UPDATE ${fk.UPDATE_RULE}`);
      }
    }
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
})();
