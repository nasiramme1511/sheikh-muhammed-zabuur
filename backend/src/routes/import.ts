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

['images', 'pdfs', 'audio', 'videos'].forEach((sub) => {
  const dir = path.join(uploadDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

function deriveCollection(pathname: string): string | null {
  const n = path.basename(pathname, path.extname(pathname)).toLowerCase().replace(/[-_]/g, ' ');
  const pairs: [string, string][] = [
    ['riyad', 'riyadhus-salihin'], ['salihin', 'riyadhus-salihin'], ['riyadh', 'riyadhus-salihin'],
    ['bulugh', 'bulugh-al-maram'],
    ['umdat', 'umdat-al-ahkam'], ['umdah', 'umdat-al-ahkam'],
    ['tafsir-ibn', 'tafsir-ibn-kathir'], ['ibn-kathir', 'tafsir-ibn-kathir'],
    ['tafsir', 'tafsir-al-quran'], ['quran', 'tafsir-al-quran'], ['surah', 'tafsir-al-quran'], ['ayat', 'tafsir-al-quran'],
    ['usul', 'usul-ath-thalatha'],
    ['tawheed', 'kitab-at-tawheed'],
    ['wasitiyyah', 'al-aqeedah-al-wasitiyyah'],
    ['manhaj', 'al-manhaj-as-salim'],
    ['tajweed', 'tajweed'], ['tajwid', 'tajweed'], ['nuraniyyah', 'tajweed'], ['noorani', 'tajweed'], ['qaidah', 'tajweed'], ['tahsin', 'tajweed'],
    ['arabic', 'arabic-grammar'], ['nahw', 'arabic-grammar'], ['sarf', 'arabic-grammar'], ['grammar', 'arabic-grammar'], ['ajrumiyyah', 'arabic-grammar'],
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
  'audio/m4a': 'audio',
  'video/mp4': 'videos',
  'video/webm': 'videos',
  'video/ogg': 'videos',
  'video/quicktime': 'videos',
  'video/x-matroska': 'videos',
};

const RESOURCE_CATEGORIES = [
  'Tafsir', 'Hadith', 'Riyadus Salihin', 'Tajweed',
  'Usul al-Fiqh', 'Fiqh', 'Seerah', 'Aqeedah',
  'Arabic Language', 'Manhaj', 'Adab', 'Da\'wah',
  'Khutbah', 'Ramadan Series', 'Questions & Answers', 'General Lectures',
] as const;

function detectCategory(filename: string): string {
  const n = path.basename(filename, path.extname(filename)).toLowerCase().replace(/[-_]/g, ' ');

  const categoryKeywords: [string, string][] = [
    ['tafsir', 'Tafsir'], ['quran', 'Tafsir'], ['surah', 'Tafsir'], ['ayat', 'Tafsir'], ['ibn kathir', 'Tafsir'],
    ['hadith', 'Hadith'], ['bukhari', 'Hadith'], ['muslim', 'Hadith'], ['abu dawud', 'Hadith'], ['tirmidhi', 'Hadith'], ['nasai', 'Hadith'], ['ibn majah', 'Hadith'], ['sahih', 'Hadith'], ['ahkam', 'Hadith'],
    ['riyad', 'Riyadus Salihin'], ['riyadus', 'Riyadus Salihin'], ['salihin', 'Riyadus Salihin'], ['riyadh', 'Riyadus Salihin'],
    ['tajweed', 'Tajweed'], ['tajwid', 'Tajweed'], ['tahsin', 'Tajweed'], ['qaidah', 'Tajweed'], ['qaida', 'Tajweed'], ['nuraniyyah', 'Tajweed'], ['nuraniah', 'Tajweed'], ['noorani', 'Tajweed'],
    ['usul al fiqh', 'Usul al-Fiqh'], ['usul al-fiqh', 'Usul al-Fiqh'], ['usul', 'Usul al-Fiqh'],
    ['fiqh', 'Fiqh'], ['salah', 'Fiqh'], ['prayer', 'Fiqh'], ['wudu', 'Fiqh'], ['zakat', 'Fiqh'], ['sawm', 'Fiqh'], ['hajj', 'Fiqh'], ['bulugh', 'Fiqh'], ['bulugh al maram', 'Fiqh'], ['umdah', 'Fiqh'], ['salaah', 'Fiqh'],
    ['seerah', 'Seerah'], ['sirah', 'Seerah'], ['prophet', 'Seerah'], ['nabi', 'Seerah'], ['rasul', 'Seerah'], ['muhammad', 'Seerah'], ['sallallahu', 'Seerah'], ['raheeq', 'Seerah'], ['makhtum', 'Seerah'],
    ['aqeedah', 'Aqeedah'], ['aqidah', 'Aqeedah'], ['tawheed', 'Aqeedah'], ['tawhid', 'Aqeedah'], ['wasitiyyah', 'Aqeedah'], ['iman', 'Aqeedah'], ['kitab at tawheed', 'Aqeedah'], ['rububiyyah', 'Aqeedah'], ['uluhiyyah', 'Aqeedah'],
    ['arabic', 'Arabic Language'], ['nahw', 'Arabic Language'], ['sarf', 'Arabic Language'], ['grammar', 'Arabic Language'], ['ajrumiyyah', 'Arabic Language'], ['ajurrumiyyah', 'Arabic Language'],
    ['manhaj', 'Manhaj'], ['salaf', 'Manhaj'], ['salim', 'Manhaj'],
    ['adab', 'Adab'], ['akhlaq', 'Adab'], ['manners', 'Adab'], ['character', 'Adab'], ['sincerity', 'Adab'], ['ikhlas', 'Adab'], ['niyyah', 'Adab'], ['intention', 'Adab'],
    ['dawah', "Da'wah"], ['da\'wah', "Da'wah"],
    ['khutbah', 'Khutbah'], ['khutba', 'Khutbah'], ['sermon', 'Khutbah'],
    ['ramadan', 'Ramadan Series'], ['ramadhan', 'Ramadan Series'],
    ['qa', 'Questions & Answers'], ['q&a', 'Questions & Answers'], ['question', 'Questions & Answers'], ['fatwa', 'Questions & Answers'], ['answers', 'Questions & Answers'],
    ['general', 'General Lectures'], ['lecture', 'General Lectures'],
  ];

  for (const [keyword, category] of categoryKeywords) {
    if (n.includes(keyword)) return category;
  }

  return 'General Lectures';
}

function prettyTitle(filename: string): string {
  return path.basename(filename, path.extname(filename))
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function sanitizeFilename(original: string): string {
  const ext = path.extname(original).toLowerCase();
  const base = path.basename(original, ext)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (base || 'upload') + ext;
}

function computeFileHash(filepath: string): string {
  try {
    return crypto.createHash('sha256').update(fs.readFileSync(filepath)).digest('hex');
  } catch {
    return '';
  }
}

async function getSheikhTeacherId(): Promise<number | null> {
  return null;
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

router.post('/', (req: AuthRequest, res: Response) => {
  upload.array('files', 200)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const results: any[] = [];
    const defaultLanguage = (req.body.language as string) || 'en';
    const defaultFeatured = req.body.featured === 'true';
    const duplicateAction = (req.body.duplicateAction as string) || 'skip';

    for (const file of files) {
      try {
        const relativePath = file.path.replace(/\\/g, '/').split('uploads/')[1];
        const fileUrl = '/uploads/' + relativePath;
        const ext = path.extname(file.originalname).toLowerCase();

        // Detect type from extension first, fallback to MIME map
        const extDetect = detectTypeFromExt(ext);
        let subdir = extDetect?.subdir || MIME_MAP[file.mimetype] || 'images';
        let typeLabel = extDetect?.typeLabel || (subdir === 'pdfs' ? 'pdf' : subdir === 'audio' ? 'audio' : subdir === 'videos' ? 'video' : 'image');
        let resourceType = extDetect?.resourceType || (subdir === 'pdfs' ? 'PDF' : subdir === 'audio' ? 'AUDIO' : subdir === 'videos' ? 'VIDEO' : 'IMAGE');

        // Ensure file lands in correct subdirectory
        const correctDir = path.join(uploadDir, subdir);
        if (file.destination !== correctDir) {
          const destPath = path.join(correctDir, path.basename(file.path));
          if (!fs.existsSync(correctDir)) fs.mkdirSync(correctDir, { recursive: true });
          try { fs.copyFileSync(file.path, destPath); fs.unlinkSync(file.path); } catch {}
        }

        const title = (req.body[`title_${file.fieldname}_${files.indexOf(file)}`] as string) || prettyTitle(file.originalname);
        const category = detectCategory(file.originalname);
        const language = (req.body[`language_${file.fieldname}_${files.indexOf(file)}`] as string) || defaultLanguage;

        // Smart collection detection: from per-file param, folder path, or filename
        const perFileCollection = req.body[`collection_${file.fieldname}_${files.indexOf(file)}`] as string | undefined;
        const folderName = file.originalname.includes('/') ? file.originalname.split('/')[0] : '';
        const folderCollection = folderName ? deriveCollection(folderName) : null;
        const derivedFromFilename = deriveCollection(file.originalname);
        const collection = perFileCollection || folderCollection || derivedFromFilename || null;

        // Per-type size validation
        if (resourceType === 'IMAGE' && file.size > 50 * 1024 * 1024) {
          results.push({ file: file.originalname, url: fileUrl, status: 'error', message: 'Image exceeds 50MB limit' });
          try { fs.unlinkSync(file.path); } catch {}
          continue;
        }
        if (resourceType === 'PDF' && file.size > 500 * 1024 * 1024) {
          results.push({ file: file.originalname, url: fileUrl, status: 'error', message: 'PDF exceeds 500MB limit' });
          try { fs.unlinkSync(file.path); } catch {}
          continue;
        }
        if ((resourceType === 'AUDIO') && file.size > 500 * 1024 * 1024) {
          results.push({ file: file.originalname, url: fileUrl, status: 'error', message: 'Audio exceeds 500MB limit' });
          try { fs.unlinkSync(file.path); } catch {}
          continue;
        }

        // Compute file hash for dedup
        const fileHash = computeFileHash(file.path);

        // Duplicate detection: by fileUrl, fileHash, or matching title+filename
        const existing = await prisma.resource.findFirst({
          where: {
            OR: [
              { fileUrl },
              ...(fileHash ? [{ fileHash }] : []),
              { AND: [
                { title: { equals: title } },
                { fileUrl: { contains: sanitizeFilename(file.originalname).replace(/\.[^.]+$/, '') } },
              ]},
            ],
          },
        });

        if (existing) {
          if (duplicateAction === 'skip') {
            results.push({
              file: file.originalname,
              url: fileUrl,
              status: 'skipped',
              message: 'Duplicate detected',
            });
            try { fs.unlinkSync(file.path); } catch {}
            continue;
          }
          if (duplicateAction === 'replace') {
            await prisma.resource.update({
              where: { id: existing.id },
              data: { title, category, collection, language, resourceType: resourceType as any, fileType: typeLabel, fileHash: fileHash || existing.fileHash, featured: defaultFeatured, updatedAt: new Date() },
            });
            results.push({ file: file.originalname, url: fileUrl, status: 'replaced' });
            try { fs.unlinkSync(file.path); } catch {}
            continue;
          }
          if (duplicateAction === 'rename') {
            const timestamp = Date.now();
            const renamedTitle = `${title} (${timestamp})`;
            const resource = await prisma.resource.create({
              data: {
                title: renamedTitle,
                fileUrl,
                fileHash: fileHash || null,
                fileType: typeLabel,
                resourceType: resourceType as any,
                category,
                collection,
                language,
                featured: defaultFeatured,
                downloads: 0,
                views: 0,
              },
            });
            results.push({
              id: resource.id,
              file: file.originalname,
              title: renamedTitle,
              url: fileUrl,
              size: file.size,
              type: typeLabel,
              resourceType,
              category,
              collection,
              language,
              status: 'created',
              message: 'Created as renamed copy',
            });
            continue;
          }
        }

          const resource = await prisma.resource.create({
            data: {
              title,
              fileUrl,
              fileHash: fileHash || null,
              fileType: typeLabel,
              resourceType: resourceType as any,
              category,
              collection,
              language,
              featured: defaultFeatured,
              downloads: 0,
              views: 0,
          },
        });

        results.push({
          id: resource.id,
          file: file.originalname,
          title,
          url: fileUrl,
          size: file.size,
          type: typeLabel,
          resourceType,
          category,
          collection,
          language,
          status: 'created',
        });
      } catch (err) {
        console.error('Import error for file:', file.originalname, err);
        results.push({ file: file.originalname, status: 'error', message: 'Failed to process file' });
      }
    }

    res.json({
      total: files.length,
      imported: results.filter(r => r.status === 'created').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      replaced: results.filter(r => r.status === 'replaced').length,
      errors: results.filter(r => r.status === 'error').length,
      results,
    });
  });
});

router.get('/categories', async (_req: AuthRequest, res: Response) => {
  const counts = await Promise.all(
    RESOURCE_CATEGORIES.map(async (cat) => {
      const [audio, video, pdfs, recordings, images] = await Promise.all([
        prisma.resource.count({ where: { category: cat, resourceType: 'AUDIO' } }),
        prisma.resource.count({ where: { category: cat, resourceType: 'VIDEO', fileType: { not: 'recording' } } }),
        prisma.resource.count({ where: { category: cat, resourceType: 'PDF' } }),
        prisma.resource.count({ where: { category: cat, resourceType: 'VIDEO', fileType: 'recording' } }),
        prisma.resource.count({ where: { category: cat, resourceType: 'IMAGE' } }),
      ]);
      return { name: cat, slug: cat.toLowerCase().replace(/\s+/g, '-').replace(/'/g, ''), audio, video, pdfs, recordings, images, total: audio + video + pdfs + recordings + images };
    })
  );
  res.json(counts);
});

router.post('/scan-folder', async (req: AuthRequest, res: Response) => {
  try {
    const language = (req.body.language as string) || 'en';
    const featured = req.body.featured === 'true';
    const duplicateAction = (req.body.duplicateAction as string) || 'skip';
    const results: any[] = [];

    const subdirs = ['audio', 'videos', 'pdfs', 'images'];
    for (const sub of subdirs) {
      const dir = path.join(uploadDir, sub);
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
      for (const file of files) {
        const fileUrl = `/uploads/${sub}/${file}`;
        const ext = path.extname(file).toLowerCase();

        const extDetect = detectTypeFromExt(ext);
        let resourceType: string;
        if (extDetect) {
          resourceType = extDetect.resourceType;
        } else {
          if (sub === 'pdfs') resourceType = 'PDF';
          else if (sub === 'audio') resourceType = 'AUDIO';
          else if (sub === 'videos') {
            resourceType = ['mp4', 'mov', 'mkv'].includes(ext.replace('.', '')) ? 'VIDEO' : 'AUDIO';
          } else resourceType = 'IMAGE';
        }

        const filePath = path.join(dir, file);
        const fileHash = computeFileHash(filePath);

        const existing = await prisma.resource.findFirst({
          where: {
            OR: [
              { fileUrl },
              ...(fileHash ? [{ fileHash }] : []),
            ],
          },
        });
        if (existing) {
          if (duplicateAction === 'skip') {
            results.push({ file, url: fileUrl, status: 'skipped' });
            continue;
          }
          if (duplicateAction === 'replace') {
            await prisma.resource.update({
              where: { id: existing.id },
              data: {
                title: prettyTitle(file),
                category: detectCategory(file),
                resourceType: resourceType as any,
                fileType: sub === 'pdfs' ? 'pdf' : sub === 'audio' ? 'audio' : sub === 'videos' ? 'video' : 'image',
                language,
                featured,
                fileHash: fileHash || existing.fileHash,
                updatedAt: new Date(),
              },
            });
            results.push({ file, url: fileUrl, status: 'replaced' });
            continue;
          }
          if (duplicateAction === 'rename') {
            const timestamp = Date.now();
            const renamedTitle = `${prettyTitle(file)} (${timestamp})`;
            await prisma.resource.create({
              data: {
                title: renamedTitle,
                fileUrl,
                fileHash: fileHash || null,
                fileType: sub === 'pdfs' ? 'pdf' : sub === 'audio' ? 'audio' : sub === 'videos' ? 'video' : 'image',
                resourceType: resourceType as any,
                category: detectCategory(file),
                language,
                featured,
              },
            });
            results.push({ file, url: fileUrl, status: 'created', message: 'Created as renamed copy' });
            continue;
          }
        }

        const title = prettyTitle(file);
        const category = detectCategory(file);
        let fileSize = 0;
        try { fileSize = fs.statSync(filePath).size; } catch {}
        await prisma.resource.create({
          data: {
            title,
            fileUrl,
            fileHash: fileHash || null,
            fileType: sub === 'pdfs' ? 'pdf' : sub === 'audio' ? 'audio' : sub === 'videos' ? 'video' : 'image',
            resourceType: resourceType as any,
            category,
            language,
            featured,
          },
        });
        results.push({ file, title, url: fileUrl, category, resourceType, status: 'created' });
      }
    }

    res.json({ total: results.length, imported: results.filter(r => r.status === 'created').length, skipped: results.filter(r => r.status === 'skipped').length, replaced: results.filter(r => r.status === 'replaced').length, errors: results.filter(r => r.status === 'error').length, results });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Failed to scan folder' });
  }
});

export default router;
