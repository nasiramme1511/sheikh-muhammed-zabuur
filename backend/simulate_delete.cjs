const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    // Try to delete series with id=1 (or some existing series)
    const id = 1; // try with a real series ID
    const existing = await p.series.findUnique({ where: { id } });
    if (!existing) {
      console.log(`Series with id=${id} not found, trying to find one...`);
      const all = await p.series.findMany({ take: 1 });
      if (all.length === 0) {
        console.log('No series exist in the database');
        return;
      }
      console.log(`Found series: ${all[0].id} - ${all[0].name}`);
      return;
    }
    console.log(`Series to delete: ${existing.id} - ${existing.name}`);

    // First check how many related records exist
    const [lessonCount, audioCount, videoCount, resourceCount, bookmarkCount] = await Promise.all([
      p.lesson.count({ where: { seriesId: id } }),
      p.audioLesson.count({ where: { seriesId: id } }),
      p.videoLesson.count({ where: { seriesId: id } }),
      p.resource.count({ where: { seriesId: id } }),
      p.bookmark.count({ where: { seriesId: id } }),
    ]);
    console.log(`Related records: lessons=${lessonCount}, audio=${audioCount}, video=${videoCount}, resources=${resourceCount}, bookmarks=${bookmarkCount}`);

    // Try the transaction
    console.log('Attempting delete transaction...');
    await p.$transaction([
      p.lesson.updateMany({ where: { seriesId: id }, data: { seriesId: null } }),
      p.audioLesson.updateMany({ where: { seriesId: id }, data: { seriesId: null } }),
      p.videoLesson.updateMany({ where: { seriesId: id }, data: { seriesId: null } }),
      p.resource.updateMany({ where: { seriesId: id }, data: { seriesId: null } }),
      p.bookmark.deleteMany({ where: { seriesId: id } }),
      p.series.delete({ where: { id } }),
    ]);
    console.log('SUCCESS: Series deleted!');
  } catch(e) {
    console.error('ERROR:', e.message);
    if (e.code) console.error('Error code:', e.code);
    if (e.meta) console.error('Meta:', JSON.stringify(e.meta, null, 2));
  } finally {
    await p.$disconnect();
  }
})();
