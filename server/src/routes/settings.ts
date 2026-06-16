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
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  defaultLanguage: string;
  timezone: string;
}

export interface FeatureSettings {
  aiAssistant: boolean;
  userRegistration: boolean;
  comments: boolean;
  ratings: boolean;
}

export interface LimitSettings {
  maxUploadFileSize: number;
  maxResourcesPerPage: number;
  sessionTimeout: number;
}

export interface MaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface SiteSettings {
  general: GeneralSettings;
  features: FeatureSettings;
  limits: LimitSettings;
  maintenance: MaintenanceSettings;
}

const defaultGeneral: GeneralSettings = {
  siteName: 'Iman Chercher College',
  siteDescription: 'A clear, guided Islamic learning journey',
  defaultLanguage: 'en',
  timezone: 'UTC',
};

const defaultFeatures: FeatureSettings = {
  aiAssistant: true,
  userRegistration: true,
  comments: true,
  ratings: true,
};

const defaultLimits: LimitSettings = {
  maxUploadFileSize: 50,
  maxResourcesPerPage: 20,
  sessionTimeout: 60,
};

const defaultMaintenance: MaintenanceSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back shortly.',
};

const defaultState: SiteSettings = {
  general: { ...defaultGeneral },
  features: { ...defaultFeatures },
  limits: { ...defaultLimits },
  maintenance: { ...defaultMaintenance },
};

function readState(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        general: { ...defaultGeneral, ...parsed.general },
        features: { ...defaultFeatures, ...parsed.features },
        limits: { ...defaultLimits, ...parsed.limits },
        maintenance: { ...defaultMaintenance, ...parsed.maintenance },
      };
    }
  } catch (err) {
    console.error('Error reading settings state:', err);
  }
  return { ...defaultState, general: { ...defaultGeneral }, features: { ...defaultFeatures }, limits: { ...defaultLimits }, maintenance: { ...defaultMaintenance } };
}

function writeState(state: SiteSettings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing settings state:', err);
  }
}

router.get('/', (_req: Request, res: Response) => {
  res.json(readState());
});

router.put('/', authenticate, adminOnly, (req: Request, res: Response) => {
  try {
    const current = readState();
    if (req.body.general) {
      current.general = { ...defaultGeneral, ...current.general, ...req.body.general };
    }
    if (req.body.features) {
      current.features = { ...defaultFeatures, ...current.features, ...req.body.features };
    }
    if (req.body.limits) {
      current.limits = { ...defaultLimits, ...current.limits, ...req.body.limits };
    }
    if (req.body.maintenance) {
      current.maintenance = { ...defaultMaintenance, ...current.maintenance, ...req.body.maintenance };
    }
    writeState(current);
    res.json(current);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.post('/reset', authenticate, adminOnly, (_req: Request, res: Response) => {
  writeState({ ...defaultState, general: { ...defaultGeneral }, features: { ...defaultFeatures }, limits: { ...defaultLimits }, maintenance: { ...defaultMaintenance } });
  res.json({ ...defaultState, general: { ...defaultGeneral }, features: { ...defaultFeatures }, limits: { ...defaultLimits }, maintenance: { ...defaultMaintenance } });
});

export default router;
