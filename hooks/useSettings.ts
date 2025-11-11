
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
    // Prevent concurrent updates
    if (isSavingRef.current) {
      console.log('Settings update already in progress, skipping...');
      return;
    }

    isSavingRef.current = true;
    
    try {
      // Use functional update to avoid dependency on settings
      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...updates };
        console.log('Updating settings:', updatedSettings);
        
        // Save to storage asynchronously
        saveSettings(updatedSettings).then(() => {
          console.log('Settings saved successfully');
        }).catch((error) => {
          console.error('Error saving settings:', error);
        });
        
        return updatedSettings;
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      // Reset the flag after a short delay to ensure state update completes
      setTimeout(() => {
        isSavingRef.current = false;
      }, 100);
    }
  }, []); // No dependencies - stable callback

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
