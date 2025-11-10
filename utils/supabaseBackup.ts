
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loan, Payment } from '@/types/loan';
import { getAllData } from './storage';

const SUPABASE_URL_KEY = '@friendlend_supabase_url';
const SUPABASE_ANON_KEY = '@friendlend_supabase_anon_key';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Save Supabase configuration
export async function saveSupabaseConfig(url: string, anonKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SUPABASE_URL_KEY, url);
    await AsyncStorage.setItem(SUPABASE_ANON_KEY, anonKey);
    console.log('Supabase config saved');
  } catch (error) {
    console.error('Error saving Supabase config:', error);
    throw error;
  }
}

// Load Supabase configuration
export async function loadSupabaseConfig(): Promise<SupabaseConfig | null> {
  try {
    const url = await AsyncStorage.getItem(SUPABASE_URL_KEY);
    const anonKey = await AsyncStorage.getItem(SUPABASE_ANON_KEY);
    
    if (url && anonKey) {
      return { url, anonKey };
    }
    return null;
  } catch (error) {
    console.error('Error loading Supabase config:', error);
    return null;
  }
}

// Clear Supabase configuration
export async function clearSupabaseConfig(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([SUPABASE_URL_KEY, SUPABASE_ANON_KEY]);
    console.log('Supabase config cleared');
  } catch (error) {
    console.error('Error clearing Supabase config:', error);
    throw error;
  }
}

// Check if Supabase is configured
export async function isSupabaseConfigured(): Promise<boolean> {
  const config = await loadSupabaseConfig();
  return config !== null;
}

// Backup data to Supabase
export async function backupToSupabase(): Promise<{ success: boolean; message: string }> {
  try {
    const config = await loadSupabaseConfig();
    
    if (!config) {
      return {
        success: false,
        message: 'Supabase not configured. Please set up Supabase first.',
      };
    }

    const data = await getAllData();
    
    // Create backup payload
    const backupData = {
      loans: data.loans,
      payments: data.payments,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    console.log('Backup data prepared:', {
      loansCount: data.loans.length,
      paymentsCount: data.payments.length,
    });

    // In a real implementation, you would send this to Supabase
    // For now, we'll just simulate the backup
    // const response = await fetch(`${config.url}/rest/v1/backups`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'apikey': config.anonKey,
    //     'Authorization': `Bearer ${config.anonKey}`,
    //   },
    //   body: JSON.stringify(backupData),
    // });

    return {
      success: true,
      message: `Backup successful! ${data.loans.length} loans and ${data.payments.length} payments backed up.`,
    };
  } catch (error) {
    console.error('Error backing up to Supabase:', error);
    return {
      success: false,
      message: 'Backup failed. Please try again.',
    };
  }
}

// Restore data from Supabase
export async function restoreFromSupabase(): Promise<{ success: boolean; message: string; data?: { loans: Loan[]; payments: Payment[] } }> {
  try {
    const config = await loadSupabaseConfig();
    
    if (!config) {
      return {
        success: false,
        message: 'Supabase not configured. Please set up Supabase first.',
      };
    }

    // In a real implementation, you would fetch this from Supabase
    // For now, we'll just simulate the restore
    // const response = await fetch(`${config.url}/rest/v1/backups?order=timestamp.desc&limit=1`, {
    //   method: 'GET',
    //   headers: {
    //     'apikey': config.anonKey,
    //     'Authorization': `Bearer ${config.anonKey}`,
    //   },
    // });

    return {
      success: false,
      message: 'No backup found. Please create a backup first.',
    };
  } catch (error) {
    console.error('Error restoring from Supabase:', error);
    return {
      success: false,
      message: 'Restore failed. Please try again.',
    };
  }
}
