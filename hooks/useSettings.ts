
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSettingsData();
    
    return () => {
      // Clear any pending save operations
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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
    try {
      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Update state immediately
      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...updates };
        console.log('Updating settings:', updatedSettings);
        
        // Debounce the save operation
        saveTimeoutRef.current = setTimeout(() => {
          saveSettings(updatedSettings)
            .then(() => {
              console.log('Settings saved successfully');
            })
            .catch((error) => {
              console.error('Error saving settings:', error);
            });
        }, 300);
        
        return updatedSettings;
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }, []);

  const setCurrency = useCallback((currencyCode: string, currencySymbol: string) => {
    console.log('setCurrency called with:', currencyCode, currencySymbol);
    updateSettings({ currency: currencyCode, currencySymbol });
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
