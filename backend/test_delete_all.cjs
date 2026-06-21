const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const all = await p.series.findMany({ orderBy: { id: 'asc' } });
    console.log('All series:');
    for (const s of all) {
      const [l, a, v, r, b] = await Promise.all([
        p.lesson.count({ where: { seriesId: s.id } }),
        p.audioLesson.count({ where: { seriesId: s.id } }),
        p.videoLesson.count({ where: { seriesId: s.id } }),
        p.resource.count({ where: { seriesId: s.id } }),
        p.bookmark.count({ where: { seriesId: s.id } }),
      ]);
      console.log(`  id=${s.id} name="${s.name}" lessons=${l} audio=${a} video=${v} res=${r} bm=${b}`);
    }
    // Try deleting each one except id 1 (which I already recreated)
    for (const s of all) {
      if (s.id === 1) continue;
      try {
        console.log(`\nTrying to delete series ${s.id} "${s.name}"...`);
        await p.$transaction([
          p.lesson.updateMany({ where: { seriesId: s.id }, data: { seriesId: null } }),
          p.audioLesson.updateMany({ where: { seriesId: s.id }, data: { seriesId: null } }),
          p.videoLesson.updateMany({ where: { seriesId: s.id }, data: { seriesId: null } }),
          p.resource.updateMany({ where: { seriesId: s.id }, data: { seriesId: null } }),
          p.bookmark.deleteMany({ where: { seriesId: s.id } }),
          p.series.delete({ where: { id: s.id } }),
        ]);
        console.log('  SUCCESS');
      } catch(e) {
        console.log(`  FAILED: ${e.message}`);
        if (e.code) console.log(`  Code: ${e.code}`);
      }
    }
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
})();
