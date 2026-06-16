import 'dotenv/config';
import prisma from '../src/lib/prisma';
import path from 'path';

// Mirrors deriveCollection from index.ts and collections.ts
function deriveCollection(filename: string): string | null {
  const n = path.basename(filename, path.extname(filename)).toLowerCase().replace(/[-_]/g, ' ');
  const pairs: [string, string][] = [
    ['riyad', 'riyadhus-salihin'], ['salihin', 'riyadhus-salihin'], ['riyadh', 'riyadhus-salihin'],
    ['bulugh', 'bulugh-al-maram'],
    ['umdat', 'umdat-al-ahkam'], ['umdah', 'umdat-al-ahkam'],
    ['tafsir-ibn', 'tafsir-ibn-kathir'], ['ibn-kathir', 'tafsir-ibn-kathir'],
    ['tafsir', 'tafsir-al-quran'], ['quran', 'tafsir-al-quran'], ['surah', 'tafsir-al-quran'], ['ayat', 'tafsir-al-quran'],
    ['usul', 'usul-ath-thalatha'],
    ['tawheed', 'kitab-at-tawheed'],
    ['wasitiyyah', 'al-aqeedah-al-wasitiyyah'],
    ['manhaj', 'al-manhaj-as-salim'],
    ['tajweed', 'tajweed'], ['tajwid', 'tajweed'], ['nuraniyyah', 'tajweed'], ['noorani', 'tajweed'], ['qaidah', 'tajweed'], ['tahsin', 'tajweed'],
    ['arabic', 'arabic-grammar'], ['nahw', 'arabic-grammar'], ['sarf', 'arabic-grammar'], ['grammar', 'arabic-grammar'], ['ajrumiyyah', 'arabic-grammar'],
    ['seerah', 'seerah-nabawiyyah'], ['sirah', 'seerah-nabawiyyah'], ['raheeq', 'seerah-nabawiyyah'], ['makhtum', 'seerah-nabawiyyah'],
    ['fiqh', 'fiqh'], ['salah', 'fiqh'], ['prayer', 'fiqh'], ['wudu', 'fiqh'], ['zakat', 'fiqh'], ['sawm', 'fiqh'], ['hajj', 'fiqh'],
    ['ramadan', 'ramadan'], ['ramadhan', 'ramadan'],
    ['khutbah', 'khutbah'], ['sermon', 'khutbah'],
    ['qa-', 'questions-and-answers'], ['question', 'questions-and-answers'], ['fatwa', 'questions-and-answers'],
    ['general', 'general-lectures'], ['lecture', 'general-lectures'], ['dawah', 'general-lectures'],
  ];
  for (const [kw, colSlug] of pairs) {
    if (n.includes(kw)) return colSlug;
  }
  return null;
}

async function main() {
  console.log('Backfilling collection field for existing resources...\n');

  const resources = await prisma.resource.findMany({
    where: { collection: null },
    select: { id: true, title: true, fileUrl: true, category: true },
  });

  console.log(`Found ${resources.length} resources without a collection\n`);

  let updated = 0;
  for (const r of resources) {
    const fromUrl = deriveCollection(r.fileUrl);
    const fromTitle = deriveCollection(r.title);
    const fromCategory = deriveCollection(r.category);

    const collection = fromUrl || fromTitle || fromCategory || null;
    if (collection) {
      await prisma.resource.update({
        where: { id: r.id },
        data: { collection },
      });
      updated++;
      console.log(`  ✓ [${r.id}] "${r.title}" → ${collection}`);
    }
  }

  console.log(`\nDone. Updated ${updated} resources.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
