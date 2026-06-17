import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Telegram channels...');

  await prisma.telegramChannel.deleteMany({});

  const channels = [
    // Sheikh Muhammad Zabuur — all channels organized by collection
    { name: 'Riyadh as-Salihin',   link: 'https://t.me/sheek1Z',             teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Riyadh as-Salihin',          category: 'RIYADH',   order: 1 },
    { name: 'Tafsir al-Quran',     link: 'https://t.me/Sheehk1Z',            teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Tafsiira kan guyyaa',      category: 'TAFSIR',   order: 2 },
    { name: 'Bulugh al-Maram',     link: 'https://t.me/sheikhzabuur00',      teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Bulugh al-Maram',          category: 'BULUGH',   order: 3 },
    { name: 'At-Tajreed as-Sareeh',link: 'https://t.me/Sheikzabuur1234',     teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Tajrid',                  category: 'TAJREED',  order: 4 },
    { name: 'Usul ath-Thalathah',  link: 'https://t.me/sheikzabuur',         teacherName: 'Sheikh Muhammad Zabuur', description: 'Usuul as-Salaasah, Kitaab at-Tawheed, Arba\'un', category: 'USUL', order: 5 },
    { name: 'Al-Bayquniyyah',      link: 'https://t.me/Shekzabuur12',        teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Al-Bayquniyyah',           category: 'BAYQUNIYYAH', order: 6 },
    { name: 'Kitab at-Tawheed',    link: 'https://t.me/Sheikzabuur12',       teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Diddu Tawheed',            category: 'TAWHEED',  order: 7 },
  ];

  for (const ch of channels) {
    await prisma.telegramChannel.create({ data: ch });
  }

  console.log(`${channels.length} Telegram channels seeded successfully!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
