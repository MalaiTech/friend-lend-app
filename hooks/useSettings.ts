
import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types/loan';
import { saveSettings, loadSettings } from '@/utils/storage';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'EUR',
  currencySymbol: '€',
  supabaseEnabled: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
        console.log('No saved settings found, using EUR as default');
        // Save default settings
        await saveSettings(DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to default settings on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const setCurrency = useCallback(async (currencyCode: string, currencySymbol: string) => {
    console.log('setCurrency called:', currencyCode, currencySymbol);
    
    try {
      // Use functional update to avoid stale closure
      const updatedSettings: AppSettings = await new Promise((resolve) => {
        setSettings((prevSettings) => {
          const newSettings = { 
            ...prevSettings, 
            currency: currencyCode, 
            currencySymbol 
          };
          resolve(newSettings);
          return newSettings;
        });
      });
      
      // Save to storage after state update
      await saveSettings(updatedSettings);
      console.log('Currency saved to storage:', updatedSettings);
    } catch (error) {
      console.error('Error saving currency:', error);
      throw error;
    }
  }, []); // Empty dependency array - uses functional updates

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    console.log('updateSettings called:', updates);
    
    try {
      // Use functional update to avoid stale closure
      const updatedSettings: AppSettings = await new Promise((resolve) => {
        setSettings((prevSettings) => {
          const newSettings = { ...prevSettings, ...updates };
          resolve(newSettings);
          return newSettings;
        });
      });
      
      // Save to storage after state update
      await saveSettings(updatedSettings);
      console.log('Settings saved to storage:', updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }, []); // Empty dependency array - uses functional updates

  const setSupabaseEnabled = useCallback((enabled: boolean) => {
    updateSettings({ supabaseEnabled: enabled });
  }, [updateSettings]);

  return {
    settings,
    loading,
    updateSettings,
    setCurrency,
    setSupabaseEnabled,
  };
}
