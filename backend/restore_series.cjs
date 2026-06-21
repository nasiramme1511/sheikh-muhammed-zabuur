const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  // Restore series id=1 if missing, and relink lessons that were unlinked
  const series = await p.series.findUnique({ where: { id: 1 } });
  if (series) {
    console.log('Series 1 already exists');
    return;
  }
  // Recreate series
  await p.series.create({
    data: {
      id: 1,
      name: "Tafsir Al-Qur'an",
      slug: 'tafsir-al-quran',
      description: "In-depth explanation and interpretation of the Noble Qur'an, covering meanings, context, and rulings.",
      order: 0,
      totalLessons: 15,
      totalHours: 0,
    },
  });
  console.log('Series 1 restored');
  // Relink lessons with null series back to series 1
  const result = await p.lesson.updateMany({
    where: { seriesId: null, title: { contains: 'Tafsir' } },
    data: { seriesId: 1 },
  });
  console.log(`Relinked ${result.count} lessons`);
  await p.$disconnect();
})();
