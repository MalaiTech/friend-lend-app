
import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types/loan';
import { saveSettings, loadSettings } from '@/utils/storage';
import { getDefaultCurrency } from '@/utils/currencies';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'EUR',
    currencySymbol: '€',
    supabaseEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const loadedSettings = await loadSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      } else {
        // Set default currency
        const defaultCurrency = getDefaultCurrency();
        const defaultSettings: AppSettings = {
          currency: defaultCurrency.code,
          currencySymbol: defaultCurrency.symbol,
          supabaseEnabled: false,
        };
        setSettings(defaultSettings);
        await saveSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  }, [settings]);

  const setCurrency = useCallback(async (currencyCode: string, currencySymbol: string) => {
    await updateSettings({ currency: currencyCode, currencySymbol });
  }, [updateSettings]);

  const setSupabaseEnabled = useCallback(async (enabled: boolean) => {
    await updateSettings({ supabaseEnabled: enabled });
  }, [updateSettings]);

  const updateLastBackupDate = useCallback(async () => {
    await updateSettings({ lastBackupDate: new Date().toISOString() });
  }, [updateSettings]);

  return {
    settings,
    loading,
    updateSettings,
    setCurrency,
    setSupabaseEnabled,
    updateLastBackupDate,
  };
}
