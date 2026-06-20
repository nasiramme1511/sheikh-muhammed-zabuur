import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import prisma from './lib/prisma';
import { authLimiter, apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import lessonRoutes from './routes/lessons';
import bookRoutes from './routes/books';
import bookmarkRoutes from './routes/bookmarks';
import levelRoutes from './routes/levels';
import progressRoutes from './routes/progress';
import scheduleRoutes from './routes/schedules';
import searchRoutes from './routes/search';
import userRoutes from './routes/users';
import telegramRoutes from './routes/telegram';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import newsletterRoutes from './routes/newsletter';
import resourcesRoutes from './routes/resources';
import courseRoutes from './routes/courses';
import notificationsRoutes from './routes/notifications';
import analyticsRoutes from './routes/analytics';
import scholarRoutes from './routes/scholar';
import siteSettingsRoutes from './routes/siteSettings';
import liveRoutes from './routes/live';
import dashboardRoutes from './routes/dashboard';
import importRoutes from './routes/import';
import seriesRoutes from './routes/series';
import resourceCategoryRoutes from './routes/resourceCategories';
import appearanceRoutes from './routes/appearance';
import settingsRoutes from './routes/settings';
import downloadRoutes from './routes/download';
import brandingRoutes from './routes/branding';
import historyRoutes from './routes/history';
import downloadsCrudRoutes from './routes/downloads';

const app = express();
const PORT = process.env.PORT || 5000;

const UPLOAD_DIR = path.join(__dirname, '../uploads');

// Ensure upload directories exist
['images', 'pdfs', 'audio', 'videos'].forEach((sub) => {
  const dir = path.join(UPLOAD_DIR, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Helpers (mirrored from admin.ts) ──────────────────────────
function deriveCategory(name: string): string {
  const n = path.basename(name, path.extname(name)).toLowerCase().replace(/[-_]/g, ' ');
  const pairs: [string, string][] = [
    ['tafsir', 'Tafsir'], ['quran', 'Tafsir'], ['surah', 'Tafsir'], ['ayat', 'Tafsir'],
    ['hadith', 'Hadith'], ['bukhari', 'Hadith'], ['muslim', 'Hadith'],
    ['riyad', 'Riyadus Salihin'], ['salihin', 'Riyadus Salihin'], ['riyadh', 'Riyadus Salihin'],
    ['tajweed', 'Tajweed'], ['tajwid', 'Tajweed'], ['tahsin', 'Tajweed'], ['qaidah', 'Tajweed'], ['nuraniyyah', 'Tajweed'], ['noorani', 'Tajweed'],
    ['usul al fiqh', 'Usul al-Fiqh'], ['usul', 'Usul al-Fiqh'],
    ['fiqh', 'Fiqh'], ['salah', 'Fiqh'], ['prayer', 'Fiqh'], ['bulugh', 'Fiqh'], ['umdah', 'Fiqh'],
    ['seerah', 'Seerah'], ['sirah', 'Seerah'], ['prophet', 'Seerah'], ['raheeq', 'Seerah'], ['makhtum', 'Seerah'],
    ['aqeedah', 'Aqeedah'], ['aqidah', 'Aqeedah'], ['tawheed', 'Aqeedah'], ['tawhid', 'Aqeedah'], ['wasitiyyah', 'Aqeedah'],
    ['arabic', 'Arabic Language'], ['nahw', 'Arabic Language'], ['sarf', 'Arabic Language'], ['grammar', 'Arabic Language'], ['ajrumiyyah', 'Arabic Language'],
    ['manhaj', 'Manhaj'], ['salaf', 'Manhaj'],
    ['adab', 'Adab'], ['akhlaq', 'Adab'], ['ikhlas', 'Adab'], ['niyyah', 'Adab'],
    ['dawah', "Da'wah"], ['da\'wah', "Da'wah"],
    ['khutbah', 'Khutbah'], ['sermon', 'Khutbah'],
    ['ramadan', 'Ramadan Series'], ['ramadhan', 'Ramadan Series'],
    ['qa', 'Questions & Answers'], ['question', 'Questions & Answers'], ['fatwa', 'Questions & Answers'],
    ['general', 'General Lectures'], ['lecture', 'General Lectures'],
  ];
  for (const [kw, cat] of pairs) {
    if (n.includes(kw)) return cat;
  }
  return 'General Lectures';
}

function deriveCollection(filename: string): string | null {
  const n = path.basename(filename, path.extname(filename)).toLowerCase().replace(/[-_]/g, ' ');
  const pairs: [string, string][] = [
    ['riyad', 'riyadhus-salihin'], ['salihin', 'riyadhus-salihin'],
    ['bulugh', 'bulugh-al-maram'],
    ['umdat', 'umdat-al-ahkam'], ['umdah', 'umdat-al-ahkam'],
    ['tafsir-ibn', 'tafsir-ibn-kathir'], ['ibn-kathir', 'tafsir-ibn-kathir'],
    ['tafsir', 'tafsir-al-quran'],
    ['usul', 'usul-ath-thalatha'],
    ['tawheed', 'kitab-at-tawheed'],
    ['wasitiyyah', 'al-aqeedah-al-wasitiyyah'],
    ['manhaj', 'al-manhaj-as-salim'],
    ['tajweed', 'tajweed'], ['tajwid', 'tajweed'], ['nuraniyyah', 'tajweed'], ['noorani', 'tajweed'],
    ['arabic', 'arabic-grammar'], ['nahw', 'arabic-grammar'], ['sarf', 'arabic-grammar'], ['grammar', 'arabic-grammar'],
    ['seerah', 'seerah-nabawiyyah'], ['sirah', 'seerah-nabawiyyah'],
    ['fiqh', 'fiqh'],
    ['ramadan', 'ramadan'],
    ['khutbah', 'khutbah'],
    ['tajreed', 'tajreed'], ['tajrid', 'tajreed'],
    ['qa-', 'questions-and-answers'], ['question', 'questions-and-answers'], ['fatwa', 'questions-and-answers'],
    ['general', 'general-lectures'], ['lecture', 'general-lectures'], ['dawah', 'general-lectures'],
  ];
  for (const [kw, colSlug] of pairs) {
    if (n.includes(kw)) return colSlug;
  }
  return null;
}

function prettyTitle(name: string): string {
  // Strip all trailing extensions (handles double extensions like .mp3.mp3)
  while (name.includes('.') && /\.\w+$/.test(name)) {
    name = name.replace(/\.[^/.]+$/, '');
  }
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Fix: incorrectly typed resources ──────────────────────────
function detectResourceTypeFromExt(ext: string): { resourceType: 'PDF' | 'AUDIO' | 'VIDEO' | 'IMAGE', fileType: string } | null {
  const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.ogv'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const pdfExts = ['.pdf'];

  if (pdfExts.includes(ext)) return { resourceType: 'PDF', fileType: 'pdf' };
  if (audioExts.includes(ext)) return { resourceType: 'AUDIO', fileType: 'audio' };
  if (videoExts.includes(ext)) return { resourceType: 'VIDEO', fileType: 'video' };
  if (imageExts.includes(ext)) return { resourceType: 'IMAGE', fileType: 'image' };
  return null;
}

async function repairResourceTypes() {
  const resources = await prisma.resource.findMany();
  let fixed = 0;
  for (const r of resources) {
    const fileUrl = r.fileUrl;
    const ext = path.extname(fileUrl).toLowerCase();
    const detected = detectResourceTypeFromExt(ext);
    if (detected && (r.resourceType !== detected.resourceType || r.fileType !== detected.fileType)) {
      await prisma.resource.update({
        where: { id: r.id },
        data: { resourceType: detected.resourceType, fileType: detected.fileType },
      });
      fixed++;
    }
  }
  // silent
}

// ── Sync on-disk files → DB Resource records ──────────────────
async function syncUploadsToDb() {
  const subdirs = ['pdfs', 'audio', 'images', 'videos'];
  for (const sub of subdirs) {
    const dir = path.join(UPLOAD_DIR, sub);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    for (const file of files) {
      const fileUrl = `/uploads/${sub}/${file}`;
      const exists = await prisma.resource.findFirst({ where: { fileUrl } });
      if (exists) continue;
      const ext = path.extname(file).toLowerCase();
      const detected = detectResourceTypeFromExt(ext);
      let fileType = 'image';
      let resourceType: 'PDF' | 'AUDIO' | 'VIDEO' | 'IMAGE' = 'IMAGE';
      if (detected) { fileType = detected.fileType; resourceType = detected.resourceType; }

      await prisma.resource.create({
        data: {
          title: prettyTitle(file),
          fileUrl,
          fileType,
          resourceType,
          category: deriveCategory(file),
          collection: deriveCollection(file),
          language: /[\u0600-\u06FF]/.test(file) ? 'ar' : 'en',
        },
      });
      // silent
    }
  }
}

// Startup check – ensure critical env vars are set
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  acceptRanges: true,
  cacheControl: true,
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
    const videoExts = ['.mp4', '.webm', '.mov', '.mkv'];
    if (audioExts.includes(ext)) {
      res.setHeader('Content-Type', `audio/${ext.slice(1)}`);
      res.setHeader('Accept-Ranges', 'bytes');
    } else if (videoExts.includes(ext)) {
      res.setHeader('Content-Type', `video/${ext.slice(1)}`);
      res.setHeader('Accept-Ranges', 'bytes');
    }
  },
}));

// Security headers
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' https:; frame-ancestors 'none';");
  next();
});

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Rate limiting
app.use('/api', apiLimiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/import', importRoutes);
app.use('/api/resource-categories', resourceCategoryRoutes);
app.use('/api/appearance', appearanceRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/scholar', scholarRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/downloads', downloadsCrudRoutes);

// Serve client static files
const CLIENT_DIST = path.join(__dirname, '../../frontend/dist');
app.use(express.static(CLIENT_DIST));

app.get('/api/health', async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', uptime: process.uptime(), version: '1.0.0' });
  } catch {
    res.json({ status: 'ok', database: 'disconnected', uptime: process.uptime(), version: '1.0.0' });
  }
});

// Fallback all other GET requests to client index.html (React Router)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please build the client first.');
  }
});

console.log('Database Connected');

// Sync Prisma schema to database
try {
  execSync('npx prisma db push --skip-generate --accept-data-loss', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
} catch {
  console.warn('prisma db push failed — continuing anyway');
}

async function autoSeed() {
  const count = await prisma.series.count();
  if (count > 0) return; // already seeded

  console.log('Auto-seeding production data...');

  const seriesData = [
    { name: "Tafsir Al-Qur'an", nameAmharic: 'ተፍሲር አል-ቁርአን', nameArabic: 'تفسير القرآن', nameOromic: "Tafsiira Al-Qur'aan", slug: 'tafsir-al-quran', description: "In-depth explanation and interpretation of the Noble Qur'an, covering meanings, context, and rulings.", icon: '📖', color: '#7C3AED', order: 1 },
    { name: 'Riyadus Salihin', nameAmharic: 'ሪያዱስ ሷሊሒን', nameArabic: 'رياض الصالحين', nameOromic: 'Riyaadus Saalihiin', slug: 'riyadus-salihin', description: "Study of Imam an-Nawawi's renowned collection of hadith on righteous conduct.", icon: '🌿', color: '#059669', order: 2 },
    { name: 'Bulugh al-Maram', nameAmharic: 'ቡሉግ አል-ማራም', nameArabic: 'بلوغ المرام', nameOromic: 'Bulugh al-Maraam', slug: 'bulugh-al-maram', description: "Comprehensive study of Ibn Hajar al-Asqalani's collection of hadith on Islamic jurisprudence.", icon: '⚖️', color: '#B45309', order: 3 },
    { name: 'Usul ath-Thalathah', nameAmharic: 'ኡሱል አሥ-ሠላሠህ', nameArabic: 'الأصول الثلاثة', nameOromic: 'Usuul ath-Thalaatha', slug: 'usul-ath-thalathah', description: 'Study of the three fundamental principles of Islam based on the treatise by Muhammad ibn Abd al-Wahhab.', icon: '🕌', color: '#1E40AF', order: 4 },
    { name: 'Kitab at-Tawheed', nameAmharic: 'ኪታብ አት-ተውሒድ', nameArabic: 'كتاب التوحيد', nameOromic: 'Kitaab at-Tawhiid', slug: 'kitab-at-tawheed', description: 'Study of the book of monotheism, explaining the concept of Tawheed and what contradicts it.', icon: '🤲', color: '#DC2626', order: 5 },
    { name: 'Tajreed', nameAmharic: 'ታጅሪድ', nameArabic: 'تجريد', nameOromic: 'Tajriid', slug: 'tajreed', description: 'Refined selected hadith for deeper understanding of Islamic texts.', icon: '🎙️', color: '#4F46E5', order: 6 },
    { name: 'Al-Bayquniyyah', nameAmharic: 'አል-በይቁኒያህ', nameArabic: 'البيقونية', nameOromic: 'Al-Bayquniyyah', slug: 'al-bayquniyyah', description: 'Study of the classical poem on hadith terminology and classification.', icon: '📜', color: '#0D9488', order: 7 },
    { name: "Al-Arba'in an-Nawawiyyah", nameAmharic: 'አል-አርበዒን አን-ነወውይህ', nameArabic: 'الأربعون النووية', nameOromic: "Al-Arba'iin an-Nawawiyyah", slug: 'al-arbain-an-nawawiyyah', description: "Study of Imam an-Nawawi's collection of 40 essential hadith covering the fundamentals of Islam.", icon: '📗', color: '#DB2777', order: 8 },
  ];
  for (const s of seriesData) {
    await prisma.series.upsert({ where: { slug: s.slug }, update: {}, create: s });
  }

  const categories = [
    { name: 'Tafsir', nameAmharic: 'ተፍሲር', nameArabic: 'تفسير', nameOromic: 'Tafsiira', slug: 'tafsir', description: 'Quranic exegesis', icon: '📖', color: '#7C3AED', order: 1 },
    { name: 'Usul', nameAmharic: 'ኡሱል', nameArabic: 'أصول', nameOromic: 'Usuulii', slug: 'usul', description: 'Principles of Islamic jurisprudence', icon: '⚖️', color: '#059669', order: 2 },
    { name: 'Bulugh', nameAmharic: 'ቡሉግ', nameArabic: 'بلوغ', nameOromic: 'Bulughii', slug: 'bulugh', description: 'Hadith compilation on rulings', icon: '📚', color: '#B45309', order: 3 },
    { name: 'Tajreed', nameAmharic: 'ታጅሪድ', nameArabic: 'تجريد', nameOromic: 'Tajriidii', slug: 'tajreed', description: 'Refined selected hadith', icon: '🎙️', color: '#4F46E5', order: 4 },
    { name: 'Riyad', nameAmharic: 'ሪያድ', nameArabic: 'رياض', nameOromic: 'Riyaadii', slug: 'riyad', description: 'Gardens of the righteous', icon: '🌿', color: '#65A30D', order: 5 },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }

  console.log('Auto-seed complete.');
}

autoSeed().then(() => repairResourceTypes()).then(() => syncUploadsToDb()).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

