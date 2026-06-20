import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ThemeContext, ThemeMode, THEME_CYCLE, applyTheme } from './ThemeContext';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('icc-theme');
      if (saved && THEME_CYCLE.includes(saved as ThemeMode)) return saved as ThemeMode;
    } catch {}
    return 'dark';
  });
  const [resolved, setResolved] = useState<ThemeMode>('dark');
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
    setModeState(prev => {
      const idx = THEME_CYCLE.indexOf(prev);
      const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
      setResolved(next);
      applyTheme(next);
      try { localStorage.setItem('icc-theme', next); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    setResolved(mode);
    applyTheme(mode);
    try { localStorage.setItem('icc-theme', mode); } catch {}
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
