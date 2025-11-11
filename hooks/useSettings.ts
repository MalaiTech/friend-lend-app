
import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types/loan';
import { saveSettings, loadSettings } from '@/utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'USD',
    currencySymbol: '$',
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
        console.log('Loaded settings:', loadedSettings);
        setSettings(loadedSettings);
      } else {
        console.log('No saved settings found, using defaults');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrency = useCallback((currencyCode: string, currencySymbol: string) => {
    console.log('setCurrency called:', currencyCode, currencySymbol);
    
    // Update state immediately
    setSettings((prevSettings) => {
      const updatedSettings = { 
        ...prevSettings, 
        currency: currencyCode, 
        currencySymbol 
      };
      
      console.log('Updating currency to:', updatedSettings);
      
      // Save to storage asynchronously (fire and forget)
      saveSettings(updatedSettings)
        .then(() => console.log('Currency saved to storage'))
        .catch((error) => console.error('Error saving currency:', error));
      
      return updatedSettings;
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    console.log('updateSettings called:', updates);
    
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...updates };
      console.log('Updating settings:', updatedSettings);
      
      // Save to storage asynchronously
      saveSettings(updatedSettings)
        .then(() => console.log('Settings saved to storage'))
        .catch((error) => console.error('Error saving settings:', error));
      
      return updatedSettings;
    });
  }, []);

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
