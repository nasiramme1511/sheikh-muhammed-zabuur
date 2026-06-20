// Context + Hook only (no Provider component) — safe for React Fast Refresh
import { createContext, useContext } from 'react';

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
  defaultMode: 'dark' | 'gold' | 'classic';
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

export interface AppearanceContextType {
  settings: AppearanceSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<AppearanceSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  resetDefaults: () => Promise<void>;
}

export const defaultAppearanceSettings: AppearanceSettings = {
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
  buttonColor: '#0EA5E9',
  linkColor: '#38BDF8',
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
  platformName: 'Sheikh Muhammed Zabuur',
  footerDescription: 'Sheikh Muhammed Zabuur — Authentic Islamic education through audio lectures, video lessons, PDFs, live streams, and Telegram communities.',
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
  counterColor: '#0EA5E9',
  animationSpeed: 2000,
  counterCardStyle: 'default',
};

export const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function useAppearance(): AppearanceContextType {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}
