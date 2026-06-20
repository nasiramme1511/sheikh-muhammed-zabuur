import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { uploadFile } from '../lib/storage';

const router = Router();

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const APPEARANCE_FILE = path.join(DATA_DIR, 'appearance.json');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'background';
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
    cb(null, true);
  },
});

export interface BackgroundItem {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export interface AppearanceSettings {
  backgroundImage: string;
  backgroundEnabled: boolean;
  brightness: number;
  enableOverlay: boolean;
  overlayOpacity: number;
  overlayColor: string;
  overlayGradient: boolean;
  blurStrength: number;
  backgrounds: BackgroundItem[];
  activeBackgroundId: string;
  slideshowEnabled: boolean;
  slideshowSpeed: number;
  slideshowAutoRotate: boolean;
  slideshowFade: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonColor: string;
  linkColor: string;
  fontFamily: string;
  fontSize: number;
  headingWeight: number;
  bodyWeight: number;
  defaultMode: 'dark' | 'light' | 'system';
  showHero: boolean;
  showFeaturedAudio: boolean;
  showFeaturedVideos: boolean;
  showFeaturedPdfs: boolean;
  showLiveStream: boolean;
  showCategories: boolean;
  showBiography: boolean;
  showStatistics: boolean;
  showNewsletter: boolean;
  platformName: string;
  footerDescription: string;
  copyrightText: string;
  logoUrl: string;
  faviconUrl: string;
  mobileIconUrl: string;
  backgroundBehavior: 'fixed' | 'parallax' | 'scroll' | 'zoom';
  glassEffect: boolean;
  borderRadius: number;
  shadowStrength: number;
  hoverAnimation: boolean;
  cardOpacity: number;
  counterColor: string;
  animationSpeed: number;
  counterCardStyle: 'default' | 'glass' | 'solid';
}

const defaultState: AppearanceSettings = {
  backgroundImage: '/uploads/images/roomaa-xiqqoo-masjid.jpg',
  backgroundEnabled: true,
  brightness: 0.4,
  enableOverlay: true,
  overlayOpacity: 0.6,
  overlayColor: '#000000',
  overlayGradient: true,
  blurStrength: 0,
  backgrounds: [
    { id: '1', name: 'Masjid Background', url: '/uploads/images/roomaa-xiqqoo-masjid.jpg', active: true },
  ],
  activeBackgroundId: '1',
  slideshowEnabled: false,
  slideshowSpeed: 5000,
  slideshowAutoRotate: true,
  slideshowFade: true,
  primaryColor: '#022010',
  secondaryColor: '#065f46',
  accentColor: '#d97706',
  buttonColor: '#10b981',
  linkColor: '#34d399',
  fontFamily: 'Inter',
  fontSize: 16,
  headingWeight: 700,
  bodyWeight: 400,
  defaultMode: 'dark',
  showHero: true,
  showFeaturedAudio: true,
  showFeaturedVideos: true,
  showFeaturedPdfs: true,
  showLiveStream: true,
  showCategories: true,
  showBiography: true,
  showStatistics: true,
  showNewsletter: true,
  platformName: 'Sheikh Mohammed Zabuur Official Platform',
  footerDescription: 'Islamic online learning platform with audio lessons covering Aqeedah, Tafsir, Hadith, Fiqh, and more — taught by Sheikh Mohammed Zabuur.',
  copyrightText: 'All rights reserved.',
  logoUrl: '',
  faviconUrl: '',
  mobileIconUrl: '',
  backgroundBehavior: 'fixed',
  glassEffect: true,
  borderRadius: 12,
  shadowStrength: 50,
  hoverAnimation: true,
  cardOpacity: 0.45,
  counterColor: '#10b981',
  animationSpeed: 2000,
  counterCardStyle: 'default',
};

function readState(): AppearanceSettings {
  try {
    if (fs.existsSync(APPEARANCE_FILE)) {
      const data = fs.readFileSync(APPEARANCE_FILE, 'utf-8');
      return { ...defaultState, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading appearance state:', err);
  }
  return { ...defaultState };
}

function writeState(state: AppearanceSettings) {
  try {
    fs.writeFileSync(APPEARANCE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing appearance state:', err);
  }
}

router.get('/', (_req: Request, res: Response) => {
  res.json(readState());
});

router.put('/', authenticate, adminOnly, (req: Request, res: Response) => {
  try {
    const current = readState();
    const allowedKeys = Object.keys(defaultState) as (keyof AppearanceSettings)[];
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        (current as any)[key] = req.body[key];
      }
    }
    writeState(current);
    res.json(current);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appearance settings' });
  }
});

router.post('/reset', authenticate, adminOnly, (_req: Request, res: Response) => {
  writeState({ ...defaultState });
  res.json({ ...defaultState });
});

router.post('/upload', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const uploadResult = await uploadFile(req.file.path, req.file.originalname);
    try { fs.unlinkSync(req.file.path); } catch {}
    const url = uploadResult.url;
    const current = readState();
    current.backgroundImage = url;
    writeState(current);
    res.json({ url, settings: current });
  });
});

export default router;
