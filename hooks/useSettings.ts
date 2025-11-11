
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings } from '@/types/loan';
import { saveSettings, loadSettings } from '@/utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'USD',
    currencySymbol: '$',
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
        console.log('No saved settings found, using defaults');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrency = useCallback(async (currencyCode: string, currencySymbol: string) => {
    console.log('setCurrency called:', currencyCode, currencySymbol);
    
    // Prevent concurrent updates
    if (isSavingRef.current) {
      console.log('Already saving, skipping...');
      return;
    }
    
    try {
      isSavingRef.current = true;
      
      // Update state with functional update to avoid stale closures
      setSettings((prevSettings) => {
        // Skip if currency hasn't changed
        if (prevSettings.currency === currencyCode) {
          console.log('Currency unchanged, skipping update');
          return prevSettings;
        }
        
        const updatedSettings = { 
          ...prevSettings, 
          currency: currencyCode, 
          currencySymbol 
        };
        
        console.log('Updating currency to:', updatedSettings);
        
        // Save to storage asynchronously (don't await to avoid blocking)
        saveSettings(updatedSettings)
          .then(() => console.log('Currency saved to storage'))
          .catch((error) => console.error('Error saving currency:', error));
        
        return updatedSettings;
      });
      
    } finally {
      // Reset the saving flag after a short delay
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    console.log('updateSettings called:', updates);
    
    if (isSavingRef.current) {
      console.log('Already saving settings, skipping...');
      return;
    }

    try {
      isSavingRef.current = true;
      
      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...updates };
        console.log('Updating settings:', updatedSettings);
        
        // Save to storage asynchronously
        saveSettings(updatedSettings)
          .then(() => console.log('Settings saved to storage'))
          .catch((error) => console.error('Error saving settings:', error));
        
        return updatedSettings;
      });
      
    } finally {
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
    }
  }, []);

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
