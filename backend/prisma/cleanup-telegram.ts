import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up Telegram channels...');

  // Step 1: Delete all channels NOT owned by Sheikh Muhammad Zabuur
  const deleted = await prisma.telegramChannel.deleteMany({
    where: { teacherName: { not: 'Sheikh Muhammad Zabuur' } },
  });
  console.log(`Deleted ${deleted.count} channels owned by other teachers`);

  // Step 2: Update remaining Sheikh channels with proper categories if not set
  const remaining = await prisma.telegramChannel.findMany();
  console.log(`${remaining.length} Sheikh channels remain`);

  // Step 3: Set order for existing channels if not set
  for (const ch of remaining) {
    if (!ch.order) {
      await prisma.telegramChannel.update({
        where: { id: ch.id },
        data: { order: ch.id },
      });
    }
  }
  console.log('Channel orders updated');

  console.log('Cleanup complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
