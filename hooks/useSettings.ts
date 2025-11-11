
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

  // Use functional state update to avoid dependency on settings
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('Already saving settings, skipping...');
      return;
    }

    try {
      isSavingRef.current = true;
      
      // Use functional update to get the latest state without depending on it
      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...updates };
        console.log('Updating settings from', prevSettings, 'to', updatedSettings);
        
        // Save to storage asynchronously (don't block state update)
        saveSettings(updatedSettings).then(() => {
          console.log('Settings saved successfully');
        }).catch((error) => {
          console.error('Error saving settings:', error);
        }).finally(() => {
          isSavingRef.current = false;
        });
        
        return updatedSettings;
      });
      
    } catch (error) {
      console.error('Error updating settings:', error);
      isSavingRef.current = false;
      throw error;
    }
  }, []); // No dependencies - stable reference

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
