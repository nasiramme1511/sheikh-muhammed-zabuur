import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration...');

  // 1. Migrate Teacher -> ScholarProfile
  const teacher = await prisma.teacher.findFirst({
    where: { name: { contains: 'Zabuur' } },
  });

  if (teacher) {
    await prisma.scholarProfile.create({
      data: {
        name: teacher.name,
        title: teacher.specialties || 'Islamic Scholar',
        biography: teacher.bio || '',
        shortBiography: teacher.bio ? teacher.bio.substring(0, 300) : '',
        profileImage: teacher.image || null,
        yearsActive: null,
        studentsCount: teacher.studentsCount || 0,
        resourceCount: 0,
        youtubeUrl: teacher.youtube || null,
        telegramUrl: teacher.telegram || null,
        facebookUrl: teacher.facebook || null,
        tiktokUrl: teacher.tiktok || null,
        websiteUrl: teacher.website || null,
      },
    });
    console.log('ScholarProfile created from Teacher:', teacher.name);
  } else {
    // Create a default scholar profile
    await prisma.scholarProfile.create({
      data: {
        name: 'Sheikh Mohammed Zabuur',
        title: 'Islamic Scholar',
        biography: '',
        shortBiography: '',
      },
    });
    console.log('Default ScholarProfile created');
  }

  // 2. Remove teacherId references from Book, Lesson, Resource
  // Set all teacherId to null since we're moving to single-scholar model
  const bookUpdate = await prisma.book.updateMany({
    where: { teacherId: { not: null } },
    data: { teacherId: null },
  });
  console.log(`Cleared teacherId from ${bookUpdate.count} books`);

  const lessonUpdate = await prisma.lesson.updateMany({
    where: { teacherId: { not: null } },
    data: { teacherId: null },
  });
  console.log(`Cleared teacherId from ${lessonUpdate.count} lessons`);

  const resourceUpdate = await prisma.resource.updateMany({
    where: { teacherId: { not: null } },
    data: { teacherId: null },
  });
  console.log(`Cleared teacherId from ${resourceUpdate.count} resources`);

  // 3. Update Role enum - change STUDENT role to USER, TEACHER role to USER
  const studentUpdate = await prisma.user.updateMany({
    where: { role: 'STUDENT' },
    data: { role: 'USER' },
  });
  console.log(`Changed ${studentUpdate.count} STUDENT users to USER`);

  const teacherUpdate = await prisma.user.updateMany({
    where: { role: 'TEACHER' },
    data: { role: 'USER' },
  });
  console.log(`Changed ${teacherUpdate.count} TEACHER users to USER`);

  // 4. Migrate data from Course-related tables before they're dropped
  // Move any course descriptions/resources into standalone announcements if needed
  const enrollments = await prisma.enrollment.count();
  console.log(`Enrollments to be dropped: ${enrollments}`);

  const assignments = await prisma.assignment.count();
  console.log(`Assignments to be dropped: ${assignments}`);

  const submissions = await prisma.submission.count();
  console.log(`Submissions to be dropped: ${submissions}`);

  const quizzes = await prisma.quiz.count();
  console.log(`Quizzes to be dropped: ${quizzes}`);

  const quizAttempts = await prisma.quizAttempt.count();
  console.log(`QuizAttempts to be dropped: ${quizAttempts}`);

  const certificates = await prisma.certificate.count();
  console.log(`Certificates to be dropped: ${certificates}`);

  const lessonProgress = await prisma.lessonProgress.count();
  console.log(`LessonProgress to be dropped: ${lessonProgress}`);

  const modules = await prisma.module.count();
  console.log(`Modules to be dropped: ${modules}`);

  const tasks = await prisma.task.count();
  console.log(`Tasks to be dropped: ${tasks}`);

  const students = await prisma.student.count();
  console.log(`Students to be dropped: ${students}`);

  const teachers = await prisma.teacher.count();
  console.log(`Teachers to be dropped: ${teachers}`);

  // 5. Create default SiteSettings if not exists
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        siteName: 'Iman Chercher College',
        siteDescription: 'Islamic learning platform powered by the teachings of Sheikh Mohammed Zabuur',
        contactEmail: 'info@imanchercher.com',
        copyrightText: `© ${new Date().getFullYear()} Iman Chercher College. All rights reserved.`,
        defaultLanguage: 'en',
      },
    });
    console.log('Default SiteSettings created');
  }

  console.log('Data migration completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
