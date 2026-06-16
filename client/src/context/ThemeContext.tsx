import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { THEME_STORAGE_KEY } from '../lib/language';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getStoredMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {}
  return 'system';
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getStoredMode);
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveTheme(getStoredMode()));
  const [fontSize, setFontSize] = useState(() => {
    try {
      return Number(localStorage.getItem('icc-font-size')) || 16;
    } catch {
      return 16;
    }
  });

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try { localStorage.setItem(THEME_STORAGE_KEY, newMode); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setModeState(prev => {
      const next = prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark';
      try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch {}
      const resolvedNext = resolveTheme(next);
      setResolved(resolvedNext);
      applyTheme(resolvedNext);
      return next;
    });
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = resolveTheme('system');
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  // Apply theme whenever mode or resolved changes
  useEffect(() => {
    const r = resolveTheme(mode);
    setResolved(r);
    applyTheme(r);
  }, [mode]);

  // Font size
  useEffect(() => {
    try { localStorage.setItem('icc-font-size', String(fontSize)); } catch {}
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));
  const resetFontSize = () => setFontSize(16);

  const isDark = resolved === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        mode,
        resolved,
        isDark,
        setMode,
        toggle,
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
