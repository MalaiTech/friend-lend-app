
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
  
  // Use ref to prevent concurrent saves
  const isSavingRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    
    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    try {
      isSavingRef.current = true;
      
      // Update state immediately with functional update
      setSettings((prevSettings) => {
        // Skip if currency hasn't changed
        if (prevSettings.currency === currencyCode && prevSettings.currencySymbol === currencySymbol) {
          console.log('Currency unchanged, skipping update');
          return prevSettings;
        }
        
        const updatedSettings = { 
          ...prevSettings, 
          currency: currencyCode, 
          currencySymbol 
        };
        
        console.log('Updating currency to:', updatedSettings);
        
        // Save to storage asynchronously without blocking
        saveSettings(updatedSettings)
          .then(() => console.log('Currency saved to storage'))
          .catch((error) => console.error('Error saving currency:', error))
          .finally(() => {
            // Reset the saving flag after a delay
            saveTimeoutRef.current = setTimeout(() => {
              isSavingRef.current = false;
            }, 500);
          });
        
        return updatedSettings;
      });
      
    } catch (error) {
      console.error('Error in setCurrency:', error);
      isSavingRef.current = false;
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    console.log('updateSettings called:', updates);
    
    if (isSavingRef.current) {
      console.log('Already saving settings, skipping...');
      return;
    }

    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    try {
      isSavingRef.current = true;
      
      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...updates };
        console.log('Updating settings:', updatedSettings);
        
        // Save to storage asynchronously
        saveSettings(updatedSettings)
          .then(() => console.log('Settings saved to storage'))
          .catch((error) => console.error('Error saving settings:', error))
          .finally(() => {
            saveTimeoutRef.current = setTimeout(() => {
              isSavingRef.current = false;
            }, 500);
          });
        
        return updatedSettings;
      });
      
    } catch (error) {
      console.error('Error in updateSettings:', error);
      isSavingRef.current = false;
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
