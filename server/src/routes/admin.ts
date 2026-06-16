import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

router.use(authenticate);
router.use(adminOnly);

const uploadDir = path.join(__dirname, '../../uploads');

// Ensure all upload subdirectories exist
['images', 'pdfs', 'audio', 'videos'].forEach((sub) => {
  const dir = path.join(uploadDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Reject dangerous executable extensions
const BLOCKED_EXTS = new Set(['.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.dll', '.vbs', '.js', '.ts']);

function detectTypeFromExt(ext: string): { subdir: string; resourceType: string; typeLabel: string } | null {
  const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.ogv'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const pdfExts = ['.pdf'];

  if (pdfExts.includes(ext)) return { subdir: 'pdfs', resourceType: 'PDF', typeLabel: 'pdf' };
  if (audioExts.includes(ext)) return { subdir: 'audio', resourceType: 'AUDIO', typeLabel: 'audio' };
  if (videoExts.includes(ext)) return { subdir: 'videos', resourceType: 'VIDEO', typeLabel: 'video' };
  if (imageExts.includes(ext)) return { subdir: 'images', resourceType: 'IMAGE', typeLabel: 'image' };
  return null;
}

// Allowed MIME types mapped to subdir
const MIME_MAP: Record<string, string> = {
  'image/jpeg': 'images',
  'image/png': 'images',
  'image/webp': 'images',
  'image/gif': 'images',
  'application/pdf': 'pdfs',
  'audio/mpeg': 'audio',
  'audio/mp3': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/aac': 'audio',
  'audio/x-m4a': 'audio',
  'video/mp4': 'videos',
  'video/webm': 'videos',
  'video/ogg': 'videos',
  'video/quicktime': 'videos',
};

function sanitizeFilename(original: string): string {
  const ext = path.extname(original).toLowerCase();
  const base = path.basename(original, ext)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-') // replace unsafe chars
    .replace(/-+/g, '-')            // collapse dashes
    .replace(/^-|-$/g, '');         // trim leading/trailing dashes
  return (base || 'upload') + ext;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = MIME_MAP[file.mimetype] || 'images';
    const dir = path.join(uploadDir, subdir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const overwrite = req.body?.overwrite === 'true';
    if (overwrite) {
      cb(null, sanitizeFilename(file.originalname));
    } else {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'upload';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${base}-${uniqueSuffix}${ext}`);
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_EXTS.has(ext)) {
      return cb(new Error('File type not allowed'));
    }
    if (!MIME_MAP[file.mimetype]) {
      return cb(new Error('Invalid file type: ' + file.mimetype));
    }
    cb(null, true);
  },
});

function deriveCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('tafsir') || n.includes('quran') || n.includes('surah') || n.includes('ayat')) return 'Tafsir';
  if (n.includes('aqeedah') || n.includes('aqidah') || n.includes('tawheed') || n.includes('wasitiyyah') || n.includes('iman') || n.includes('rububiyyah') || n.includes('uluhiyyah')) return 'Aqeedah';
  if (n.includes('hadith') || n.includes('bukhari') || n.includes('muslim') || n.includes('sahih') || n.includes('ahkam')) return 'Hadith';
  if (n.includes('fiqh') || n.includes('prayer') || n.includes('salah') || n.includes('wudu') || n.includes('zakat') || n.includes('sawm') || n.includes('hajj') || n.includes('bulugh') || n.includes('umdah')) return 'Fiqh';
  if (n.includes('seerah') || n.includes('prophet') || n.includes('sirah') || n.includes('muhammad') || n.includes('raheeq') || n.includes('makhtum')) return 'Seerah';
  if (n.includes('arabic') || n.includes('grammar') || n.includes('nahw') || n.includes('sarf') || n.includes('ajrumiyyah')) return 'Arabic Language';
  if (n.includes('tajweed') || n.includes('recitation') || n.includes('tajwid') || n.includes('tahsin') || n.includes('qaidah') || n.includes('nuraniyyah')) return 'Tajweed';
  if (n.includes('manhaj') || n.includes('salaf')) return 'Manhaj';
  if (n.includes('character') || n.includes('adab') || n.includes('akhlaq') || n.includes('ikhlas') || n.includes('niyyah')) return 'Adab';
  if (n.includes('riyad') || n.includes('salihin')) return 'Riyadus Salihin';
  if (n.includes('dawah') || n.includes('da\'wah')) return "Da'wah";
  if (n.includes('khutbah') || n.includes('sermon')) return 'Khutbah';
  if (n.includes('ramadan')) return 'Ramadan Series';
  if (n.includes('qa') || n.includes('question') || n.includes('fatwa')) return 'Questions & Answers';
  if (n.includes('usul') || n.includes('usool')) return 'Usul al-Fiqh';
  return 'General Lectures';
}

function prettyTitle(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

router.post('/upload', (req: AuthRequest, res: Response) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, category, teacherId: rawTeacherId, bookId: rawBookId, resourceType, language, featured, collection } = req.body;

    // Validate required fields
    if (!title || !resourceType || !category) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({ error: 'title, resourceType, and category are required' });
    }

    const userType = (resourceType as string).toUpperCase();
    if (!['PDF', 'AUDIO', 'VIDEO', 'IMAGE'].includes(userType)) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({ error: 'Invalid resourceType. Must be PDF, AUDIO, VIDEO, or IMAGE' });
    }

    // Auto-assign Sheikh Mohammed Zabuur as teacher
    let teacherId: number | null = null;
    try {
      const shaykh = await prisma.teacher.findFirst({ where: { name: { contains: 'Zabuur' } } });
      if (shaykh) {
        teacherId = shaykh.id;
      } else {
        const created = await prisma.teacher.create({
          data: { name: 'Sheikh Mohammed Zabuur', slug: 'shaykh-mohammed-zabuur', verified: true, featured: true },
        });
        teacherId = created.id;
      }
    } catch {}

    // Safely parse bookId
    let bookId: number | null = null;
    if (rawBookId !== undefined && rawBookId !== null && rawBookId !== '') {
      bookId = Number(rawBookId);
      if (isNaN(bookId)) {
        try { fs.unlinkSync(req.file.path); } catch {}
        return res.status(400).json({ error: 'bookId must be a valid number' });
      }
    }

    const finalLanguage = (language && typeof language === 'string') ? language : 'en';
    const finalFeatured = featured === 'true' || featured === true;

    let finalCollection: string | null = collection || null;
    if (!finalCollection) {
      const n = req.file.originalname.toLowerCase();
      const colPairs: [string, string][] = [
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
        ['qa', 'questions-and-answers'], ['question', 'questions-and-answers'], ['fatwa', 'questions-and-answers'],
        ['general', 'general-lectures'], ['lecture', 'general-lectures'], ['dawah', 'general-lectures'],
      ];
      for (const [kw, colSlug] of colPairs) {
        if (n.includes(kw)) { finalCollection = colSlug; break; }
      }
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const extDetect = detectTypeFromExt(ext);
    const mimeSubdir = MIME_MAP[req.file.mimetype];
    const subdir = extDetect?.subdir || mimeSubdir || 'images';
    const typeLabel = extDetect?.typeLabel || (subdir === 'pdfs' ? 'pdf' : subdir === 'audio' ? 'audio' : subdir === 'videos' ? 'video' : 'image');

    // Always trust extension over user-provided resourceType
    const finalResourceType = extDetect?.resourceType || userType;

    // Per-type size validation
    if (finalResourceType === 'IMAGE' && req.file.size > 50 * 1024 * 1024) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({ error: 'Image exceeds 50MB limit' });
    }
    if (finalResourceType === 'PDF' && req.file.size > 500 * 1024 * 1024) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({ error: 'PDF exceeds 500MB limit' });
    }
    if (finalResourceType === 'AUDIO' && req.file.size > 500 * 1024 * 1024) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({ error: 'Audio exceeds 500MB limit' });
    }
    // VIDEO has 2GB global limit from multer config

    const relativePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
    const fileUrl = '/uploads/' + relativePath;

    // Ensure file is in the correct subdirectory
    const correctDir = path.join(uploadDir, subdir);
    if (path.dirname(req.file.path) !== correctDir) {
      const destPath = path.join(correctDir, path.basename(req.file.path));
      if (!fs.existsSync(correctDir)) fs.mkdirSync(correctDir, { recursive: true });
      try { fs.copyFileSync(req.file.path, destPath); fs.unlinkSync(req.file.path); } catch {}
    }

    const fileHash = crypto.createHash('sha256').update(fs.readFileSync(req.file.path)).digest('hex');

    try {
      const existingResource = await prisma.resource.findFirst({
        where: {
          OR: [
            { fileUrl },
            ...(fileHash ? [{ fileHash }] : []),
          ],
        },
      });
      if (existingResource) {
        await prisma.resource.update({
          where: { id: existingResource.id },
          data: {
            title,
            description: description || null,
            category,
            collection: finalCollection,
            resourceType: finalResourceType as any,
            language: finalLanguage,
            featured: finalFeatured,
            teacherId,
            bookId,
            fileHash: fileHash || existingResource.fileHash,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.resource.create({
          data: {
            title,
            description: description || null,
            fileUrl,
            fileHash: fileHash || null,
            fileType: typeLabel,
            resourceType: finalResourceType as any,
            teacherId,
            bookId,
            category,
            collection: finalCollection,
            language: finalLanguage,
            featured: finalFeatured,
            views: 0,
            downloads: 0,
          },
        });
      }
    } catch (dbErr) {
      console.error('Database save error:', dbErr);
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(500).json({ error: 'Failed to save resource metadata to database' });
    }

    res.json({
      url: fileUrl,
      name: req.file.filename,
      size: req.file.size,
      type: typeLabel,
    });
  });
});


// GET /admin/resources — list all uploaded files from DB
router.get('/resources', async (_req: AuthRequest, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: { select: { id: true, name: true, slug: true } },
        book: { select: { id: true, title: true, slug: true } },
      },
    });

    const results = resources.map((r) => {
      let size = 0;
      if (r.fileUrl.startsWith('/uploads/')) {
        try {
          const relativePath = r.fileUrl.replace('/uploads/', '');
          const filePath = path.join(uploadDir, relativePath);
          size = fs.statSync(filePath).size;
        } catch {}
      }
      return {
        id: r.id,
        name: r.fileUrl.split('/').pop() || 'resource',
        url: r.fileUrl,
        size,
        type: r.fileType === 'pdf' ? 'pdf' : r.fileType,
        resourceType: r.resourceType,
        createdAt: r.createdAt.toISOString(),
        category: r.category,
        collection: r.collection,
        title: r.title,
        description: r.description,
        language: r.language,
        featured: r.featured,
        author: r.author,
        teacherId: r.teacherId,
        bookId: r.bookId,
        teacher: r.teacher,
        book: r.book,
      };
    });

    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to list resources' });
  }
});

// PUT /admin/resources/:id — edit resource metadata
router.put('/resources/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, description, category, author, language, featured, teacherId, bookId, resourceType, collection } = req.body;
    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(language !== undefined ? { language } : {}),
        ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
        ...(teacherId !== undefined ? { teacherId: teacherId ? Number(teacherId) : null } : {}),
        ...(bookId !== undefined ? { bookId: bookId ? Number(bookId) : null } : {}),
        ...(resourceType !== undefined ? { resourceType } : {}),
        ...(collection !== undefined ? { collection: collection || null } : {}),
      }
    });
    res.json(updated);
  } catch {
    res.status(400).json({ error: 'Failed to update resource metadata' });
  }
});

// DELETE /admin/resources — delete an uploaded file
router.delete('/resources', async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url required' });
    }
    const rel = url.replace(/^\//, '').replace(/^uploads\//, '');
    const parts = rel.split('/');
    if (parts.length < 2) return res.status(400).json({ error: 'Invalid path' });
    const filePath = path.join(uploadDir, ...parts.map(decodeURIComponent));
    
    // Prevent path traversal
    if (!filePath.startsWith(uploadDir)) {
      return res.status(400).json({ error: 'Invalid path' });
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await prisma.resource.deleteMany({
      where: { fileUrl: url }
    });

    res.json({ message: 'File deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});


router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { order: 'asc' },
        include: { _count: { select: { lessons: true, books: true } } },
      }),
      prisma.category.count(),
    ]);

    res.json({ items: categories, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const { name, nameAmharic, nameArabic, nameOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, image, icon, color, order, isBeginner } = req.body;
    const category = await prisma.category.create({
      data: { name, nameAmharic, nameArabic, nameOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, image, icon, color, order, isBeginner },
    });
    res.status(201).json(category);
  } catch {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const { name, nameAmharic, nameArabic, nameOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, image, icon, color, order, isBeginner } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { name, nameAmharic, nameArabic, nameOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, image, icon, color, order, isBeginner },
    });
    res.json(category);
  } catch {
    res.status(400).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    await prisma.lesson.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    await prisma.book.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Category deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

router.get('/teachers', async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count(),
    ]);

    res.json({ items: teachers, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.post('/teachers', async (req: AuthRequest, res: Response) => {
  try {
    const { name, nameAmharic, nameArabic, nameOromic, slug, bio, bioAmharic, bioArabic, bioOromic, image, telegram, youtube, facebook, instagram, tiktok, twitter, whatsapp, website, languages, specialties, education, verified, featured, studentsCount } = req.body;
    const teacher = await prisma.teacher.create({
      data: { name, nameAmharic, nameArabic, nameOromic, slug, bio, bioAmharic, bioArabic, bioOromic, image, telegram, youtube, facebook, instagram, tiktok, twitter, whatsapp, website, languages, specialties, education, verified, featured, studentsCount },
    });
    res.status(201).json(teacher);
  } catch {
    res.status(400).json({ error: 'Failed to create teacher' });
  }
});

router.put('/teachers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.teacher.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Teacher not found' });

    const { name, nameAmharic, nameArabic, nameOromic, slug, bio, bioAmharic, bioArabic, bioOromic, image, telegram, youtube, facebook, instagram, tiktok, twitter, whatsapp, website, languages, specialties, education, verified, featured, studentsCount } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { name, nameAmharic, nameArabic, nameOromic, slug, bio, bioAmharic, bioArabic, bioOromic, image, telegram, youtube, facebook, instagram, tiktok, twitter, whatsapp, website, languages, specialties, education, verified, featured, studentsCount },
    });
    res.json(teacher);
  } catch {
    res.status(400).json({ error: 'Failed to update teacher' });
  }
});

router.delete('/teachers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.teacher.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Teacher not found' });

    await prisma.lesson.updateMany({ where: { teacherId: id }, data: { teacherId: null } });
    await prisma.book.updateMany({ where: { teacherId: id }, data: { teacherId: null } });
    await prisma.teacher.delete({ where: { id } });

    res.json({ message: 'Teacher deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

router.get('/lessons', async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { categoryId, teacherId, bookId, published } = req.query;

    const where: any = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (teacherId) where.teacherId = Number(teacherId);
    if (bookId) where.bookId = Number(bookId);
    if (published === 'true') where.published = true;
    else if (published === 'false') where.published = false;

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          book: { select: { id: true, title: true } },
          _count: { select: { bookmarks: true, progress: true } },
        },
      }),
      prisma.lesson.count({ where }),
    ]);

    res.json({ items: lessons, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

router.post('/lessons', async (req: AuthRequest, res: Response) => {
  try {
    const { title, titleAmharic, titleArabic, titleOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, audioUrl, pdfUrl, duration, episodeNumber, categoryId, teacherId, bookId, isBeginner, published } = req.body;
    const lesson = await prisma.lesson.create({
      data: { title, titleAmharic, titleArabic, titleOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, audioUrl, pdfUrl, duration, episodeNumber, categoryId, teacherId, bookId, isBeginner, published },
    });
    res.status(201).json(lesson);
  } catch {
    res.status(400).json({ error: 'Failed to create lesson' });
  }
});

router.put('/lessons/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Lesson not found' });

    const { title, titleAmharic, titleArabic, titleOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, audioUrl, pdfUrl, duration, episodeNumber, categoryId, teacherId, bookId, isBeginner, published } = req.body;
    const lesson = await prisma.lesson.update({
      where: { id },
      data: { title, titleAmharic, titleArabic, titleOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, audioUrl, pdfUrl, duration, episodeNumber, categoryId, teacherId, bookId, isBeginner, published },
    });
    res.json(lesson);
  } catch {
    res.status(400).json({ error: 'Failed to update lesson' });
  }
});

router.delete('/lessons/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Lesson not found' });

    await prisma.lesson.delete({ where: { id } });
    res.json({ message: 'Lesson deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

router.get('/books', async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { categoryId, teacherId } = req.query;

    const where: any = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (teacherId) where.teacherId = Number(teacherId);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true } },
          _count: { select: { lessons: true } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    res.json({ items: books, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

router.post('/books', async (req: AuthRequest, res: Response) => {
  try {
    const { title, titleAmharic, titleArabic, titleOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, author, pdfUrl, pdfUrlAr, pdfUrlAm, pdfUrlOm, coverImage, coverImageAr, coverImageAm, coverImageOm, categoryId, teacherId, isBeginner } = req.body;
    const book = await prisma.book.create({
      data: { title, titleAmharic, titleArabic, titleOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, author, pdfUrl, pdfUrlAr, pdfUrlAm, pdfUrlOm, coverImage, coverImageAr, coverImageAm, coverImageOm, categoryId, teacherId, isBeginner },
    });
    res.status(201).json(book);
  } catch {
    res.status(400).json({ error: 'Failed to create book' });
  }
});

router.put('/books/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Book not found' });

    const { title, titleAmharic, titleArabic, titleOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, author, pdfUrl, pdfUrlAr, pdfUrlAm, pdfUrlOm, coverImage, coverImageAr, coverImageAm, coverImageOm, categoryId, teacherId, isBeginner } = req.body;
    const book = await prisma.book.update({
      where: { id },
      data: { title, titleAmharic, titleArabic, titleOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, author, pdfUrl, pdfUrlAr, pdfUrlAm, pdfUrlOm, coverImage, coverImageAr, coverImageAm, coverImageOm, categoryId, teacherId, isBeginner },
    });
    res.json(book);
  } catch {
    res.status(400).json({ error: 'Failed to update book' });
  }
});

router.delete('/books/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Book not found' });

    await prisma.book.delete({ where: { id } });
    res.json({ message: 'Book deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, image: true, role: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ items: users, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, image: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [bookmarkCount, progressCount] = await Promise.all([
      prisma.bookmark.count({ where: { userId: id } }),
      prisma.userProgress.count({ where: { userId: id } }),
    ]);

    res.json({ ...user, bookmarkCount, progressCount });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalAudio,
      totalVideo,
      totalPdf,
      totalImages,
      totalRecordings,
      aggregates,
      allResources,
      recentUsers,
      recentActivity,
      totalTelegramChannels,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.resource.count({ where: { resourceType: 'AUDIO' } }),
      prisma.resource.count({
        where: {
          resourceType: 'VIDEO',
          fileType: { not: 'recording' },
        },
      }),
      prisma.resource.count({ where: { resourceType: 'PDF' } }),
      prisma.resource.count({ where: { resourceType: 'IMAGE' } }),
      prisma.resource.count({
        where: {
          resourceType: 'VIDEO',
          fileType: 'recording',
        },
      }),
      prisma.resource.aggregate({
        _sum: {
          views: true,
          downloads: true,
        },
      }),
      prisma.resource.findMany({
        select: { fileUrl: true, resourceType: true },
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, image: true, createdAt: true },
      }),
      prisma.usageLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.telegramChannel.count(),
    ]);

    // Calculate total storage and per-type storage
    let totalStorage = 0;
    let audioStorage = 0;
    let videoStorage = 0;
    let pdfStorage = 0;
    let imageStorage = 0;
    for (const r of allResources) {
      if (r.fileUrl.startsWith('/uploads/')) {
        try {
          const relativePath = r.fileUrl.replace('/uploads/', '');
          const filePath = path.join(uploadDir, relativePath);
          if (fs.existsSync(filePath)) {
            const size = fs.statSync(filePath).size;
            totalStorage += size;
            if (r.resourceType === 'AUDIO') audioStorage += size;
            else if (r.resourceType === 'VIDEO') videoStorage += size;
            else if (r.resourceType === 'PDF') pdfStorage += size;
            else if (r.resourceType === 'IMAGE') imageStorage += size;
          }
        } catch {}
      }
    }

    // Fetch popular audio and video content
    const [popularAudio, popularVideos] = await Promise.all([
      prisma.resource.findMany({
        where: { resourceType: 'AUDIO' },
        take: 10,
        orderBy: { views: 'desc' },
      }),
      prisma.resource.findMany({
        where: { resourceType: 'VIDEO' },
        take: 10,
        orderBy: { views: 'desc' },
      }),
    ]);

    res.json({
      totalUsers,
      totalAudio,
      totalVideo,
      totalPdf,
      totalImages,
      totalRecordings,
      totalTelegramChannels,
      totalResources: totalAudio + totalVideo + totalPdf + totalImages + totalRecordings,
      totalViews: aggregates._sum.views || 0,
      totalDownloads: aggregates._sum.downloads || 0,
      totalStorage,
      storageByType: {
        audio: audioStorage,
        video: videoStorage,
        pdf: pdfStorage,
        image: imageStorage,
      },
      recentUsers,
      recentActivity,
      popularAudio,
      popularVideos,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/levels', async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [levels, total] = await Promise.all([
      prisma.level.findMany({
        skip,
        take: limit,
        orderBy: { order: 'asc' },
        include: { _count: { select: { lessons: true, quizzes: true } } },
      }),
      prisma.level.count(),
    ]);

    res.json({ items: levels, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

router.post('/levels', async (req: AuthRequest, res: Response) => {
  try {
    const { name, nameAmharic, nameArabic, nameOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, order, icon, color } = req.body;
    const level = await prisma.level.create({
      data: { name, nameAmharic, nameArabic, nameOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, order, icon, color },
    });
    res.status(201).json(level);
  } catch {
    res.status(400).json({ error: 'Failed to create level' });
  }
});

router.put('/levels/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.level.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Level not found' });

    const { name, nameAmharic, nameArabic, nameOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, order, icon, color } = req.body;
    const level = await prisma.level.update({
      where: { id },
      data: { name, nameAmharic, nameArabic, nameOromic, slug, description, descriptionAmharic, descriptionArabic, descriptionOromic, order, icon, color },
    });
    res.json(level);
  } catch {
    res.status(400).json({ error: 'Failed to update level' });
  }
});

router.delete('/levels/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.level.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Level not found' });

    await prisma.lesson.updateMany({ where: { levelId: id }, data: { levelId: null } });
    await prisma.level.delete({ where: { id } });
    res.json({ message: 'Level deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete level' });
  }
});

router.get('/levels/:id/quizzes', async (req: AuthRequest, res: Response) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { levelId: Number(req.params.id) },
    });
    res.json(quizzes);
  } catch {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

router.post('/levels/:id/quizzes', async (req: AuthRequest, res: Response) => {
  try {
    const { question, questionAmharic, questionArabic, questionOromic, options, correctIndex } = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        levelId: Number(req.params.id),
        question,
        questionAmharic,
        questionArabic,
        questionOromic,
        options,
        correctIndex,
      },
    });
    res.status(201).json(quiz);
  } catch {
    res.status(400).json({ error: 'Failed to create quiz' });
  }
});

router.get('/telegram', async (_req: AuthRequest, res: Response) => {
  try {
    const channels = await prisma.telegramChannel.findMany({ orderBy: { name: 'asc' } });
    res.json(channels);
  } catch {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

router.post('/telegram', async (req: AuthRequest, res: Response) => {
  try {
    const { name, link, teacherName, description, category, enabled } = req.body;
    const channel = await prisma.telegramChannel.create({
      data: { name, link, teacherName: teacherName || 'Sheikh Muhammad Zabuur', description, category: category || 'General', enabled: enabled ?? true },
    });
    res.status(201).json(channel);
  } catch {
    res.status(400).json({ error: 'Failed to create channel' });
  }
});

router.put('/telegram/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.telegramChannel.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Channel not found' });
    const { name, link, teacherName, description, category, enabled } = req.body;
    const channel = await prisma.telegramChannel.update({
      where: { id },
      data: { name, link, teacherName, description, category, enabled },
    });
    res.json(channel);
  } catch {
    res.status(400).json({ error: 'Failed to update channel' });
  }
});

router.delete('/telegram/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.telegramChannel.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Channel not found' });
    await prisma.telegramChannel.delete({ where: { id } });
    res.json({ message: 'Channel deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

router.post('/telegram/bulk-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' });
    await prisma.telegramChannel.deleteMany({ where: { id: { in: ids } } });
    res.json({ message: `${ids.length} channels deleted` });
  } catch {
    res.status(500).json({ error: 'Failed to bulk delete channels' });
  }
});

router.post('/telegram/bulk-import', async (req: AuthRequest, res: Response) => {
  try {
    const channels: { name: string; link: string; teacherName?: string; description?: string }[] = req.body;
    if (!Array.isArray(channels) || channels.length === 0) return res.status(400).json({ error: 'No channels provided' });
    const created = await prisma.telegramChannel.createMany({
      data: channels.map(c => ({ name: c.name, link: c.link, teacherName: c.teacherName || null, description: c.description || null })),
      skipDuplicates: true,
    });
    res.json({ count: created.count });
  } catch {
    res.status(500).json({ error: 'Failed to bulk import channels' });
  }
});

router.put('/telegram/:id/toggle-enabled', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const channel = await prisma.telegramChannel.findUnique({ where: { id } });
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    const updated = await prisma.telegramChannel.update({ where: { id }, data: { enabled: !channel.enabled } });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
});

router.get('/telegram/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [total, channels] = await Promise.all([
      prisma.telegramChannel.count(),
      prisma.telegramChannel.findMany({ select: { teacherName: true } }),
    ]);
    const teachers = new Set(channels.map(c => c.teacherName).filter(Boolean));
    res.json({ total, featured: 0, teachers: teachers.size });
  } catch {
    res.status(500).json({ error: 'Failed to fetch telegram stats' });
  }
});

// GET /admin/duplicates — find duplicate resources by title, filename, or fileHash
router.get('/duplicates', async (_req: AuthRequest, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    });

    const groups: { key: string; type: 'title' | 'filename' | 'hash'; items: typeof resources }[] = [];
    const processed = new Set<number>();

    // Group by title (case-insensitive)
    const titleMap = new Map<string, typeof resources>();
    for (const r of resources) {
      const key = r.title.toLowerCase().trim();
      if (!titleMap.has(key)) titleMap.set(key, []);
      titleMap.get(key)!.push(r);
    }
    for (const [key, items] of titleMap) {
      if (items.length > 1) {
        groups.push({ key, type: 'title', items });
        items.forEach(r => processed.add(r.id));
      }
    }

    // Group by filename (extracted from fileUrl)
    const filenameMap = new Map<string, typeof resources>();
    for (const r of resources) {
      if (processed.has(r.id)) continue;
      const fname = r.fileUrl.split('/').pop()?.toLowerCase() || '';
      if (!filenameMap.has(fname)) filenameMap.set(fname, []);
      filenameMap.get(fname)!.push(r);
    }
    for (const [key, items] of filenameMap) {
      if (items.length > 1) {
        groups.push({ key, type: 'filename', items });
        items.forEach(r => processed.add(r.id));
      }
    }

    // Group by fileHash
    const hashMap = new Map<string, typeof resources>();
    for (const r of resources) {
      if (processed.has(r.id) || !r.fileHash) continue;
      if (!hashMap.has(r.fileHash)) hashMap.set(r.fileHash, []);
      hashMap.get(r.fileHash)!.push(r);
    }
    for (const [key, items] of hashMap) {
      if (items.length > 1) {
        groups.push({ key, type: 'hash', items });
        items.forEach(r => processed.add(r.id));
      }
    }

    res.json(groups);
  } catch {
    res.status(500).json({ error: 'Failed to find duplicates' });
  }
});

// POST /admin/duplicates/merge — merge duplicates, keep the specified ID
router.post('/duplicates/merge', async (req: AuthRequest, res: Response) => {
  try {
    const { keepId, deleteIds } = req.body;
    if (!keepId || !deleteIds || !Array.isArray(deleteIds) || deleteIds.length === 0) {
      return res.status(400).json({ error: 'keepId and deleteIds are required' });
    }
    const toDelete = await prisma.resource.findMany({
      where: { id: { in: deleteIds } },
    });
    const kept = await prisma.resource.findUnique({ where: { id: keepId } });
    if (!kept) return res.status(404).json({ error: 'Resource to keep not found' });

    // Merge download and view counts
    const extraDownloads = toDelete.reduce((sum, r) => sum + r.downloads, 0);
    const extraViews = toDelete.reduce((sum, r) => sum + r.views, 0);
    await prisma.resource.update({
      where: { id: keepId },
      data: {
        downloads: kept.downloads + extraDownloads,
        views: kept.views + extraViews,
      },
    });

    await prisma.resource.deleteMany({ where: { id: { in: deleteIds } } });
    res.json({ message: `Merged ${deleteIds.length} duplicates into resource ${keepId}` });
  } catch {
    res.status(500).json({ error: 'Failed to merge duplicates' });
  }
});

// POST /admin/repair-types — fix incorrectly typed resources based on extension
router.post('/repair-types', async (_req: AuthRequest, res: Response) => {
  try {
    const resources = await prisma.resource.findMany();
    let fixed = 0;
    for (const r of resources) {
      const ext = path.extname(r.fileUrl).toLowerCase();
      const detected = detectTypeFromExt(ext);
      if (detected && (r.resourceType !== detected.resourceType || r.fileType !== detected.typeLabel)) {
        await prisma.resource.update({
          where: { id: r.id },
          data: { resourceType: detected.resourceType as any, fileType: detected.typeLabel },
        });
        fixed++;
      }
    }
    res.json({ message: `Repaired ${fixed} resources` });
  } catch {
    res.status(500).json({ error: 'Failed to repair resource types' });
  }
});

// ── Bulk Upload ───────────────────────────────────────────────
router.post('/upload/bulk', (req: AuthRequest, res: Response) => {
  const bulkUpload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (BLOCKED_EXTS.has(ext)) return cb(new Error('File type not allowed'));
      if (!MIME_MAP[file.mimetype] && ext !== '.zip') return cb(new Error('Invalid file type: ' + file.mimetype));
      cb(null, true);
    },
  });
  bulkUpload.array('files', 200)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const results: any[] = [];
    const duplicateAction = (req.body.duplicateAction as string) || 'skip';

    for (const file of files) {
      try {
        // Handle ZIP extraction
        if (path.extname(file.originalname).toLowerCase() === '.zip') {
          let zipErrors: string[] = [];
          try {
            const AdmZip = require('adm-zip');
            const zip = new AdmZip(file.path);
            const zipEntries = zip.getEntries();
            let extracted = 0;
            let zipCreated = 0;
            let zipSkipped = 0;
            for (const entry of zipEntries) {
              try {
                if (entry.isDirectory) continue;
                const entryExt = path.extname(entry.entryName).toLowerCase();
                if (BLOCKED_EXTS.has(entryExt)) continue;
                const detected = detectTypeFromExt(entryExt);
                if (!detected) continue;
                const subdir = detected.subdir;
                const destDir = path.join(uploadDir, subdir);
                if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
                const originalName = path.basename(entry.entryName);
                const safeName = sanitizeFilename(originalName);
                const destPath = path.join(destDir, safeName);
                zip.extractEntryTo(entry, destDir, false, true);
                const extractedPath = path.join(destDir, originalName);
                if (fs.existsSync(extractedPath) && extractedPath !== destPath) {
                  try { fs.renameSync(extractedPath, destPath); } catch {}
                }
                if (fs.existsSync(destPath)) {
                  const fileUrl = '/uploads/' + subdir + '/' + safeName;
                  const title = prettyTitle(safeName);
                  const shaykhId = await getSheikhTeacherId();
                  const existing = await prisma.resource.findFirst({ where: { fileUrl } });
                  if (!existing || duplicateAction === 'replace') {
                    const data = {
                      title,
                      fileUrl,
                      fileHash: crypto.createHash('sha256').update(fs.readFileSync(destPath)).digest('hex'),
                      fileType: detected.typeLabel,
                      resourceType: detected.resourceType as any,
                      category: deriveCategory(safeName),
                      collection: deriveCollectionFromName(safeName),
                      language: /[\u0600-\u06FF]/.test(safeName) ? 'ar' : 'en',
                      teacherId: shaykhId,
                    };
                    if (existing) {
                      await prisma.resource.update({ where: { id: existing.id }, data: { ...data, updatedAt: new Date() } });
                      results.push({ file: safeName, url: fileUrl, status: 'replaced' });
                      zipCreated++;
                    } else {
                      await prisma.resource.create({ data: { ...data, views: 0, downloads: 0 } });
                      results.push({ file: safeName, url: fileUrl, status: 'created' });
                      zipCreated++;
                    }
                    extracted++;
                  } else {
                    results.push({ file: safeName, url: fileUrl, status: 'skipped' });
                    zipSkipped++;
                    try { fs.unlinkSync(destPath); } catch {}
                  }
                }
              } catch (entryErr: any) {
                zipErrors.push(`Entry ${entry.entryName}: ${entryErr.message}`);
                results.push({ file: entry.entryName, status: 'error', message: entryErr.message });
              }
            }
            try { fs.unlinkSync(file.path); } catch {}
            const zipTotal = zipEntries.filter((e: any) => !e.isDirectory).length;
            logImport(file.originalname, zipTotal, zipCreated, zipErrors.length, zipErrors);
            results.push({ zip: file.originalname, extracted, created: zipCreated, skipped: zipSkipped, errors: zipErrors.length, status: 'extracted' });
          } catch (zipErr: any) {
            zipErrors.push(zipErr.message);
            logImport(file.originalname, 0, 0, 1, [zipErr.message]);
            results.push({ file: file.originalname, status: 'error', message: 'ZIP extraction failed: ' + zipErr.message });
            try { fs.unlinkSync(file.path); } catch {}
          }
          continue;
        }

        // Regular file processing
        const relativePath = file.path.replace(/\\/g, '/').split('uploads/')[1];
        const fileUrl = '/uploads/' + relativePath;
        const ext = path.extname(file.originalname).toLowerCase();
        const extDetect = detectTypeFromExt(ext);
        let subdir = extDetect?.subdir || MIME_MAP[file.mimetype] || 'images';
        let typeLabel = extDetect?.typeLabel || (subdir === 'pdfs' ? 'pdf' : subdir === 'audio' ? 'audio' : subdir === 'videos' ? 'video' : 'image');
        let resourceType = extDetect?.resourceType || (subdir === 'pdfs' ? 'PDF' : subdir === 'audio' ? 'AUDIO' : subdir === 'videos' ? 'VIDEO' : 'IMAGE');

        const correctDir = path.join(uploadDir, subdir);
        if (file.destination !== correctDir) {
          const destPath = path.join(correctDir, path.basename(file.path));
          if (!fs.existsSync(correctDir)) fs.mkdirSync(correctDir, { recursive: true });
          try { fs.copyFileSync(file.path, destPath); fs.unlinkSync(file.path); } catch {}
        }

        const title = prettyTitle(file.originalname);
        const category = deriveCategory(file.originalname);
        const collection = deriveCollectionFromName(file.originalname);
        const fileHash = crypto.createHash('sha256').update(fs.readFileSync(file.path)).digest('hex');

        const existing = await prisma.resource.findFirst({
          where: { OR: [{ fileUrl }, ...(fileHash ? [{ fileHash }] : [])] },
        });

        if (existing) {
          if (duplicateAction === 'skip') {
            results.push({ file: file.originalname, url: fileUrl, status: 'skipped' });
            try { fs.unlinkSync(file.path); } catch {}
            continue;
          }
          if (duplicateAction === 'replace') {
            const teacherId = await getSheikhTeacherId();
            await prisma.resource.update({
              where: { id: existing.id },
              data: { title, category, collection, resourceType: resourceType as any, fileType: typeLabel, fileHash, teacherId, updatedAt: new Date() },
            });
            results.push({ file: file.originalname, url: fileUrl, status: 'replaced' });
            try { fs.unlinkSync(file.path); } catch {}
            continue;
          }
        }

        const teacherId = await getSheikhTeacherId();
        const resource = await prisma.resource.create({
          data: {
            title, fileUrl, fileHash: fileHash || null, fileType: typeLabel,
            resourceType: resourceType as any, category, collection,
            language: /[\u0600-\u06FF]/.test(file.originalname) ? 'ar' : 'en',
            teacherId, views: 0, downloads: 0,
          },
        });

        results.push({
          id: resource.id, file: file.originalname, title, url: fileUrl,
          size: file.size, type: typeLabel, resourceType, category, collection,
          status: 'created',
        });
      } catch (fileErr: any) {
        results.push({ file: file.originalname, status: 'error', message: fileErr.message });
        try { fs.unlinkSync(file.path); } catch {}
      }
    }

    res.json({
      total: files.length,
      created: results.filter(r => r.status === 'created').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      replaced: results.filter(r => r.status === 'replaced').length,
      extracted: results.filter(r => r.status === 'extracted').length,
      errors: results.filter(r => r.status === 'error').length,
      results,
    });
  });
});

// ── Bulk Delete ───────────────────────────────────────────────
router.post('/resources/bulk-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const resources = await prisma.resource.findMany({ where: { id: { in: ids } } });
    for (const r of resources) {
      if (r.fileUrl.startsWith('/uploads/')) {
        const rel = r.fileUrl.replace('/uploads/', '');
        const parts = rel.split('/');
        if (parts.length >= 2) {
          const filePath = path.join(uploadDir, ...parts.map(decodeURIComponent));
          if (filePath.startsWith(uploadDir) && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch {}
          }
        }
      }
    }
    await prisma.resource.deleteMany({ where: { id: { in: ids } } });
    res.json({ message: `Deleted ${resources.length} resources`, count: resources.length });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: 'Failed to bulk delete' });
  }
});

// ── Delete All Resources by Type ──────────────────────────────
router.post('/resources/delete-all', async (req: AuthRequest, res: Response) => {
  try {
    const { resourceType } = req.body;
    const where: any = {};
    if (resourceType && resourceType !== 'ALL') {
      if (!['PDF', 'AUDIO', 'VIDEO', 'IMAGE'].includes(resourceType)) {
        return res.status(400).json({ error: 'Invalid resourceType. Use PDF, AUDIO, VIDEO, IMAGE, or ALL' });
      }
      where.resourceType = resourceType;
    }
    const resources = await prisma.resource.findMany({ where });
    for (const r of resources) {
      if (r.fileUrl.startsWith('/uploads/')) {
        const rel = r.fileUrl.replace('/uploads/', '');
        const parts = rel.split('/');
        if (parts.length >= 2) {
          const filePath = path.join(uploadDir, ...parts.map(decodeURIComponent));
          if (filePath.startsWith(uploadDir) && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch {}
          }
        }
      }
    }
    await prisma.resource.deleteMany({ where });
    const label = resourceType === 'ALL' ? 'Entire Library' : resourceType;
    res.json({ message: `Deleted all ${label} resources (${resources.length})`, count: resources.length });
  } catch (err) {
    console.error('Delete all error:', err);
    res.status(500).json({ error: 'Failed to delete all resources' });
  }
});

// ── Import Logger ─────────────────────────────────────────────
function logImport(zipName: string, found: number, imported: number, failed: number, errors: string[]) {
  try {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logPath = path.join(logDir, 'import.log');
    const lines: string[] = [];
    lines.push(`[${new Date().toISOString().split('T')[0]}]`);
    lines.push(`  ZIP: ${zipName}`);
    lines.push(`  Found: ${found} files`);
    lines.push(`  Imported: ${imported}`);
    lines.push(`  Failed: ${failed}`);
    if (errors.length > 0) {
      lines.push(`  Errors:`);
      for (const e of errors) lines.push(`    - ${e}`);
    }
    lines.push('');
    fs.appendFileSync(logPath, lines.join('\n'));
  } catch {}
}

// ── Delete by Category ────────────────────────────────────────
router.post('/resources/delete-by-category', async (req: AuthRequest, res: Response) => {
  try {
    const { category, resourceType, keepFeatured } = req.body;
    if (!category) return res.status(400).json({ error: 'category is required' });
    const where: any = { category };
    if (resourceType) where.resourceType = resourceType;
    if (keepFeatured) where.featured = false;
    const resources = await prisma.resource.findMany({ where });
    for (const r of resources) {
      if (r.fileUrl.startsWith('/uploads/')) {
        const rel = r.fileUrl.replace('/uploads/', '');
        const parts = rel.split('/');
        if (parts.length >= 2) {
          const filePath = path.join(uploadDir, ...parts.map(decodeURIComponent));
          if (filePath.startsWith(uploadDir) && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch {}
          }
        }
      }
    }
    await prisma.resource.deleteMany({ where });
    res.json({ message: `Deleted all resources in category "${category}"`, count: resources.length });
  } catch (err) {
    console.error('Delete by category error:', err);
    res.status(500).json({ error: 'Failed to delete by category' });
  }
});

// ── Move Resources Between Collections ────────────────────────
router.post('/resources/move-collection', async (req: AuthRequest, res: Response) => {
  try {
    const { ids, collection } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const targetCollection = collection || null;
    await prisma.resource.updateMany({
      where: { id: { in: ids } },
      data: { collection: targetCollection },
    });
    const label = targetCollection || 'none (unassigned)';
    res.json({ message: `Moved ${ids.length} resources to collection "${label}"`, count: ids.length });
  } catch (err) {
    console.error('Move collection error:', err);
    res.status(500).json({ error: 'Failed to move resources' });
  }
});

// ── Delete Entire Collection ──────────────────────────────────
router.delete('/collections/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const slug = req.params.slug;
    const resources = await prisma.resource.findMany({ where: { collection: slug } });
    for (const r of resources) {
      if (r.fileUrl.startsWith('/uploads/')) {
        const rel = r.fileUrl.replace('/uploads/', '');
        const parts = rel.split('/');
        if (parts.length >= 2) {
          const filePath = path.join(uploadDir, ...parts.map(decodeURIComponent));
          if (filePath.startsWith(uploadDir) && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch {}
          }
        }
      }
    }
    await prisma.resource.deleteMany({ where: { collection: slug } });
    res.json({ message: `Deleted collection "${slug}" with ${resources.length} resources`, count: resources.length });
  } catch (err) {
    console.error('Delete collection error:', err);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// ── Auto-Classify Content ─────────────────────────────────────
router.post('/resources/auto-classify', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    const where = ids && Array.isArray(ids) && ids.length > 0 ? { id: { in: ids } } : {};
    const resources = await prisma.resource.findMany({ where });
    let updated = 0;
    for (const r of resources) {
      const filename = r.fileUrl.split('/').pop() || r.title;
      const newCategory = deriveCategory(filename);
      const newCollection = deriveCollectionFromName(filename);
      const changes: any = {};
      if (newCategory !== r.category) changes.category = newCategory;
      if (newCollection !== r.collection) changes.collection = newCollection;
      if (Object.keys(changes).length > 0) {
        await prisma.resource.update({ where: { id: r.id }, data: changes });
        updated++;
      }
    }
    res.json({ message: `Auto-classified ${updated} of ${resources.length} resources`, updated, total: resources.length });
  } catch (err) {
    console.error('Auto-classify error:', err);
    res.status(500).json({ error: 'Failed to auto-classify' });
  }
});

// ── Helper functions ──────────────────────────────────────────
function deriveCollectionFromName(filename: string): string | null {
  const n = path.basename(filename, path.extname(filename)).toLowerCase().replace(/[-_]/g, ' ');
  const pairs: [string, string][] = [
    ['riyad', 'riyadhus-salihin'], ['salihin', 'riyadhus-salihin'], ['riyadh', 'riyadhus-salihin'], ['riyada', 'riyadhus-salihin'],
    ['bulugh', 'bulugh-al-maram'], ['buluukaa', 'bulugh-al-maram'],
    ['umdat', 'umdat-al-ahkam'], ['umdah', 'umdat-al-ahkam'],
    ['tafsir-ibn', 'tafsir-ibn-kathir'], ['ibn-kathir', 'tafsir-ibn-kathir'],
    ['tafsir', 'tafsir-al-quran'], ['tafsiira', 'tafsir-al-quran'], ['quran', 'tafsir-al-quran'], ['surah', 'tafsir-al-quran'], ['ayat', 'tafsir-al-quran'],
    ['usul', 'usul-ath-thalatha'], ['usuulu', 'usul-ath-thalatha'],
    ['tawheed', 'kitab-at-tawheed'],
    ['wasitiyyah', 'al-aqeedah-al-wasitiyyah'],
    ['manhaj', 'al-manhaj-as-salim'],
    ['tajweed', 'tajweed'], ['tajwid', 'tajweed'], ['nuraniyyah', 'tajweed'], ['noorani', 'tajweed'], ['qaidah', 'tajweed'], ['tahsin', 'tajweed'],
    ['arabic', 'arabic-grammar'], ['nahw', 'arabic-grammar'], ['nahwii', 'arabic-grammar'], ['sarf', 'arabic-grammar'], ['grammar', 'arabic-grammar'], ['ajrumiyyah', 'arabic-grammar'],
    ['seerah', 'seerah-nabawiyyah'], ['sirah', 'seerah-nabawiyyah'], ['raheeq', 'seerah-nabawiyyah'], ['makhtum', 'seerah-nabawiyyah'],
    ['fiqh', 'fiqh'], ['salah', 'fiqh'], ['prayer', 'fiqh'], ['wudu', 'fiqh'], ['zakat', 'fiqh'], ['sawm', 'fiqh'], ['hajj', 'fiqh'],
    ['ramadan', 'ramadan'], ['ramadhan', 'ramadan'],
    ['khutbah', 'khutbah'], ['sermon', 'khutbah'],
    ['qa-', 'questions-and-answers'], ['question', 'questions-and-answers'], ['fatwa', 'questions-and-answers'],
    ['general', 'general-lectures'], ['lecture', 'general-lectures'], ['dawah', 'general-lectures'],
  ];
  for (const [kw, colSlug] of pairs) {
    if (n.includes(kw)) return colSlug;
  }
  return null;
}

async function getSheikhTeacherId(): Promise<number | null> {
  try {
    const existing = await prisma.teacher.findFirst({ where: { name: { contains: 'Zabuur' } } });
    if (existing) return existing.id;
    const created = await prisma.teacher.create({
      data: { name: 'Sheikh Mohammed Zabuur', slug: 'shaykh-mohammed-zabuur', verified: true, featured: true },
    });
    return created.id;
  } catch { return null; }
}

export default router;
