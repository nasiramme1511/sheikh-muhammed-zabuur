const fs = require('fs');
const path = require('path');
const pdfDir = path.join(__dirname, 'uploads/pdfs');
const audioDir = path.join(__dirname, 'uploads/audio');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const minimalPdf = `%PDF-1.4
1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj
2 0 obj <</Type/Pages/Count 1/Kids[3 0 R]>> endobj
3 0 obj <</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>> endobj
4 0 obj <</Length 50>> stream
BT /F1 24 Tf 100 700 Td (This is a dummy PDF file) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
0000000186 00000 n
trailer <</Size 5/Root 1 0 R>>
startxref
285
%%EOF`;

const slugs = [
  'intro-to-aqeedah', 'foundations-of-faith', 'tawheed-al-rububiyyah', 'tawheed-al-uluhiyyah',
  'tafsir-al-fatihah', 'tafsir-al-baqarah-1-5', 'importance-of-hadith', 'hadith-on-intentions',
  'purification-in-islam', 'conditions-of-prayer', 'birth-of-prophet', 'early-life-of-prophet',
  'intro-to-tajweed', 'letters-articulation', 'intro-to-arabic-grammar', 'parts-of-speech-arabic',
  'sincerity-and-intentions', 'good-character', 'correct-methodology', 'following-the-salaf',
  
  // Book slugs
  'al-aqeedah-al-wasitiyyah', 'kitab-at-tawheed', 'tafsir-ibn-kathir', 'sahih-al-bukhari',
  'umdat-al-ahkam', 'ar-raheeq-al-makhtum', 'al-qaidah-an-nuraniyyah', 'al-ajurrumiyyah',
  'riyadh-as-salihin', 'al-manhaj-as-salim'
];

slugs.forEach(slug => {
  fs.writeFileSync(path.join(pdfDir, slug + '.pdf'), minimalPdf);
  fs.writeFileSync(path.join(audioDir, slug + '.mp3'), 'dummy audio content');
});

console.log('Dummy files created successfully.');
