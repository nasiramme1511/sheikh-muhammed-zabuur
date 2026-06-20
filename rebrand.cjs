const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/xampp/htdocs/sh-zabuur-official-app';
const filesToUpdate = [
  'frontend/public/favicon.svg',
  'frontend/public/og-image.svg',
  'frontend/public/logo.svg',
  'frontend/scripts/generate-assets.cjs',
  'backend/src/routes/appearance.ts',
  'backend/src/services/offlineAI.ts',
  'backend/src/services/ai.ts',
  'backend/src/routes/settings.ts',
  'backend/prisma/migrate-data.ts',
  'backend/data/appearance.json'
];

filesToUpdate.forEach(relPath => {
  const fullPath = path.join(projectRoot, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Specifically handle the SVG uppercase text first
    content = content.replace(/IMAN CHERCHER COLLEGE/g, 'SH. MOHAMMED ZABUUR PLATFORM');
    
    // Handle AI Scholar 
    content = content.replace(/Iman Chercher AI Scholar/g, 'Sheikh Zabuur AI Scholar');
    
    // Handle the "Sheikh Mohammed Zabuur Iman Chercher College" (which would become double name if replaced directly)
    content = content.replace(/Sheikh Mohammed Zabuur Iman Chercher College/g, 'Sheikh Mohammed Zabuur Official Platform');
    
    // Remaining generic
    content = content.replace(/Iman Chercher College/g, 'Sheikh Mohammed Zabuur Official Platform');
    content = content.replace(/Iman Chercher/g, 'Sheikh Mohammed Zabuur');
    
    fs.writeFileSync(fullPath, content);
    console.log('Updated: ' + relPath);
  } else {
    console.log('Not found: ' + relPath);
  }
});
console.log('Rebranding complete!');
