import prisma from '../lib/prisma';

function escapeForPrompt(text: string | null): string {
  return (text || '').replace(/[\x00-\x1F]/g, ' ').trim();
}

function buildOrConditions(terms: string[], fields: string[]) {
  if (terms.length === 0) return undefined;
  return {
    OR: terms.flatMap((term) =>
      fields.map((field) => ({ [field]: { contains: term } })),
    ),
  };
}

export async function buildRAGContext(query: string): Promise<string> {
  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const [categories, lessons, books, resources, courses, announcements, collections] = await Promise.all([
    prisma.category.findMany({
      where: buildOrConditions(searchTerms, [
        'name', 'nameArabic', 'nameAmharic', 'nameOromic',
        'description', 'descriptionArabic', 'descriptionAmharic', 'descriptionOromic',
      ]) as any,
      take: 10,
      orderBy: { order: 'asc' },
    }),
    prisma.lesson.findMany({
      where: {
        published: true,
        ...(buildOrConditions(searchTerms, [
          'title', 'titleArabic', 'titleAmharic', 'titleOromic',
          'description', 'descriptionArabic', 'descriptionAmharic', 'descriptionOromic',
        ]) as any || {}),
      },
      take: 10,
      include: {
        category: { select: { name: true, slug: true } },
        level: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.book.findMany({
      where: buildOrConditions(searchTerms, [
        'title', 'titleArabic', 'titleAmharic', 'titleOromic',
        'description', 'descriptionArabic', 'descriptionAmharic', 'descriptionOromic',
      ]) as any,
      take: 10,
      include: {
        category: { select: { name: true } },
      },
    }),
    prisma.resource.findMany({
      where: buildOrConditions(searchTerms, [
        'title', 'description', 'author', 'category',
      ]) as any,
      take: 10,
      orderBy: { downloads: 'desc' },
    }),
    prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        ...(buildOrConditions(searchTerms, [
          'title', 'description',
        ]) as any || {}),
      },
      take: 10,
      include: {
        level: { select: { name: true } },
      },
    }),
    prisma.announcement.findMany({
      where: buildOrConditions(searchTerms, ['title', 'content']) as any,
      take: 10,
      include: {
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.resource.findMany({
      where: {
        collection: { not: null },
      },
      select: { collection: true },
      distinct: ['collection'],
      orderBy: { collection: 'asc' },
    }).then(rows => rows.map(r => r.collection).filter(Boolean) as string[]),
  ]);

  const contextParts: string[] = [];

  if (categories.length > 0) {
    const cats = categories
      .map((c) => `- ${c.name}${c.nameArabic ? ` (${c.nameArabic})` : ''}${c.isBeginner ? ' [Beginner]' : ''}${c.description ? ': ' + escapeForPrompt(c.description) : ''}`)
      .join('\n');
    contextParts.push(`=== CATEGORIES ===\n${cats}`);
  }

  if (lessons.length > 0) {
    const lss = lessons
      .map((l) => `- ${l.title}${l.category ? ` [${l.category.name}]` : ''}${l.level ? ` (Level: ${l.level.name})` : ''}${l.difficulty ? ` - ${l.difficulty}` : ''}`)
      .join('\n');
    contextParts.push(`=== LESSONS ===\n${lss}`);
  }

  if (books.length > 0) {
    const bks = books
      .map((b) => `- ${b.title}${b.author ? ` by ${b.author}` : ''}${b.category ? ` [${b.category.name}]` : ''}`)
      .join('\n');
    contextParts.push(`=== BOOKS ===\n${bks}`);
  }

  if (resources.length > 0) {
    const res = resources
      .map((r) => `- ${r.title}${r.author ? ` by ${r.author}` : ''} [${r.category}] (${r.fileType})${r.description ? ': ' + escapeForPrompt(r.description) : ''}`)
      .join('\n');
    contextParts.push(`=== RESOURCES ===\n${res}`);
  }

  if (courses.length > 0) {
    const crs = courses
      .map((c) => `- ${c.title}${c.level ? ` (Level: ${c.level.name})` : ''}${c.description ? ': ' + escapeForPrompt(c.description) : ''}`)
      .join('\n');
    contextParts.push(`=== COURSES ===\n${crs}`);
  }

  if (announcements.length > 0) {
    const ann = announcements
      .map((a) => `- ${a.title}${a.course ? ` [Course: ${a.course.title}]` : ''}: ${escapeForPrompt(a.content)}`)
      .join('\n');
    contextParts.push(`=== ANNOUNCEMENTS ===\n${ann}`);
  }

  if (collections.length > 0) {
    const audioCount = await prisma.resource.count({ where: { collection: { not: null }, resourceType: 'AUDIO' } });
    const pdfCount = await prisma.resource.count({ where: { collection: { not: null }, resourceType: 'PDF' } });
    contextParts.push(`=== COLLECTIONS ===\nAvailable collections: ${collections.join(', ')}\nTotal audio resources: ${audioCount}, Total PDF resources: ${pdfCount}`);
  }

  return contextParts.join('\n\n');
}
