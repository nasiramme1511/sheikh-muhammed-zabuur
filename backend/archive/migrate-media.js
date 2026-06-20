/**
 * One-time media migration script
 *
 * Migrates all existing local media files to Cloudinary and updates DB records.
 * Safe, idempotent, runnable multiple times.
 *
 * Usage:
 *   node server/migrate-media.js             # real migration
 *   node server/migrate-media.js --dry-run   # preview only, no changes
 *
 * Set these env vars or edit below:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ── Config ─────────────────────────────────────────────────────────
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dfp4ixzd8';
const API_KEY = process.env.CLOUDINARY_API_KEY || '828277343917588';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '9glW6_WXLq4w4MrncfcEKXllkWY';
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DRY_RUN = process.argv.includes('--dry-run');

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

const prisma = new PrismaClient();

// ── Helpers ─────────────────────────────────────────────────────────

function detectResourceType(resourceType, ext) {
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.ogv'];

  // Trust the DB resourceType first
  if (resourceType === 'IMAGE') return 'image';
  if (resourceType === 'PDF') return 'raw';
  if (resourceType === 'AUDIO') return 'video'; // Cloudinary audio = video resource
  if (resourceType === 'VIDEO') return 'video';

  // Fallback to extension detection
  if (imageExts.includes(ext)) return 'image';
  if (audioExts.includes(ext)) return 'video';
  if (videoExts.includes(ext)) return 'video';
  return 'raw';
}

function detectSubdir(resourceType, ext) {
  if (resourceType === 'IMAGE') return 'images';
  if (resourceType === 'PDF') return 'pdfs';
  if (resourceType === 'AUDIO') return 'audio';
  if (resourceType === 'VIDEO') return 'videos';

  const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.ogv'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const pdfExts = ['.pdf'];
  if (pdfExts.includes(ext)) return 'pdfs';
  if (audioExts.includes(ext)) return 'audio';
  if (videoExts.includes(ext)) return 'videos';
  if (imageExts.includes(ext)) return 'images';
  return 'images';
}

function isCloudUrl(url) {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('═'.repeat(70));
  console.log('  MEDIA MIGRATION SCRIPT');
  console.log(`  Mode: ${DRY_RUN ? 'DRY-RUN (no changes)' : 'LIVE'}`);
  console.log(`  Cloudinary: ${CLOUD_NAME}`);
  console.log(`  Upload directory: ${UPLOAD_DIR}`);
  console.log('═'.repeat(70));
  console.log('');

  // 1. Fetch all records with local file URLs
  const resources = await prisma.resource.findMany({
    where: { fileUrl: { startsWith: '/uploads/' } },
    orderBy: { id: 'asc' },
  });

  if (resources.length === 0) {
    console.log('No local media records found. Nothing to migrate.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${resources.length} records with local URLs.\n`);

  // 2. Process each record
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (const record of resources) {
    const relPath = record.fileUrl.replace('/uploads/', '');
    const absPath = path.join(UPLOAD_DIR, relPath);
    const ext = path.extname(record.fileUrl).toLowerCase();
    const fileName = path.basename(absPath);
    const resourceType = detectResourceType(record.resourceType, ext);
    const subdir = detectSubdir(record.resourceType, ext);

    // Check file exists
    if (!fs.existsSync(absPath)) {
      console.log(`  [SKIP] ID ${record.id} — File not found on disk: ${absPath}`);
      skipped++;
      continue;
    }

    const stat = fs.statSync(absPath);
    const originalUrl = record.fileUrl;

    // Generate a clean public_id
    const baseName = path.basename(fileName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const publicId = `${baseName}-${randomSuffix}`;

    console.log(`  [${String(record.id).padEnd(4)}] ${fileName.substring(0, 50).padEnd(52)} ${formatBytes(stat.size).padEnd(10)} → ${subdir}/`);

    if (DRY_RUN) {
      console.log(`         Would upload as: ${resourceType} → islamic-online/${subdir}/${publicId}${ext}`);
      console.log(`         Would update DB: fileUrl = https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/islamic-online/${subdir}/${publicId}${ext}`);
      migrated++;
      continue;
    }

    // 3. Upload to Cloudinary
    try {
      const uploadResult = await cloudinary.uploader.upload(absPath, {
        public_id: publicId,
        resource_type: resourceType,
        folder: `islamic-online/${subdir}`,
      });

      const cloudUrl = uploadResult.secure_url;
      console.log(`         ✓ Uploaded: ${cloudUrl}`);

      // 4. Update database record
      await prisma.resource.update({
        where: { id: record.id },
        data: { fileUrl: cloudUrl },
      });

      console.log(`         ✓ DB updated: ID ${record.id}`);
      migrated++;
    } catch (err) {
      console.log(`         ✗ FAILED: ${err.message || err}`);
      failed++;
      failures.push({ id: record.id, title: record.title, error: err.message });
    }
  }

  // 5. Summary
  const elapsed = Date.now() - startTime;
  console.log('');
  console.log('═'.repeat(70));
  console.log('  MIGRATION SUMMARY');
  console.log(`  Total records:     ${resources.length}`);
  console.log(`  Migrated:          ${migrated}`);
  console.log(`  Skipped:           ${skipped}`);
  console.log(`  Failed:            ${failed}`);
  console.log(`  Duration:          ${formatDuration(elapsed)}`);

  if (failures.length > 0) {
    console.log('');
    console.log('  FAILURES:');
    for (const f of failures) {
      console.log(`    ID ${f.id} (${f.title}): ${f.error}`);
    }
  }

  if (DRY_RUN) {
    console.log('');
    console.log('  ⚠ This was a DRY RUN. No files were uploaded and no DB records were changed.');
    console.log('  Run without --dry-run to execute the migration.');
  }

  // 6. Verification (only on live run with successes)
  if (!DRY_RUN && migrated > 0) {
    console.log('');
    console.log('═'.repeat(70));
    console.log('  VERIFICATION (checking migrated URLs)');
    console.log('');

    const migratedRecords = await prisma.resource.findMany({
      where: {
        fileUrl: { startsWith: 'https://res.cloudinary.com/' },
      },
      orderBy: { id: 'desc' },
    });

    let verified = 0;
    let verifyFailed = 0;
    const https = require('https');

    for (const record of migratedRecords) {
      try {
        const url = new URL(record.fileUrl);
        const result = await new Promise((resolve, reject) => {
          const req = https.get(record.fileUrl, { timeout: 10000 }, (res) => {
            resolve({ status: res.statusCode, contentType: res.headers['content-type'] });
          });
          req.on('error', reject);
          req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        });
        console.log(`  ID ${String(record.id).padEnd(4)} ✓ ${result.status} ${result.contentType || ''}`);
        verified++;
      } catch (err) {
        console.log(`  ID ${String(record.id).padEnd(4)} ✗ ${err.message}`);
        verifyFailed++;
      }
    }

    console.log('');
    console.log(`  Verified: ${verified}, Failed: ${verifyFailed}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Migration script failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
