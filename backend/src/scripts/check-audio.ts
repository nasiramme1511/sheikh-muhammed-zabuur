import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { seriesId: 2 },
    select: { id: true, title: true, audioUrl: true },
    orderBy: { id: 'asc' },
  });

  let hasSpace = 0;
  let cloudinary = 0;
  let local = 0;

  for (const l of lessons) {
    const url = l.audioUrl || '';
    if (url.includes(' ')) {
      hasSpace++;
      console.log(`  SPACE: #${l.id} "${l.title}"`);
      console.log(`         ${url}`);
    }
    if (url.includes('cloudinary')) cloudinary++;
    if (url.startsWith('/uploads')) local++;
  }

  console.log(`\nTotal: ${lessons.length}`);
  console.log(`With spaces: ${hasSpace}`);
  console.log(`Cloudinary: ${cloudinary}`);
  console.log(`Local uploads: ${local}`);
  console.log(`Other: ${lessons.length - cloudinary - local}`);

  // Also check what files exist on disk
  const fs = require('fs');
  const uploadDir = 'C:\\xampp\\htdocs\\sh-zabuur-official-app\\backend\\public\\uploads\\audio';
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    console.log(`\nFiles in uploads/audio: ${files.length}`);
    // Show first 10
    files.slice(0, 10).forEach(f => console.log(`  ${f}`));
  } else {
    console.log(`\nuploads/audio directory not found at ${uploadDir}`);
    // Try alternative paths
    const altPaths = [
      'C:\\xampp\\htdocs\\sh-zabuur-official-app\\backend\\uploads\\audio',
      'C:\\xampp\\htdocs\\sh-zabuur-official-app\\backend\\public\\uploads\\audio',
    ];
    for (const p of altPaths) {
      if (fs.existsSync(p)) {
        console.log(`Found at: ${p}`);
        const files = fs.readdirSync(p);
        console.log(`Files: ${files.length}`);
        files.slice(0, 5).forEach(f => console.log(`  ${f}`));
      }
    }
  }

  await prisma.$disconnect();
}

main();
