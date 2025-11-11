
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isSavingRef = useRef(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const loadedSettings = await loadSettings();
      if (loadedSettings) {
        console.log('Loaded settings:', loadedSettings);
        setSettings(loadedSettings);
      } else {
        // Set default currency
        const defaultCurrency = getDefaultCurrency();
        const defaultSettings: AppSettings = {
          currency: defaultCurrency.code,
          currencySymbol: defaultCurrency.symbol,
          supabaseEnabled: false,
        };
        console.log('Using default settings:', defaultSettings);
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
    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('Already saving settings, waiting...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      isSavingRef.current = true;
      
      // Create the updated settings object
      const updatedSettings = { ...settings, ...updates };
      console.log('Updating settings to:', updatedSettings);
      
      // Update state first
      setSettings(updatedSettings);
      
      // Save to storage
      await saveSettings(updatedSettings);
      console.log('Settings saved successfully');
      
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  }, [settings]);

  const setCurrency = useCallback(async (currencyCode: string, currencySymbol: string) => {
    console.log('setCurrency called with:', currencyCode, currencySymbol);
    await updateSettings({ currency: currencyCode, currencySymbol });
  }, [updateSettings]);

  const setSupabaseEnabled = useCallback(async (enabled: boolean) => {
    await updateSettings({ supabaseEnabled: enabled });
  }, [updateSettings]);

  return {
    settings,
    loading,
    updateSettings,
    setCurrency,
    setSupabaseEnabled,
  };
}
