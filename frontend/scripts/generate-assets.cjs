const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.resolve(__dirname, '../public');
const sheikhPhotoPath = path.join(publicDir, 'images/sheikh-zabuur.jpg');

async function run() {
  if (!fs.existsSync(sheikhPhotoPath)) {
    throw new Error(`Sheikh photo not found at: ${sheikhPhotoPath}`);
  }

  console.log('Reading and encoding Sheikh photo...');
  const imageBase64 = fs.readFileSync(sheikhPhotoPath, 'base64');

  // 1. Generate favicon.svg
  console.log('Generating favicon.svg...');
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#0D5E57"/>
    </linearGradient>
    <!-- Gold Gradient -->
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="40%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#B8941E"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
    <!-- Circular clip path for Sheikh's photo -->
    <clipPath id="circleClip">
      <circle cx="256" cy="230" r="150" />
    </clipPath>
  </defs>

  <!-- Base Card Background -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  
  <!-- Outer Gold Border -->
  <rect x="16" y="16" width="480" height="480" rx="94" fill="none" stroke="url(#gold)" stroke-width="4" opacity="0.5"/>
  <rect x="26" y="26" width="460" height="460" rx="84" fill="none" stroke="url(#gold)" stroke-width="1.5" opacity="0.2"/>

  <!-- Sheikh Photo with Circular Border -->
  <g filter="url(#shadow)">
    <!-- Photo circular frame background -->
    <circle cx="256" cy="230" r="156" fill="url(#gold)"/>
    <!-- Photo container -->
    <circle cx="256" cy="230" r="150" fill="#115E59"/>
    <g clip-path="url(#circleClip)">
      <image href="data:image/jpeg;base64,${imageBase64}" x="106" y="80" width="300" height="300" preserveAspectRatio="xMidYMid slice"/>
    </g>
  </g>

  <!-- Arabic letter 'ز' Badge overlaying bottom right of photo -->
  <g transform="translate(370, 340)" filter="url(#shadow)">
    <circle cx="0" cy="0" r="50" fill="url(#bgGrad)" stroke="url(#gold)" stroke-width="3"/>
    <path d="M -20 -22 
             Q -2 -24, 15 -22 
             Q 22 -21, 20 -12 
             Q 17 2, 11 12 
             Q 5 20, 0 30"
          fill="none" stroke="url(#gold)" stroke-width="8" stroke-linecap="round"/>
    <circle cx="-1" cy="42" r="4.5" fill="url(#gold)"/>
  </g>

  <!-- Sheikh Name Text "Sh. Zabuur" styled with better design -->
  <g filter="url(#shadow)">
    <text x="256" y="445" font-family="'Poppins', sans-serif" font-weight="800" font-size="34" fill="url(#gold)" text-anchor="middle" letter-spacing="1">SH. ZABUUR</text>
    <text x="256" y="480" font-family="'Poppins', sans-serif" font-weight="600" font-size="14" fill="#ffffff" opacity="0.6" text-anchor="middle" letter-spacing="4">SH. MOHAMMED ZABUUR PLATFORM</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg, 'utf-8');

  // 2. Generate logo.svg
  console.log('Generating logo.svg...');
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 160" fill="none">
  <defs>
    <!-- Background Gradient for Badge -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#0D5E57"/>
    </linearGradient>
    <!-- Gold Gradient -->
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="40%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#B8941E"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
    <clipPath id="badgeClip">
      <circle cx="80" cy="80" r="54" />
    </clipPath>
  </defs>

  <!-- Left Icon Badge -->
  <!-- Outer Ring -->
  <circle cx="80" cy="80" r="64" fill="url(#bgGrad)" stroke="url(#gold)" stroke-width="2.5" filter="url(#shadow)"/>
  <!-- Image container -->
  <circle cx="80" cy="80" r="56" fill="url(#gold)"/>
  <g clip-path="url(#badgeClip)">
    <image href="data:image/jpeg;base64,${imageBase64}" x="26" y="26" width="108" height="108" preserveAspectRatio="xMidYMid slice"/>
  </g>

  <!-- Mini Arabic 'ز' badge overlay on the badge -->
  <g transform="translate(120, 115)" filter="url(#shadow)">
    <circle cx="0" cy="0" r="18" fill="url(#bgGrad)" stroke="url(#gold)" stroke-width="1.5"/>
    <path d="M -7 -8 
             Q -1 -9, 5 -8 
             Q 8 -7, 7 -4 
             Q 6 1, 4 4 
             Q 2 7, 0 11"
          fill="none" stroke="url(#gold)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="0" cy="15" r="1.5" fill="url(#gold)"/>
  </g>

  <!-- Right Side Typography -->
  <!-- Main Title -->
  <text x="170" y="58" font-family="'Poppins', sans-serif" font-weight="800" font-size="28" fill="white" dominant-baseline="central" letter-spacing="-0.3">Sheikh Mohammed</text>
  <text x="170" y="95" font-family="'Poppins', sans-serif" font-weight="800" font-size="28" fill="url(#gold)" dominant-baseline="central" letter-spacing="-0.3">Zabuur</text>

  <!-- Subtitle -->
  <text x="170" y="128" font-family="'Poppins', sans-serif" font-weight="600" font-size="12" fill="rgba(255,255,255,0.5)" dominant-baseline="central" letter-spacing="3.5">SH. MOHAMMED ZABUUR PLATFORM</text>

  <!-- Decorative Divider Line -->
  <line x1="170" y1="112" x2="480" y2="112" stroke="url(#gold)" stroke-width="1.5" opacity="0.25"/>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg, 'utf-8');

  // 3. Generate og-image.svg
  console.log('Generating og-image.svg...');
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="60%" stop-color="#0D5E57"/>
      <stop offset="100%" stop-color="#0A4D47"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="40%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#B8941E"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <clipPath id="photoClip">
      <circle cx="210" cy="315" r="170"/>
    </clipPath>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Star Pattern (faint geometric background) -->
  <g opacity="0.04" fill="none" stroke="white" stroke-width="1.5">
    <polygon points="600,100 680,230 820,230 710,320 740,460 600,370 460,460 490,320 380,230 520,230"/>
  </g>

  <!-- Large Arabic Letter 'ز' in Background -->
  <g opacity="0.04" fill="none" stroke="white" stroke-width="25" stroke-linecap="round">
    <path d="M 850 150 Q 920 145, 1020 148 Q 1045 150, 1040 180 Q 1030 235, 995 275 Q 965 310, 950 355"/>
    <circle cx="948" cy="410" r="10" fill="white"/>
  </g>

  <!-- Left Side: Circular Sheikh Badge -->
  <g filter="url(#shadow)">
    <!-- Gold Frame -->
    <circle cx="210" cy="315" r="180" fill="url(#gold)"/>
    <circle cx="210" cy="315" r="170" fill="#115E59"/>
    <!-- Clipped Image -->
    <g clip-path="url(#photoClip)">
      <image href="data:image/jpeg;base64,${imageBase64}" x="40" y="145" width="340" height="340" preserveAspectRatio="xMidYMid slice"/>
    </g>
  </g>

  <!-- Mini Arabic 'ز' badge overlay on sheikh photo -->
  <g transform="translate(330, 420)" filter="url(#shadow)">
    <circle cx="0" cy="0" r="45" fill="url(#bg)" stroke="url(#gold)" stroke-width="3"/>
    <path d="M -18 -20 Q -2 -22, 13 -20 Q 20 -19, 18 -11 Q 15 2, 10 11 Q 5 18, 0 27" fill="none" stroke="url(#gold)" stroke-width="7" stroke-linecap="round"/>
    <circle cx="-1" cy="38" r="4" fill="url(#gold)"/>
  </g>

  <!-- Right Side: Brand typography -->
  <g filter="url(#shadow)">
    <text x="440" y="240" font-family="'Poppins', sans-serif" font-weight="800" font-size="56" fill="white" letter-spacing="-1">Sheikh Mohammed</text>
    <text x="440" y="315" font-family="'Poppins', sans-serif" font-weight="800" font-size="56" fill="url(#gold)" letter-spacing="-1">Zabuur</text>
    <text x="440" y="375" font-family="'Poppins', sans-serif" font-weight="600" font-size="20" fill="rgba(255,255,255,0.6)" letter-spacing="5">SH. MOHAMMED ZABUUR PLATFORM</text>
    
    <!-- Divider -->
    <line x1="440" y1="410" x2="880" y2="410" stroke="url(#gold)" stroke-width="2.5" opacity="0.3"/>
    
    <text x="440" y="450" font-family="'Poppins', sans-serif" font-weight="400" font-size="18" fill="rgba(255,255,255,0.4)" letter-spacing="0.5">Authentic Islamic Education — Audio, Video &amp; PDF</text>
  </g>

  <!-- Bottom status bar -->
  <rect x="0" y="580" width="1200" height="50" fill="rgba(0,0,0,0.2)"/>
  <text x="600" y="610" font-family="'Poppins', sans-serif" font-weight="500" font-size="14" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="3.5">SHEIKHMOHAMMEDZABUUR.COM</text>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogSvg, 'utf-8');

  // 4. Generate PWA PNG Icons
  console.log('Compiling PWA PNG icons...');
  const sizes = [48, 96, 180, 192, 512];
  for (const size of sizes) {
    await sharp(Buffer.from(faviconSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  await sharp(Buffer.from(faviconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png');

  console.log('All branding assets generated successfully!');
}

run().catch(err => {
  console.error('Asset Generation Error:', err);
  process.exit(1);
});
