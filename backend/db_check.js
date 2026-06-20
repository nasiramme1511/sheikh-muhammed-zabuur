const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teachers = await prisma.teacher.findMany({
    select: { name: true, slug: true }
  });
  console.log('Teachers in DB:', teachers);
  const channels = await prisma.telegramChannel.findMany({
    select: { name: true, teacherName: true }
  });
  console.log('Telegram channels in DB (Count):', channels.length);
  channels.forEach(ch => {
    console.log(`- ${ch.name} (${ch.teacherName})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
