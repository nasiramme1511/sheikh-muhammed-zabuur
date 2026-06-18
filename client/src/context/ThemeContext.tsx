import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

function applyTheme() {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState(() => {
    try {
      return Number(localStorage.getItem('icc-font-size')) || 16;
    } catch {
      return 16;
    }
  });

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const toggle = useCallback(() => {
    setModeState(() => {
      setResolved('dark');
      applyTheme();
      return 'dark';
    });
  }, []);

  useEffect(() => {
    setResolved('dark');
    applyTheme();
  }, []);

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
