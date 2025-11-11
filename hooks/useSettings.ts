
import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types/loan';
import { saveSettings, loadSettings } from '@/utils/storage';

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
        console.log('Loaded settings:', loadedSettings);
        setSettings(loadedSettings);
      } else {
        console.log('No saved settings found, using EUR as default');
        // Save default settings
        const defaultSettings: AppSettings = {
          currency: 'EUR',
          currencySymbol: '€',
          supabaseEnabled: false,
        };
        await saveSettings(defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrency = useCallback(async (currencyCode: string, currencySymbol: string) => {
    console.log('setCurrency called:', currencyCode, currencySymbol);
    
    try {
      const updatedSettings = { 
        ...settings, 
        currency: currencyCode, 
        currencySymbol 
      };
      
      // Save to storage first
      await saveSettings(updatedSettings);
      console.log('Currency saved to storage');
      
      // Then update state
      setSettings(updatedSettings);
      console.log('Currency state updated');
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  }, [settings]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    console.log('updateSettings called:', updates);
    
    try {
      const updatedSettings = { ...settings, ...updates };
      
      // Save to storage first
      await saveSettings(updatedSettings);
      console.log('Settings saved to storage');
      
      // Then update state
      setSettings(updatedSettings);
      console.log('Settings state updated');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

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
