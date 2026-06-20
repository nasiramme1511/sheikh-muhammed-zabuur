import { PrismaClient, ResourceType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get ALL resource records (not just AUDIO)
  const resources = await prisma.resource.findMany({
    orderBy: { id: 'asc' },
  });

  console.log(`Total resources: ${resources.length}\n`);

  // Group by resourceType
  const byType: Record<string, { count: number; examples: string[] }> = {};
  for (const r of resources) {
    const t = r.resourceType;
    if (!byType[t]) byType[t] = { count: 0, examples: [] };
    byType[t].count++;
    if (byType[t].examples.length < 3) byType[t].examples.push(r.title);
  }
  console.log('By resourceType:');
  for (const [type, info] of Object.entries(byType)) {
    console.log(`  ${type}: ${info.count} (e.g.: ${info.examples.join(', ')})`);
  }

  // Group audio resources by category
  const audioResources = resources.filter(r => r.resourceType === 'AUDIO');
  console.log(`\nAudio resources: ${audioResources.length}`);
  
  const byCategory: Record<string, number> = {};
  for (const r of audioResources) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  }
  console.log('By category:');
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  "${cat}": ${count}`);
  }

  // Show all distinct categories across all resources
  const allCategories = new Set(resources.map(r => r.category));
  console.log(`\nAll distinct categories:`);
  for (const cat of allCategories) {
    const count = resources.filter(r => r.category === cat).length;
    console.log(`  "${cat}": ${count} resources`);
  }

  // Check if any resources already have associated lessons
  console.log('\n--- Lesson count by series ---');
  const lessonsBySeries = await prisma.lesson.groupBy({
    by: ['seriesId'],
    _count: { id: true },
    orderBy: [{ seriesId: 'asc' }],
  });
  for (const l of lessonsBySeries) {
    console.log(`  seriesId=${l.seriesId}: ${l._count.id} lessons`);
  }

  await prisma.$disconnect();
}
main();
