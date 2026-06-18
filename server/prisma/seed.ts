import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@sheikhmohammedzabuur.com' },
    update: {},
    create: {
      email: 'admin@sheikhmohammedzabuur.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('Creating Scholar Profile...');
  await prisma.scholarProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Sheikh Muhammad Zabuur',
      title: 'الشيخ محمد زبور',
      biography: 'Sheikh Muhammad Zabuur is a prominent scholar specializing in Tafsir, Aqeedah, and Fiqh lessons in Afaan Oromo. He is well-known for his numerous Darsii channels on Telegram. With years of dedicated teaching, he has guided thousands of students in understanding the Quran and Sunnah.',
      shortBiography: 'Sheikh Muhammad Zabuur beekaa guddaa darsii adda addaa kanneen akka Tafsiiraa, Aqiidaa fi Fiqhii Afaan Oromootiin kennuun beekamudha.',
      profileImage: '/uploads/teachers/photo_2026_Sh_Zabuur.jpg',
      studentsCount: 0,
      resourceCount: 0,
      youtubeUrl: 'https://youtube.com/@sheikhmahammadzabuur-b7f?si=DE0JIVb15Eg_qyTo',
      telegramUrl: 'https://t.me/sheikzabuur',
      facebookUrl: 'https://web.facebook.com/people/Sheikh-Muhammad-Zabuur/61555767907866/',
      tiktokUrl: 'https://www.tiktok.com/@sheikh.mahammad.z?_t=ZM-8t2Fl7d7POv&_r=1',
    },
  });

  console.log('Creating Site Settings...');
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: 'Sheikh Muhammad Zabuur',
      siteDescription: 'Islamic Online Learning Platform - Learn the Quran and Sunnah with authentic materials',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      contactEmail: 'admin@sheikhmohammedzabuur.com',
      copyrightText: '© 2026 Sheikh Muhammad Zabuur. All rights reserved.',
      defaultLanguage: 'or',
    },
  });

  console.log('Clearing old database records...');
  await prisma.telegramChannel.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.book.deleteMany({});

  const categories = [
    { name: 'Aqeedah', nameAmharic: 'ዐቂዳ', nameArabic: 'عقيدة', nameOromic: 'Aqiidaa', slug: 'aqeedah', description: 'Islamic creed and faith', icon: '📿', color: '#1E40AF', order: 1, isBeginner: true },
    { name: 'Tawheed', nameAmharic: 'ተውሒድ', nameArabic: 'توحيد', nameOromic: 'Tawhiidii', slug: 'tawheed', description: 'Oneness of Allah', icon: '🤲', color: '#059669', order: 2, isBeginner: true },
    { name: 'Tafsir', nameAmharic: 'ተፍሲር', nameArabic: 'تفسير', nameOromic: 'Tafsiira', slug: 'tafsir', description: 'Quranic exegesis', icon: '📖', color: '#7C3AED', order: 3 },
    { name: 'Hadith', nameAmharic: 'ሐዲሥ', nameArabic: 'حديث', nameOromic: 'Hadiisa', slug: 'hadith', description: 'Prophetic traditions', icon: '📚', color: '#B45309', order: 4 },
    { name: 'Fiqh', nameAmharic: 'ፊቅህ', nameArabic: 'فقه', nameOromic: 'Fiqha', slug: 'fiqh', description: 'Islamic jurisprudence', icon: '⚖️', color: '#DC2626', order: 5 },
    { name: 'Seerah', nameAmharic: 'ሲራ', nameArabic: 'ሲራ', nameOromic: 'Seeraa', slug: 'seerah', description: 'Life of the Prophet', icon: '🕋', color: '#0891B2', order: 6, isBeginner: true },
    { name: 'Tajweed', nameAmharic: 'ተጅዊድ', nameArabic: 'تجويد', nameOromic: 'Tajwiiddii', slug: 'tajweed', description: 'Quranic recitation rules', icon: '🎙️', color: '#4F46E5', order: 7 },
    { name: 'Nahw', nameAmharic: 'ነሕው', nameArabic: 'نحو', nameOromic: 'Nahwii', slug: 'nahw', description: 'Arabic grammar', icon: '✍️', color: '#0D9488', order: 8 },
    { name: 'Sarf', nameAmharic: 'ሶርፍ', nameArabic: 'صرف', nameOromic: 'Sarfii', slug: 'sarf', description: 'Arabic morphology', icon: '🔤', color: '#9333EA', order: 9 },
    { name: 'Adab', nameAmharic: 'አደብ', nameArabic: 'أدب', nameOromic: 'Adaaba', slug: 'adab', description: 'Islamic etiquette', icon: '🌸', color: '#DB2777', order: 10, isBeginner: true },
    { name: 'Tarbiyah', nameAmharic: 'ተርቢያ', nameArabic: 'تربية', nameOromic: 'Tarbiyya', slug: 'tarbiyah', description: 'Islamic education', icon: '🌱', color: '#65A30D', order: 11 },
    { name: 'Manhaj', nameAmharic: 'መንሀጅ', nameArabic: 'منهج', nameOromic: 'Manhajaa', slug: 'manhaj', description: 'Islamic methodology', icon: '🗺️', color: '#CA8A04', order: 12 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const levels = [
    { name: 'Foundations of Islam', nameAmharic: 'የእስልምና መሰረቶች', nameArabic: 'أساسيات الإسلام', nameOromic: 'Bu\'uura Islaamaa', slug: 'foundations-of-islam', description: 'Begin your journey with the core beliefs and practices of Islam. Perfect for new Muslims and those seeking to strengthen their foundation.', order: 1, icon: '🌟', color: '#059669' },
    { name: 'Worship Basics', nameAmharic: 'የዕውነተኛ አምልኮ መሰረቶች', nameArabic: 'أساسيات العبادة', nameOromic: 'Bu\'uura Ibaadaa', slug: 'worship-basics', description: 'Learn how to perform the essential acts of worship correctly: Salah, Wudu, Fasting, and Quran basics.', order: 2, icon: '🕌', color: '#1E40AF' },
    { name: 'Daily Muslim Life', nameAmharic: 'የዕለት ተዕለት የሙስሊም ኑሮ', nameArabic: 'حياة المسلم اليومية', nameOromic: 'Jireenya Muslima Guyyaa Guyyaa', slug: 'daily-muslim-life', description: 'Integrate Islam into your daily routine with adhkar, good character, Islamic manners, and community life.', order: 3, icon: '🌿', color: '#7C3AED' },
    { name: 'Advanced Learning', nameAmharic: 'የላቀ ትምህርት', nameArabic: 'التعلم المتقدم', nameOromic: 'Barsiisa Dagaagaa', slug: 'advanced-learning', description: 'Deepen your understanding of Tafsir, Hadith, Fiqh, and the correct Islamic methodology (Manhaj).', order: 4, icon: '📚', color: '#B45309' },
    { name: 'Personal Development', nameAmharic: 'የግል ልማት', nameArabic: 'التطوير الشخصي', nameOromic: 'Froomina Dhuunfaa', slug: 'personal-development', description: 'Purify your soul, develop Islamic character, and grow spiritually through Tarbiyah and self-reflection.', order: 5, icon: '🌱', color: '#65A30D' },
  ];

  for (const lev of levels) {
    await prisma.level.upsert({
      where: { slug: lev.slug },
      update: {},
      create: lev,
    });
  }

  const catIds = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catMap = Object.fromEntries(catIds.map(c => [c.slug, c.id]));

  const books = [
    { title: 'Al-Aqeedah Al-Wasitiyyah', titleAmharic: 'አል-ዐቂዳ አል-ዋሲጢያ', titleArabic: 'العقيدة الواسطية', titleOromic: 'Al-Aqiidaa Al-Waasitiyyaa', slug: 'al-aqeedah-al-wasitiyyah', categorySlug: 'aqeedah', isBeginner: true },
    { title: 'Kitab At-Tawheed', titleAmharic: 'ኪታብ አት-ተውሒድ', titleArabic: 'كتاب التوحيد', titleOromic: 'Kitaaba At-Tawhiidii', slug: 'kitab-at-tawheed', categorySlug: 'tawheed', isBeginner: true },
    { title: 'Tafsir Ibn Kathir', titleAmharic: 'ተፍሲር ኢብን ከሥር', titleArabic: 'تفسير ابن كثير', titleOromic: 'Tafsiira Ibni Kathiir', slug: 'tafsir-ibn-kathir', categorySlug: 'tafsir' },
    { title: 'Sahih Al-Bukhari', titleAmharic: 'ሶሂሕ አል-ቡኻሪ', titleArabic: 'صحيح البخاري', titleOromic: 'Sahiiha Al-Bukhaarii', slug: 'sahih-al-bukhari', categorySlug: 'hadith' },
    { title: 'Umdat Al-Ahkam', titleAmharic: 'ዑምዳቱ አል-አሕካም', titleArabic: 'عمدة الأحكام', titleOromic: 'Umdatal Ahkaam', slug: 'umdat-al-ahkam', categorySlug: 'fiqh' },
    { title: 'Ar-Raheeq Al-Makhtum', titleAmharic: 'አር-ረሂቅ አል-ማኽቱም', titleArabic: 'الرحيق المختوم', titleOromic: 'Ar-Rahiiq Al-Makhtuum', slug: 'ar-raheeq-al-makhtum', categorySlug: 'seerah', isBeginner: true },
    { title: 'Al-Qaidah An-Nuraniyyah', titleAmharic: 'አል-ቃዒዳ አን-ኑራኒያ', titleArabic: 'القاعدة النورانية', titleOromic: 'Al-Qaa-idah An-Nuraaniyyaa', slug: 'al-qaidah-an-nuraniyyah', categorySlug: 'tajweed' },
    { title: 'Al-Ajurrumiyyah', titleAmharic: 'አል-አጁሩሚያ', titleArabic: 'الآجرومية', titleOromic: 'Al-Ajurruumiyyaa', slug: 'al-ajurrumiyyah', categorySlug: 'nahw' },
    { title: 'Riyadh As-Salihin', titleAmharic: 'ሪያድ አስ-ሳሊሒን', titleArabic: 'رياض الصالحين', titleOromic: 'Riyaadha As-Saalihiin', slug: 'riyadh-as-salihin', categorySlug: 'adab', isBeginner: true },
    { title: 'Al-Manhaj As-Salim', titleAmharic: 'አል-መንሀጅ አስ-ሳሊም', titleArabic: 'المنهج السليم', titleOromic: 'Al-Manhaja As-Saliim', slug: 'al-manhaj-as-salim', categorySlug: 'manhaj' },
    { title: 'Tafsiira Qur\'aana Afaan Oromo', titleAmharic: 'ተፍሲረ ቁርአን አፋን ኦሮሞ', titleArabic: 'تفسير القرآن بلغة الأورومو', titleOromic: 'Tafsiira Qur\'aana Afaan Oromo', slug: 'tafsiira-sheekh-muussaa', categorySlug: 'tafsir', isBeginner: false },
    { title: 'Aqiidaa kee qabadhu', titleAmharic: 'አቂዳህን ያዝ', titleArabic: 'عقيدتك فاحفظها', titleOromic: 'Aqiidaa kee qabadhu', slug: 'aqiidaa-kee-qabadhu', categorySlug: 'aqeedah', isBeginner: true, pdfUrl: 'https://d1.islamhouse.com/data/or/ih_books/single/or_khoz_3aqedtak.pdf', author: 'IslamHouse.com', description: 'Kitaabicha kun waa\'ee bu\'uuraalee aqiidaa Islaamiyyaa fi waajibaalee isaa kan ibsu yoo ta\'u, akkasumas ofirraa eeggannoo fi ofeeggachuu kan barsiisuudha.' },
    { title: 'Gabaabfamaa bu\'a qabeessa Muslima haaraaf', titleAmharic: 'ጋባዕፋማ ቡእ ቃቤሣ ሙስሊማ ሐአራአፍ', titleArabic: 'خلاصة مفيدة للمسلم الجديد', titleOromic: 'Gabaabfamaa bu\'a qabeessa Muslima haaraaf', slug: 'gabaabfamaa-bua-qabeessa-muslima-haaraaf', categorySlug: 'aqeedah', isBeginner: true, pdfUrl: 'https://d1.islamhouse.com/data/or/ih_books/single/or-2837236-gabaabfamaa-bu-a-qabeessa-muslima-haaraaf.pdf', author: null, description: 'Gabaabfamaa bu\'a qabeessa Muslima haaraaf - Handy summary for the new Muslim' },
    { title: 'HADIISA AFURTAMMAN NAWAAWWII', titleAmharic: 'ሀዲሳ አፉርታማን ናዋውዊ', titleArabic: 'الأربعون النووية', titleOromic: 'HADIISA AFURTAMMAN NAWAAWWII', slug: 'hadiisa-afurtamman-nawaawwii', categorySlug: 'hadith', isBeginner: false, pdfUrl: 'https://d1.islamhouse.com/data/or/ih_books/single/or-hadiisa-afurtamman-nawaawwii.pdf', author: 'Abuu zakariyyaa annawaawii', description: 'Kitaabni kuni hadiisa shantama ufkeessaa qaba matadureelee gorsa adda addaa irraa dubbata, arba\'iina nawaawiyyii jedhama, irraa filatamaa kitaabban hadiisa keessaa isa tokkoodha.' },
    { title: 'Hisnul muslim', titleAmharic: 'ሂስኑል ሙስሊም', titleArabic: 'حصን المسلم', titleOromic: 'Hisnul muslim', slug: 'hisnul-muslim', categorySlug: 'manhaj', isBeginner: false, pdfUrl: 'https://d1.islamhouse.com/data/or/ih_books/single/or-hisn-12.pdf', author: null, description: 'Kitaaba kana keessatti zikrii ganamaaf galgalaa tiifii duaaiiwwan adda addaa barbaachiftu ibsamee jira' },
    { title: 'QUR\'AANA QULQULLUU IRRAA TAFSIIRA JUZ\'IIWWAN SADAN BOODAA', titleAmharic: 'ቁርአና ቁልቁሉ ኢራረ ተፍሲረ ጁዝኢውወን ሳዳን ቦዳ', titleArabic: 'تفسير العشر الأخير من القرآن الكريم', titleOromic: 'Qur\'aana Qulqulluu Irraa Tafsiira Juz\'iiwwan Sadan Boodaa', slug: 'tafsiira-juziiwwan-sadan-boodaa', categorySlug: 'tafsir', isBeginner: false, pdfUrl: 'https://d1.islamhouse.com/data/or/ih_books/single/or_Explanation_of_the_Last_Tenth_of_the_Quran.pdf', author: 'garee ulamaaii', description: 'Tafsiira juz\'iiwwan sadan boodaa Qur\'aanaa kan garee ulamaatiin qophaa\'e.' },
    { title: 'Kun kitaaba murtii falfalaafi Raagaa keessatti kaayame.', titleAmharic: 'ኩን ኪታባ ሙርቲ ፋልፋላአፊ ራአጋአ ከኤሣቲ ካአያመ።', titleArabic: 'حكم السحر والكهانة', titleOromic: 'Kun kitaaba murtii falfalaafi Raagaa keessatti kaayame.', slug: 'murtii-falfalaafi-raagaa', categorySlug: 'aqeedah', isBeginner: false, pdfUrl: 'https://d1.islamhouse.com/data/or/ih_books/single/or-2837694-hukm-assihr-wal-kahana-pppp.pdf', author: 'Abdul aziiz bin abdillah bin baaz', description: 'Kun kitaaba murtii falfalaafi Raagaa keessatti kaayame.' },
  ];

  for (const b of books) {
    await prisma.book.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        titleAmharic: b.titleAmharic,
        titleArabic: b.titleArabic,
        titleOromic: b.titleOromic,
        categoryId: catMap[b.categorySlug],
        isBeginner: b.isBeginner || false,
        pdfUrl: (b as any).pdfUrl !== undefined ? (b as any).pdfUrl : `/uploads/pdfs/${b.slug}.pdf`,
        author: (b as any).author || null,
        description: (b as any).description || `${b.title} - Islamic lessons and lectures`,
      },
      create: {
        title: b.title,
        titleAmharic: b.titleAmharic,
        titleArabic: b.titleArabic,
        titleOromic: b.titleOromic,
        slug: b.slug,
        categoryId: catMap[b.categorySlug],
        isBeginner: b.isBeginner || false,
        pdfUrl: (b as any).pdfUrl !== undefined ? (b as any).pdfUrl : `/uploads/pdfs/${b.slug}.pdf`,
        author: (b as any).author || null,
        description: (b as any).description || `${b.title} - Islamic lessons and lectures`,
      },
    });
  }

  const lessonsData = [
    { title: 'Tafsir of Surah Al-Fatihah', titleOromic: 'Tafsiira Suuraa Al-Faatihaa', slug: 'tafsir-al-fatihah', cat: 'tafsir', ep: 1, book: 'tafsir-ibn-kathir' },
    { title: 'Tafsir of Surah Al-Baqarah 1-5', titleOromic: 'Tafsiira Suuraa Al-Baqaraa 1-5', slug: 'tafsir-al-baqarah-1-5', cat: 'tafsir', ep: 2, book: 'tafsir-ibn-kathir' },
    { title: 'The Importance of Hadith', titleOromic: 'Barbaachisummaa Hadiisaa', slug: 'importance-of-hadith', cat: 'hadith', ep: 1, book: 'sahih-al-bukhari' },
    { title: 'Hadith on Intentions', titleOromic: 'Hadiisa Waa\'ee Baadiyaa', slug: 'hadith-on-intentions', cat: 'hadith', ep: 2, book: 'sahih-al-bukhari' },
    { title: 'Purification in Islam', titleOromic: 'Qulqulleessuu Islaama keessatti', slug: 'purification-in-islam', cat: 'fiqh', ep: 1, book: 'umdat-al-ahkam' },
    { title: 'The Conditions of Prayer', titleOromic: 'Haala Sagadaa', slug: 'conditions-of-prayer', cat: 'fiqh', ep: 2, book: 'umdat-al-ahkam' },
    { title: 'The Birth of the Prophet', titleOromic: 'Dhaloota Nabiyyichaa', slug: 'birth-of-prophet', cat: 'seerah', ep: 1, book: 'ar-raheeq-al-makhtum', beginner: true },
    { title: 'The Early Life of the Prophet', titleOromic: 'Jireenya Jalqabaa Nabiyyichaa', slug: 'early-life-of-prophet', cat: 'seerah', ep: 2, book: 'ar-raheeq-al-makhtum', beginner: true },
    { title: 'Introduction to Arabic Grammar', titleOromic: 'Seensa Caasaqaaffaa Arabiffaa', slug: 'intro-to-arabic-grammar', cat: 'nahw', ep: 1, book: 'al-ajurrumiyyah' },
    { title: 'Parts of Speech in Arabic', titleOromic: 'Qaamolee Jechaa Arabiffaa keessatti', slug: 'parts-of-speech-arabic', cat: 'nahw', ep: 2, book: 'al-ajurrumiyyah' },
    { title: 'The Correct Methodology', titleOromic: 'Mala Sirrii', slug: 'correct-methodology', cat: 'manhaj', ep: 1, book: 'al-manhaj-as-salim' },
    { title: 'Following the Salaf', titleOromic: 'Hordofuu Salafaa', slug: 'following-the-salaf', cat: 'manhaj', ep: 2, book: 'al-manhaj-as-salim' },
    { title: 'Suuraa 001 - Faatihaa', titleOromic: 'Suuraa 001 - Faatihaa', slug: 'sm-tafsir-faatihaa', cat: 'tafsir', ep: 1, book: 'tafsiira-sheekh-muussaa', duration: 1541, audioUrl: 'https://api.spreaker.com/v2/episodes/45728263/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Darsii 1ffaa: Suuraa Faatiha.' },
    { title: 'Suuraa Al-Baqraah Darsii 1ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 1ffaa', slug: 'sm-tafsir-baqaraa-1', cat: 'tafsir', ep: 2, book: 'tafsiira-sheekh-muussaa', duration: 2678, audioUrl: 'https://api.spreaker.com/v2/episodes/45728710/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 1ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 2ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 2ffaa', slug: 'sm-tafsir-baqaraa-2', cat: 'tafsir', ep: 3, book: 'tafsiira-sheekh-muussaa', duration: 2295, audioUrl: 'https://api.spreaker.com/v2/episodes/45728963/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 2ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 3ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 3ffaa', slug: 'sm-tafsir-baqaraa-3', cat: 'tafsir', ep: 4, book: 'tafsiira-sheekh-muussaa', duration: 1979, audioUrl: 'https://api.spreaker.com/v2/episodes/45736334/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 3ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 4ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 4ffaa', slug: 'sm-tafsir-baqaraa-4', cat: 'tafsir', ep: 5, book: 'tafsiira-sheekh-muussaa', duration: 2623, audioUrl: 'https://api.spreaker.com/v2/episodes/45736545/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 4ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 5ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 5ffaa', slug: 'sm-tafsir-baqaraa-5', cat: 'tafsir', ep: 6, book: 'tafsiira-sheekh-muussaa', duration: 2387, audioUrl: 'https://api.spreaker.com/v2/episodes/45736658/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 5ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 6ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 6ffaa', slug: 'sm-tafsir-baqaraa-6', cat: 'tafsir', ep: 7, book: 'tafsiira-sheekh-muussaa', duration: 2464, audioUrl: 'https://api.spreaker.com/v2/episodes/45736901/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 6ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 7ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 7ffaa', slug: 'sm-tafsir-baqaraa-7', cat: 'tafsir', ep: 8, book: 'tafsiira-sheekh-muussaa', duration: 2276, audioUrl: 'https://api.spreaker.com/v2/episodes/45736970/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 7ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 8ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 8ffaa', slug: 'sm-tafsir-baqaraa-8', cat: 'tafsir', ep: 9, book: 'tafsiira-sheekh-muussaa', duration: 2148, audioUrl: 'https://api.spreaker.com/v2/episodes/45737109/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 8ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 9ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 9ffaa', slug: 'sm-tafsir-baqaraa-9', cat: 'tafsir', ep: 10, book: 'tafsiira-sheekh-muussaa', duration: 2518, audioUrl: 'https://api.spreaker.com/v2/episodes/45737011/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 9ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 10ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 10ffaa', slug: 'sm-tafsir-baqaraa-10', cat: 'tafsir', ep: 11, book: 'tafsiira-sheekh-muussaa', duration: 2197, audioUrl: 'https://api.spreaker.com/v2/episodes/45737197/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 10ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 11ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 11ffaa', slug: 'sm-tafsir-baqaraa-11', cat: 'tafsir', ep: 12, book: 'tafsiira-sheekh-muussaa', duration: 2802, audioUrl: 'https://api.spreaker.com/v2/episodes/45737059/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 11ffaa.' },
    { title: 'Suuraa Al-Baqraah Darsii 12ffaa', titleOromic: 'Suuraa Al-Baqraah Darsii 12ffaa', slug: 'sm-tafsir-baqaraa-12', cat: 'tafsir', ep: 13, book: 'tafsiira-sheekh-muussaa', duration: 2139, audioUrl: 'https://api.spreaker.com/v2/episodes/45737226/download.mp3', pdfUrl: null, description: 'Tafsiira Qur\'aana Afaan Oromo. Suuraa Al-Baqaraah Darsii 12ffaa.' },
    { title: 'Barnoota adda addaa 1', titleOromic: 'Barnoota adda addaa 1', slug: 'barnoota-adda-addaa-1', cat: 'manhaj', ep: 1, audioUrl: 'https://d1.islamhouse.com/data/or/ih_sounds/parts/Barnoota_adda_addaa/or_Barnoota_adda_addaa_01.mp3', pdfUrl: null, duration: null, description: 'Sagantaan kun barnoota islaamaa adda addaa kan nama hundaaf barbaachisu.' },
    { title: 'Barnoota adda addaa 2', titleOromic: 'Barnoota adda addaa 2', slug: 'barnoota-adda-addaa-2', cat: 'manhaj', ep: 2, audioUrl: 'https://d1.islamhouse.com/data/or/ih_sounds/parts/Barnoota_adda_addaa/or_Barnoota_adda_addaa_02.mp3', pdfUrl: null, duration: null, description: null },
    { title: 'Barnoota xahaaraa (Qulqullinaa)', titleOromic: 'Barnoota xahaaraa (Qulqullinaa)', slug: 'barnoota-xahaaraa', cat: 'manhaj', ep: 1, audioUrl: 'https://d1.islamhouse.com/data/or/ih_sounds/single/or_Barnoota_Xahaaraa.mp3', pdfUrl: null, duration: null, description: 'Barnoota qulqullinaa (xahaaraa) - lessons on purification' },
    { title: 'Aqiidaa sirroytuu', titleOromic: 'Aqiidaa sirroytuu', slug: 'aqiidaa-sirroytuu', cat: 'aqeedah', ep: 1, audioUrl: 'https://d1.islamhouse.com/data/or/ih_sounds/single/or_Aqiidaa_Sirrooytuu.mp3', pdfUrl: null, duration: null, description: 'Aqiidaa sirroytuu - the correct aqeedah' },
    { title: 'Barnoota salaataa', titleOromic: 'Barnoota salaataa', slug: 'barnoota-salaataa', cat: 'manhaj', ep: 1, audioUrl: 'https://d1.islamhouse.com/data/or/ih_sounds/single/or_Barnoota_Salaataa.mp3', pdfUrl: null, duration: null, description: 'Barnoota salaataa - lessons on prayer' },
  ];

  const bookIds = await prisma.book.findMany({ select: { id: true, slug: true } });
  const bookMap = Object.fromEntries(bookIds.map(b => [b.slug, b.id]));

  for (const l of lessonsData) {
    await prisma.lesson.upsert({
      where: { slug: l.slug },
      update: {
        title: l.title,
        titleOromic: l.titleOromic,
        categoryId: catMap[l.cat],
        bookId: bookMap[(l as any).book || undefined],
        episodeNumber: l.ep,
        isBeginner: l.beginner || false,
        audioUrl: (l as any).audioUrl || `/uploads/audio/${l.slug}.mp3`,
        pdfUrl: (l as any).pdfUrl !== undefined ? (l as any).pdfUrl : `/uploads/pdfs/${l.slug}.pdf`,
        duration: (l as any).duration || Math.floor(Math.random() * 1800) + 600,
        description: (l as any).description || l.title,
      },
      create: {
        title: l.title,
        titleOromic: l.titleOromic,
        slug: l.slug,
        categoryId: catMap[l.cat],
        bookId: bookMap[(l as any).book || undefined],
        episodeNumber: l.ep,
        isBeginner: l.beginner || false,
        audioUrl: (l as any).audioUrl || `/uploads/audio/${l.slug}.mp3`,
        pdfUrl: (l as any).pdfUrl !== undefined ? (l as any).pdfUrl : `/uploads/pdfs/${l.slug}.pdf`,
        duration: (l as any).duration || Math.floor(Math.random() * 1800) + 600,
        description: (l as any).description || l.title,
      },
    });
  }

  const allLessons = await prisma.lesson.findMany({ select: { id: true, slug: true, isBeginner: true, categoryId: true } });
  const levelMap = Object.fromEntries(
    (await prisma.level.findMany({ select: { id: true, slug: true } })).map(l => [l.slug, l.id])
  );

  for (const lesson of allLessons) {
    let levelSlug: string | null = null;
    if (lesson.isBeginner) {
      levelSlug = 'foundations-of-islam';
    }

    if (levelSlug) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { levelId: levelMap[levelSlug] },
      });
    }
  }

  const channels = [
    { name: 'Darsii Beeyquunaa', link: 'https://t.me/Shekzabuur12', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Al-Bayquniyyah lessons' },
    { name: 'Darsii BULUUKAA', link: 'https://t.me/sheikhzabuur00', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Bulugh al-Maram lessons' },
    { name: 'Darsii Diddu toohid fi Talkiis', link: 'https://t.me/Sheikzabuur12', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Diddu Tawheed fi Talkiis' },
    { name: 'Darsii RIYAADAA', link: 'https://t.me/sheek1Z', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Riyadh as-Salihin lessons' },
    { name: 'Darsii Tafsiiraa', link: 'https://t.me/Sheehk1Z', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Tafsiiraa Kan guyyaa' },
    { name: 'Darsii Tajriidaa', link: 'https://t.me/Sheikzabuur1234', teacherName: 'Sheikh Muhammad Zabuur', description: 'Darsii Tajrid lessons' },
    { name: 'Darsii Usuula salaasaa, kitaabuthis fi Arba,iina', link: 'https://t.me/sheikzabuur', teacherName: 'Sheikh Muhammad Zabuur', description: 'Usuul as-Salaasah, Kitaab at-Tawheed, and Arba\'un Nawawiyyah lessons' },
    { name: '1📶Arba,iin Annawaawi', link: 'https://t.me/Markazhaumar1444', teacherName: 'Ust. Shaafii Muhammed', description: 'By Ust/Shaafii Muhammad' },
    { name: '2📶Umdatul Ahkaam', link: 'https://t.me/markazaUmarl1444', teacherName: 'Ust. Shaafii Muhammed', description: 'By Ust/Shaafii Muhammad' },
    { name: '3📶Tafsiira', link: 'https://t.me/mAnsar123', teacherName: 'Ust. Shaafii Muhammed', description: 'By Ust/Shaafii Muhammad' },
    { name: '4📶 buluug Al maraam', link: 'https://t.me/MAnsaar134', teacherName: 'Ust. Shaafii Muhammed', description: 'By Ust/Shaafii Muhammad' },
    { name: '5📶 Nahwii Aajirumiyya', link: 'https://t.me/+NTJLenvCwSQwYjc0', teacherName: 'Ust. Shaafii Muhammed', description: 'By Ust/Shaafii Muhammad' },
    { name: '6📶Duruusul muhimmaa', link: 'https://t.me/+TEiA1wBG9y82NTJk', teacherName: 'Ust. Shaafii Muhammed', description: 'By Ust/Shaafii Muhammad' },
    { name: '7📶Usuulu ssalaasa/_qawaa idul Arba,a', link: 'https://t.me/markazaumar', teacherName: 'Ust. Shaafii Muhammed', description: 'By Ust/Shaafii Muhammad' },
    { name: 'Tafsiira Qur\'aanaa', link: 'https://t.me/tafsiira2022', teacherName: 'Ust. Shaafii Muhammed', description: 'Tafsiira Qur\'aanaa channel' },
    { name: 'Nahwii Online', link: 'https://t.me/+pI_Co-0ihnQ1NmJk', teacherName: 'Ust. Shaafii Muhammed', description: 'Nahwii Online channel' },
    { name: 'Buluugh Al-Maraam (Online)', link: 'https://t.me/buluuga2022', teacherName: 'Ust. Shaafii Muhammed', description: 'Bulugh al-Maram (Online) channel' },
    { name: 'Audiyoolee Aqiidaa', link: 'https://t.me/aqiidaa1', teacherName: 'Ust. Shaafii Muhammed', description: 'Audio lessons on Aqeedah' },
    { name: 'At-Tajreed As-Sareeh', link: 'https://t.me/tajriida', teacherName: 'Ust. Shaafii Muhammed', description: 'At-Tajreed As-Sareeh channel' },
    { name: 'Barnoota Fiqhii', link: 'https://t.me/barnoota_Fiqhii', teacherName: 'Ust. Shaafii Muhammed', description: 'Fiqh lessons channel' },
    { name: 'Tafsiira quraanaa', link: 'https://t.me/tafsiira2022', teacherName: 'Dr. Sheikh Muussaa Su\'aalaa', description: 'Tafsiira quraanaa' },
  ];

  for (const ch of channels) {
    await prisma.telegramChannel.create({ data: ch });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
