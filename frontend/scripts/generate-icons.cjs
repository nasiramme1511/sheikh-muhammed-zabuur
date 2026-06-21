const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.resolve(__dirname, '../public');

const sizes = [48, 96, 180, 192, 512];

async function generate() {
  // Generate icons from favicon SVG
  const svgPath = path.join(publicDir, 'favicon.svg');
  if (!fs.existsSync(svgPath)) throw new Error('favicon.svg not found');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  for (const size of sizes) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Generate OG image PNG
  const ogSvgPath = path.join(publicDir, 'og-image.svg');
  if (fs.existsSync(ogSvgPath)) {
    const ogSvg = fs.readFileSync(ogSvgPath, 'utf-8');
    await sharp(Buffer.from(ogSvg))
      .resize(1200, 630)
      .png()
      .toFile(path.join(publicDir, 'og-image.png'));
    console.log('Generated og-image.png');
  }

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
