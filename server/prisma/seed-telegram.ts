import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Telegram channels...');

  await prisma.telegramChannel.deleteMany({});

  const channels = [
    // Ust. Shaafii Muhammed (مركز عمر بن الخطاب)
    { name: "Arba'iin Annawaawi", link: 'https://t.me/Markazhaumar1444', teacherName: 'Ust. Shaafii Muhammed', description: 'Darsiilee Arba,iin Annawaawi' },
    { name: 'Umdatul Ahkaam', link: 'https://t.me/markazaUmarl1444', teacherName: 'Ust. Shaafii Muhammed', description: 'Darsiilee Umdatul Ahkaam' },
    { name: 'Tafsiira', link: 'https://t.me/mAnsar123', teacherName: 'Ust. Shaafii Muhammed', description: 'Tafsiira Qur\'aanaa sagaleen hordofuu' },
    { name: 'Buluugh Al-Maraam', link: 'https://t.me/MAnsaar134', teacherName: 'Ust. Shaafii Muhammed', description: 'Darsii Buluugh al-Maraam' },
    { name: 'Nahwii Aajirumiyya', link: 'https://t.me/+NTJLenvCwSQwYjc0', teacherName: 'Ust. Shaafii Muhammed', description: 'Nahwii online course' },
    { name: 'Duruusul Muhimmaa', link: 'https://t.me/+TEiA1wBG9y82NTJk', teacherName: 'Ust. Shaafii Muhammed', description: 'Important lessons for the community' },
    { name: 'Usuulu ssalaasa / Qawaa idul Arba,a', link: 'https://t.me/markazaumar', teacherName: 'Ust. Shaafii Muhammed', description: 'Usuul as-Salaasah and Al-Qawaa\'id al-Arba\'a' },
    { name: 'Tafsiira Qur\'aanaa (tafsiira2022)', link: 'https://t.me/tafsiira2022', teacherName: 'Ust. Shaafii Muhammed', description: 'Warri Tafsiira Qur\'aanaa hordofuu barbaaddaniis kunoo' },
    { name: 'Nahwii Online', link: 'https://t.me/+pI_Co-0ihnQ1NmJk', teacherName: 'Ust. Shaafii Muhammed', description: 'Namoonni Nahwii online baratamaa jirtu hordofuu feetaniis' },
    { name: 'Buluugh Al-Maraam (Online)', link: 'https://t.me/buluuga2022', teacherName: 'Ust. Shaafii Muhammed', description: 'Darsii Buluugh al-Maraam online' },
    { name: 'Audiyoolee Aqiidaa', link: 'https://t.me/aqiidaa1', teacherName: 'Ust. Shaafii Muhammed', description: 'Audiyoolee Aqiidaa' },
    { name: 'At-Tajreed As-Sareeh', link: 'https://t.me/tajriida', teacherName: 'Ust. Shaafii Muhammed', description: 'Darsii At-Tajreed As-Sareeh' },
    { name: 'Barnoota Fiqhii', link: 'https://t.me/barnoota_Fiqhii', teacherName: 'Ust. Shaafii Muhammed', description: 'Barnoota Fiqhii' },

    // Sheikh Muhammad Zabuur
    { name: 'Darsii Beeyquunaa', link: 'https://t.me/Shekzabuur12', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Al-Bayquniyyah' },
    { name: 'Darsii BULUUKAA', link: 'https://t.me/sheikhzabuur00', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Bulugh al-Maram' },
    { name: 'Darsii Diddu toohid fi Talkiis', link: 'https://t.me/Sheikzabuur12', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Diddu Tawheed' },
    { name: 'Darsii RIYAADAA', link: 'https://t.me/sheek1Z', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Riyadh as-Salihin' },
    { name: 'Darsii Tafsiiraa', link: 'https://t.me/Sheehk1Z', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Tafsiira kan guyyaa' },
    { name: 'Darsii Tajriidaa', link: 'https://t.me/Sheikzabuur1234', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Tajrid' },
    { name: 'Darsii Usuula salaasaa, kitaabuthis fi Arba,iina', link: 'https://t.me/sheikzabuur', teacherName: 'Sheikh Muhammad Zabuur', description: 'Usuul as-Salaasah, Kitaab at-Tawheed, Arba\'un' },

    // Dr. Sheikh Muussaa Su'aalaa
    { name: 'Tafsiira quraanaa', link: 'https://t.me/tafsiira2022', teacherName: 'Dr. Sheikh Muussaa Su\'aalaa', description: 'Tafsiira quraanaa kan Dr. Sheikh Muussaa Su\'aalaa' },
  ];

  for (const ch of channels) {
    await prisma.telegramChannel.create({ data: ch });
  }

  console.log(`${channels.length} Telegram channels seeded successfully!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
