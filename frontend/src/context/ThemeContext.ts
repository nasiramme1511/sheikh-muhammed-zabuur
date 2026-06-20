import { createContext, useContext } from 'react';

export const THEME_CYCLE = ['dark', 'light', 'gold', 'classic', 'scholar'] as const;

export type ThemeMode = (typeof THEME_CYCLE)[number];

export interface ThemeContextType {
  mode: ThemeMode;
  resolved: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'light') {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  } else {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
