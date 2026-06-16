import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import fs from 'fs';
import path from 'path';

const router = Router();

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const APPEARANCE_FILE = path.join(DATA_DIR, 'appearance.json');

export interface BackgroundItem {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export interface AppearanceSettings {
  backgroundImage: string;
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
  enableOverlay: true,
  overlayOpacity: 0.55,
  overlayColor: '#000000',
  overlayGradient: true,
  blurStrength: 8,
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
  platformName: 'Sheikh Mohammed Zabuur Iman Chercher College',
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

export default router;
