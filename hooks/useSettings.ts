
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings } from '@/types/loan';
import { saveSettings, loadSettings } from '@/utils/storage';
import { getDefaultCurrency } from '@/utils/currencies';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'USD',
    currencySymbol: '$',
    supabaseEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const isSavingRef = useRef(false);
  const isInitializedRef = useRef(false);

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
        isInitializedRef.current = true;
      } else {
        // No default currency - let user select on first use
        console.log('No saved settings found');
        isInitializedRef.current = true;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      isInitializedRef.current = true;
    } finally {
      setLoading(false);
    }
  };

  // Stable update function with no dependencies
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('Already saving settings, skipping...');
      return;
    }

    try {
      isSavingRef.current = true;
      
      // Use functional update to get the latest state
      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...updates };
        console.log('Updating settings:', updatedSettings);
        
        // Save to storage asynchronously
        saveSettings(updatedSettings)
          .then(() => {
            console.log('Settings saved to storage');
          })
          .catch((error) => {
            console.error('Error saving settings to storage:', error);
          })
          .finally(() => {
            // Add a delay before allowing next save
            setTimeout(() => {
              isSavingRef.current = false;
            }, 300);
          });
        
        return updatedSettings;
      });
      
    } catch (error) {
      console.error('Error updating settings:', error);
      isSavingRef.current = false;
      throw error;
    }
  }, []);

  const setCurrency = useCallback(async (currencyCode: string, currencySymbol: string) => {
    console.log('setCurrency called:', currencyCode, currencySymbol);
    
    // Don't update if it's the same currency
    setSettings((prevSettings) => {
      if (prevSettings.currency === currencyCode) {
        console.log('Currency unchanged, skipping update');
        return prevSettings;
      }
      
      const updatedSettings = { 
        ...prevSettings, 
        currency: currencyCode, 
        currencySymbol 
      };
      
      // Save asynchronously
      saveSettings(updatedSettings)
        .then(() => console.log('Currency saved'))
        .catch((error) => console.error('Error saving currency:', error));
      
      return updatedSettings;
    });
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
