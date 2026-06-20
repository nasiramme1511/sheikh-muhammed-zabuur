/**
 * Production database URL migrator.
 *
 * Connects to production MySQL (TiDB), maps old /uploads/... URLs to
 * Cloudinary secure_urls, and updates the database.
 *
 * Usage:  node server/migrate-prod-db.js
 * Safety: Uses transactions, idempotent, logs everything.
 */

const cloudinary = require('cloudinary').v2;
const mysql = require('mysql2/promise');
const path = require('path');

// ── Config ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: 'dfp4ixzd8',
  api_key: '828277343917588',
  api_secret: '9glW6_WXLq4w4MrncfcEKXllkWY',
});

// TiDB via Render — SSL required
const DB_CONFIG = {
  host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
  port: 4000,
  user: '4AFdTa7LG5JaUHa.root',
  password: 'bqXiNo3H2Z4RfvX0',
  database: 'islamic_online_learning',
  ssl: {
    rejectUnauthorized: false,
  },
};

// ── Helpers ─────────────────────────────────────────────────────────

/** Compute a match key from a filename so we can pair DB rows ↔ Cloudinary assets. */
function makeKey(filename) {
  // filename: "riyada-0150.mp3.mp3" or "roomaa-xiqqoo-masjid.jpg"
  // or "riyada-0021-2-.mp3.mp3" (note the trailing dash-dot)
  const ext = path.extname(filename); // last extension
  const withoutExt = filename.slice(0, -ext.length); // "riyada-0150.mp3" or "riyada-0021-2-.mp3"
  // Replace dots with dashes then collapse double dashes
  return withoutExt.replace(/\./g, '-').replace(/--+/g, '-').replace(/-$/g, '').toLowerCase();
}

function makeCloudinaryKey(publicId) {
  // publicId: "islamic-online/audio/riyada-0150-mp3-44f8f9"
  const basename = publicId.split('/').pop(); // "riyada-0150-mp3-44f8f9"
  // Strip trailing random suffix (-XXXXXX where X=hex)
  return basename.replace(/-[0-9a-f]{6}$/, '').toLowerCase();
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  // 1. Fetch all Cloudinary resources and build lookup map
  console.log('Fetching Cloudinary resource list…');
  const allCloud = [];
  for (const resourceType of ['image', 'video']) {
    let next = null;
    do {
      const res = await cloudinary.api.resources({
        type: 'upload',
        resource_type: resourceType,
        prefix: 'islamic-online/',
        max_results: 100,
        next_cursor: next,
      });
      allCloud.push(...res.resources);
      next = res.next_cursor;
    } while (next);
  }

  // Build map: derivedKey → secure_url
  const cloudMap = new Map();
  for (const r of allCloud) {
    const key = makeCloudinaryKey(r.public_id);
    // Avoid overwriting with test files if there's a duplicate key
    if (!cloudMap.has(key) || !r.public_id.includes('test-')) {
      cloudMap.set(key, r.secure_url);
    }
  }

  // Also index by full public_id (for images with timestamps)
  for (const r of allCloud) {
    const basename = r.public_id.split('/').pop();
    cloudMap.set(basename.toLowerCase(), r.secure_url);
  }

  console.log(`  → ${allCloud.length} Cloudinary resources indexed`);

  // 2. Connect to production database
  console.log('Connecting to production database…');
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('  → Connected');

  try {
    // 3. Fetch records needing migration
    const [rows] = await conn.execute(
      "SELECT id, fileUrl, resourceType FROM Resource WHERE fileUrl LIKE '/uploads/%'"
    );
    console.log(`  → ${rows.length} records with local URLs found\n`);

    if (rows.length === 0) {
      console.log('Nothing to migrate. Exiting.');
      return;
    }

    // 4. Process each record
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const failures = [];

    for (const row of rows) {
      const oldUrl = row.fileUrl;
      const filename = path.basename(oldUrl); // e.g. "riyada-0150.mp3.mp3"
      const key = makeKey(filename);

      let cloudUrl = cloudMap.get(key);

      // Try exact basename match (for images with numeric suffixes)
      if (!cloudUrl) {
        cloudUrl = cloudMap.get(filename.replace(/\.[^.]+$/, '').toLowerCase());
      }

      if (!cloudUrl) {
        console.log(`  [SKIP] ID ${row.id} — no Cloudinary match for "${filename}" (key: "${key}")`);
        skipped++;
        failures.push({ id: row.id, url: oldUrl, reason: 'No Cloudinary match' });
        continue;
      }

      // 5. Update database
      await conn.execute(
        'UPDATE Resource SET fileUrl = ? WHERE id = ?',
        [cloudUrl, row.id]
      );

      console.log(`  [OK]   ID ${row.id}  ${oldUrl.substring(0, 50).padEnd(52)} → ${cloudUrl.substring(0, 60)}`);
      updated++;
    }

    // 6. Verify
    const [remaining] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM Resource WHERE fileUrl LIKE '/uploads/%'"
    );
    const [cloudCount] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM Resource WHERE fileUrl LIKE 'https://res.cloudinary.com/%'"
    );
    const [total] = await conn.execute('SELECT COUNT(*) AS cnt FROM Resource');

    console.log('\n' + '═'.repeat(70));
    console.log('  MIGRATION REPORT');
    console.log('  Total records scanned: ' + rows.length);
    console.log('  Records updated:       ' + updated);
    console.log('  Records skipped:       ' + skipped);
    console.log('  Failures:              ' + failed);
    console.log('');
    console.log('  VERIFICATION:');
    console.log('  Total in table:        ' + total[0].cnt);
    console.log('  Remaining /uploads/:   ' + remaining[0].cnt);
    console.log('  Cloudinary URLs:       ' + cloudCount[0].cnt);

    if (failures.length > 0) {
      console.log('\n  SKIPPED RECORDS:');
      for (const f of failures) {
        console.log(`    ID ${f.id}: ${f.reason} — ${f.url}`);
      }
    }

    // 7. Test a playback URL
    if (updated > 0) {
      const https = require('https');
      const [sample] = await conn.execute(
        "SELECT fileUrl FROM Resource WHERE fileUrl LIKE 'https://res.cloudinary.com/%' AND resourceType = 'AUDIO' LIMIT 1"
      );
      if (sample.length > 0) {
        const testUrl = sample[0].fileUrl;
        console.log('\n  PLAYBACK TEST:');
        try {
          const result = await new Promise((resolve, reject) => {
            const req = https.get(testUrl, { timeout: 10000 }, (res) => {
              resolve({ status: res.statusCode, contentType: res.headers['content-type'] });
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
          });
          console.log(`    ${testUrl.substring(0, 80)}`);
          console.log(`    → ${result.status} ${result.contentType}`);
          console.log('    ✓ Audio playback URL works');
        } catch (e) {
          console.log('    ✗ Verification request failed: ' + e.message);
        }
      }
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
