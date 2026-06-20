// Provider component only — imports from AppearanceContext.tsx
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { appearance } from '../lib/api';
import { AppearanceContext, defaultAppearanceSettings } from './AppearanceContext';
import type { AppearanceSettings } from './AppearanceContext';

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultAppearanceSettings);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await appearance.get();
      if (res.data) {
        setSettings({ ...defaultAppearanceSettings, ...res.data });
      }
    } catch (err) {
      console.error('Failed to load appearance settings from server, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppearanceSettings>) => {
    try {
      const updateData = { ...settings, ...newSettings };
      const res = await appearance.update(updateData);
      if (res.data) {
        setSettings({ ...defaultAppearanceSettings, ...res.data });
      }
    } catch (err) {
      console.error('Failed to update appearance settings:', err);
      throw err;
    }
  }, [settings]);

  const resetDefaults = useCallback(async () => {
    try {
      await appearance.reset();
      setSettings({ ...defaultAppearanceSettings });
    } catch (err) {
      console.error('Failed to reset appearance settings:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return (
    <AppearanceContext.Provider value={{ settings, loading, updateSettings, refreshSettings, resetDefaults }}>
      {children}
    </AppearanceContext.Provider>
  );
}
