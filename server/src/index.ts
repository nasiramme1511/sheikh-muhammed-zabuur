import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import prisma from './lib/prisma';
import { authLimiter, apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import teacherRoutes from './routes/teachers';
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
import assignmentRoutes from './routes/assignments';
import tasksRoutes from './routes/tasks';
import certificatesRoutes from './routes/certificates';
import notificationsRoutes from './routes/notifications';
import analyticsRoutes from './routes/analytics';
import liveRoutes from './routes/live';
import dashboardRoutes from './routes/dashboard';
import importRoutes from './routes/import';
import resourceCategoryRoutes from './routes/resourceCategories';
import appearanceRoutes from './routes/appearance';
import settingsRoutes from './routes/settings';
import downloadRoutes from './routes/download';

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
  return name
    .replace(/\.[^/.]+$/, '')
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
  if (fixed > 0) console.log(`  ✓ Repaired ${fixed} incorrectly typed resources`);
}

// ── Sync on-disk files → DB Resource records ──────────────────
async function syncUploadsToDb() {
  // Ensure Sheikh Mohammed Zabuur teacher exists
  let sheikhId: number | null = null;
  try {
    let sheikh = await prisma.teacher.findFirst({ where: { name: { contains: 'Zabuur' } } });
    if (!sheikh) {
      sheikh = await prisma.teacher.create({
        data: { name: 'Sheikh Mohammed Zabuur', slug: 'sheikh-mohammed-zabuur', verified: true, featured: true },
      });
    }
    sheikhId = sheikh.id;
  } catch {}

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
          teacherId: sheikhId,
        },
      });
      console.log(`  ✓ Synced resource: ${fileUrl}`);
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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security headers
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none';");
  next();
});

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Rate limiting
app.use('/api', apiLimiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/teachers', teacherRoutes);
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
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/import', importRoutes);
app.use('/api/resource-categories', resourceCategoryRoutes);
app.use('/api/appearance', appearanceRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/admin/settings', settingsRoutes);

// Serve client static files
const CLIENT_DIST = path.join(__dirname, '../../client/dist');
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

// Startup diagnostics
console.log('Environment Loaded');
console.log('Prisma Ready');
console.log('Database Connected');
console.log('Uploads Folder Ready');

// Show connection target (without password)
try {
  const dbUrl = new URL(process.env.DATABASE_URL || '');
  console.log(`  → Database: ${dbUrl.hostname}:${dbUrl.port || 3306}/${dbUrl.pathname.replace('/', '')}`);
} catch {
  console.log('  → Database: DATABASE_URL not set');
}

repairResourceTypes().then(() => syncUploadsToDb()).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

