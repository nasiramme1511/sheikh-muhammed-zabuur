const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.resolve(__dirname, '../public');
const sheikhPhotoPath = path.join(publicDir, 'images/sheikh-zabuur.jpg');

function readSVG(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

async function generatePNG(svgPath, outputPath, size) {
  const svg = readSVG(svgPath);
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`Generated ${path.basename(outputPath)}`);
}

async function run() {
  if (!fs.existsSync(sheikhPhotoPath)) {
    throw new Error(`Sheikh photo not found at: ${sheikhPhotoPath}`);
  }

  const imageBase64 = fs.readFileSync(sheikhPhotoPath, 'base64');
  const sizes = [48, 96, 180, 192, 512];

  // 1. Generate PNG icons from favicon SVG
  console.log('Generating PWA icons...');
  const faviconSVGPath = path.join(publicDir, 'favicon.svg');
  for (const size of sizes) {
    await sharp(faviconSVGPath)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Apple touch icon
  await sharp(faviconSVGPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 2. Generate OG image with photo
  console.log('Generating og-image.svg...');
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="60%" stop-color="#064E4A"/>
      <stop offset="100%" stop-color="#042F2E"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="40%" stop-color="#D4A017"/>
      <stop offset="100%" stop-color="#B8941E"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <filter id="shadowSmall">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <clipPath id="photoClip">
      <circle cx="210" cy="315" r="170"/>
    </clipPath>
    <style>
      <![CDATA[
      @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@700&family=Poppins:wght@400;600;700;800&display=swap');
      .ar { font-family: 'Noto Kufi Arabic', 'Traditional Arabic', sans-serif; font-weight: 700; }
      .en-title { font-family: 'Poppins', system-ui, sans-serif; font-weight: 800; }
      .en-sub { font-family: 'Poppins', system-ui, sans-serif; font-weight: 600; }
      .en-tag { font-family: 'Poppins', system-ui, sans-serif; font-weight: 400; }
      ]]>
    </style>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Geometric background pattern - subtle grid -->
  <g opacity="0.03" fill="none" stroke="#FFFFFF" stroke-width="1">
    <line x1="0" y1="0" x2="1200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
  </g>

  <!-- Large geometric letter 'ز' in background -->
  <g opacity="0.05" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round">
    <path d="M 800 130 Q 920 115, 1040 130 C 1065 134, 1070 150, 1060 170 Q 1035 220, 990 280 Q 960 325, 930 365"/>
    <polygon points="825,55 860,85 825,115 790,85" fill="#FFFFFF"/>
  </g>

  <!-- Concentric circles (study circle reference) -->
  <circle cx="210" cy="315" r="195" fill="none" stroke="url(#gold)" stroke-width="1" opacity="0.15"/>
  <circle cx="210" cy="315" r="188" fill="none" stroke="url(#gold)" stroke-width="0.5" opacity="0.08"/>

  <!-- Left Side: Sheikh Photo in Circular Badge -->
  <g filter="url(#shadow)">
    <circle cx="210" cy="315" r="180" fill="url(#gold)"/>
    <circle cx="210" cy="315" r="170" fill="#064E4A"/>
    <g clip-path="url(#photoClip)">
      <image href="data:image/jpeg;base64,${imageBase64}" x="40" y="145" width="340" height="340" preserveAspectRatio="xMidYMid slice"/>
    </g>
  </g>

  <!-- ز Badge on photo corner -->
  <g transform="translate(330, 420)" filter="url(#shadowSmall)">
    <circle cx="0" cy="0" r="45" fill="url(#bg)" stroke="url(#gold)" stroke-width="3"/>
    <path d="M -18 -20 Q -2 -22, 14 -18 C 18 -16, 19 -10, 16 -2 Q 10 12, 0 24" fill="none" stroke="url(#gold)" stroke-width="6" stroke-linecap="round"/>
    <polygon points="-2,-38 10,-28 -2,-18 -14,-28" fill="url(#gold)"/>
  </g>

  <!-- Right Side: Brand Typography -->
  <g filter="url(#shadow)">
    <!-- Arabic name -->
    <text x="440" y="210" class="ar" font-size="28" fill="url(#gold)" letter-spacing="1">الشيخ محمد زبور</text>
    
    <!-- English name -->
    <text x="440" y="275" class="en-title" font-size="64" fill="#FFFFFF" letter-spacing="-1">Sheikh Mohammed</text>
    <text x="440" y="350" class="en-title" font-size="64" fill="url(#gold)" letter-spacing="-1">Zabuur</text>
    
    <!-- Divider -->
    <line x1="440" y1="390" x2="900" y2="390" stroke="url(#gold)" stroke-width="2" opacity="0.25"/>
    
    <!-- Tagline -->
    <text x="440" y="430" class="en-tag" font-size="22" fill="rgba(255,255,255,0.5)" letter-spacing="5">AUTHENTIC ISLAMIC LESSONS</text>
    
    <!-- Features list -->
    <text x="440" y="485" class="en-tag" font-size="16" fill="rgba(255,255,255,0.3)" letter-spacing="2">Live Stream · Audio &amp; Video Library · Study Series</text>
    <text x="440" y="515" class="en-tag" font-size="16" fill="rgba(255,255,255,0.3)" letter-spacing="2">Resource Library · Telegram Community · PWA</text>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="580" width="1200" height="50" fill="rgba(0,0,0,0.2)"/>
  <text x="600" y="610" class="en-tag" font-size="14" fill="rgba(255,255,255,0.25)" text-anchor="middle" letter-spacing="4">SHEIKHMOHAMMEDZABUUR.COM</text>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogSvg, 'utf-8');
  console.log('Generated og-image.svg');

  // Generate og-image.png from SVG
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png');

  console.log('\nAll brand assets generated successfully!');
  console.log('Assets created:');
  console.log('  SVG: favicon.svg, icon-maskable.svg, logo.svg, logo-dark.svg, logo-light.svg');
  console.log('  SVG: og-image.svg, splash-screen.svg, social-avatar.svg');
  console.log('  PNG: icon-{48,96,180,192,512}.png, apple-touch-icon.png, og-image.png');
}

run().catch(err => {
  console.error('Asset Generation Error:', err);
  process.exit(1);
});
