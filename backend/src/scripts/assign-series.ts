import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SERIES_MAP: Record<number, { seriesId: number; seriesName: string }> = {
  // categoryId -> series
  3:  { seriesId: 1, seriesName: 'Tafsir Al-Qur\'an' },      // Tafsir category
  13: { seriesId: 4, seriesName: 'Usul ath-Thalathah' },      // Usul category
  14: { seriesId: 3, seriesName: 'Bulugh al-Maram' },          // Bulugh category
  15: { seriesId: 6, seriesName: 'Tajreed' },                   // Tajreed category
  16: { seriesId: 2, seriesName: 'Riyadus Salihin' },           // Riyad category
};

const BOOK_SERIES_MAP: Record<number, { seriesId: number; seriesName: string }> = {
  155: { seriesId: 5, seriesName: 'Kitab at-Tawheed' },          // Kitab At-Tawheed
  156: { seriesId: 1, seriesName: 'Tafsir Al-Qur\'an' },         // Tafsir Ibn Kathir
  157: { seriesId: 2, seriesName: 'Riyadus Salihin' },           // Sahih Al-Bukhari -> general hadith
  158: { seriesId: 3, seriesName: 'Bulugh al-Maram' },           // Umdat Al-Ahkam -> fiqh hadith
  162: { seriesId: 2, seriesName: 'Riyadus Salihin' },           // Riyadh As-Salihin
  163: { seriesId: 4, seriesName: 'Usul ath-Thalathah' },        // Al-Manhaj As-Salim -> methodology
  164: { seriesId: 1, seriesName: 'Tafsir Al-Qur\'an' },         // Tafsiira Qur'aana Afaan Oromo
  165: { seriesId: 5, seriesName: 'Kitab at-Tawheed' },          // Aqiidaa kee qabadhu -> aqeedah
  167: { seriesId: 8, seriesName: 'Al-Arba\'in an-Nawawiyyah' }, // HADIISA AFURTAMMAN NAWAAWWII
  169: { seriesId: 1, seriesName: 'Tafsir Al-Qur\'an' },         // Tafsir Juz' Sadan Boodaa
};

interface LessonRow {
  id: number;
  title: string;
  categoryId: number | null;
  bookId: number | null;
}

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { seriesId: null },
    select: { id: true, title: true, categoryId: true, bookId: true },
  }) as LessonRow[];

  console.log(`Found ${lessons.length} lessons without seriesId`);

  let updated = 0;
  let skipped: string[] = [];

  for (const lesson of lessons) {
    let seriesId: number | null = null;
    let reason = '';

    // Try category match first
    if (lesson.categoryId && SERIES_MAP[lesson.categoryId]) {
      seriesId = SERIES_MAP[lesson.categoryId].seriesId;
      reason = `categoryId=${lesson.categoryId} -> ${SERIES_MAP[lesson.categoryId].seriesName}`;
    }
    // Then try book match
    else if (lesson.bookId && BOOK_SERIES_MAP[lesson.bookId]) {
      seriesId = BOOK_SERIES_MAP[lesson.bookId].seriesId;
      reason = `bookId=${lesson.bookId} -> ${BOOK_SERIES_MAP[lesson.bookId].seriesName}`;
    }
    // For lessons with no category/book, try to infer from title
    else {
      // Try to match by title keywords
      const title = lesson.title.toLowerCase();
      const titleOromic = lesson.title.toLowerCase();
      
      if (title.includes('tafsir') || titleOromic.includes('tafsiira')) {
        seriesId = 1;
        reason = 'title match -> Tafsir Al-Qur\'an';
      } else if (title.includes('aqeedah') || title.includes('tawheed') || titleOromic.includes('aqiida')) {
        seriesId = 5;
        reason = 'title match -> Kitab at-Tawheed';
      } else if (title.includes('hadith') || titleOromic.includes('hadiis')) {
        seriesId = 2;
        reason = 'title match -> Riyadus Salihin';
      } else if (title.includes('salaat') || titleOromic.includes('salaata') || titleOromic.includes('xahaara') || title.includes('purif') || title.includes('prayer') || title.includes('condition')) {
        seriesId = 3;
        reason = 'title match -> Bulugh al-Maram';
      } else if (titleOromic.includes('barnoota')) {
        seriesId = 4;
        reason = 'title match -> Usul ath-Thalathah (misc general)';
      }
    }

    if (seriesId) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { seriesId },
      });
      console.log(`  ✓ Lesson ${lesson.id} ("${lesson.title}") -> Series ${seriesId} (${reason})`);
      updated++;
    } else {
      skipped.push(`  ✗ Lesson ${lesson.id} ("${lesson.title}") [categoryId=${lesson.categoryId}, bookId=${lesson.bookId}]`);
    }
  }

  console.log(`\nUpdated: ${updated}`);
  if (skipped.length > 0) {
    console.log(`Skipped (${skipped.length}):`);
    skipped.forEach(s => console.log(s));
  }

  await prisma.$disconnect();
}

main();
