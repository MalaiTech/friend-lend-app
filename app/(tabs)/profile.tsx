
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, TextInput, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as LocalAuthentication from 'expo-local-authentication';
import { clearAllData, getAllData } from '@/utils/storage';
import { useSettings } from '@/hooks/useSettings';
import { useLoans } from '@/hooks/useLoans';
import { getCurrencyByCode } from '@/utils/currencies';
import {
  isSupabaseConfigured,
  saveSupabaseConfig,
  clearSupabaseConfig,
  backupToSupabase,
  restoreFromSupabase,
} from '@/utils/supabaseBackup';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateLastBackupDate } = useSettings();
  const { refreshData } = useLoans();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
    checkSupabaseStatus();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const checkSupabaseStatus = async () => {
    const configured = await isSupabaseConfigured();
    setSupabaseConfigured(configured);
  };

  const handleEnableBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric lock',
        fallbackLabel: 'Use passcode',
      });
      
      if (result.success) {
        Alert.alert('Success', 'Biometric authentication enabled');
      } else {
        Alert.alert('Failed', 'Authentication failed');
      }
    } catch (error) {
      console.error('Biometric error:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication');
    }
  };

  const handleCurrencySettings = () => {
    router.push('/currency-selector');
  };

  const handleCloudBackup = () => {
    if (!supabaseConfigured) {
      Alert.alert(
        'Cloud Backup Setup',
        'To enable cloud backup:\n\n1. Enable Supabase in Natively by pressing the Supabase button\n2. Connect to your Supabase project\n3. Or manually configure Supabase credentials below',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Manual Setup', onPress: () => setShowSupabaseModal(true) },
        ]
      );
    } else {
      Alert.alert(
        'Cloud Backup',
        'Choose an action:',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Backup Now', onPress: handleBackupNow },
          { text: 'Restore', onPress: handleRestoreBackup },
          { text: 'Disconnect', style: 'destructive', onPress: handleDisconnectSupabase },
        ]
      );
    }
  };

  const handleSaveSupabaseConfig = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      Alert.alert('Error', 'Please enter both Supabase URL and API key');
      return;
    }

    try {
      await saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      setSupabaseConfigured(true);
      setShowSupabaseModal(false);
      setSupabaseUrl('');
      setSupabaseKey('');
      Alert.alert('Success', 'Supabase configured successfully!');
    } catch (error) {
      console.error('Error saving Supabase config:', error);
      Alert.alert('Error', 'Failed to save Supabase configuration');
    }
  };

  const handleBackupNow = async () => {
    try {
      const result = await backupToSupabase();
      
      if (result.success) {
        await updateLastBackupDate();
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Backup Failed', result.message);
      }
    } catch (error) {
      console.error('Error during backup:', error);
      Alert.alert('Error', 'Failed to backup data');
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      'Restore Backup',
      'This will replace all local data with the backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await restoreFromSupabase();
              
              if (result.success && result.data) {
                // In a real implementation, you would restore the data here
                await refreshData();
                Alert.alert('Success', result.message);
              } else {
                Alert.alert('Restore Failed', result.message);
              }
            } catch (error) {
              console.error('Error during restore:', error);
              Alert.alert('Error', 'Failed to restore data');
            }
          },
        },
      ]
    );
  };

  const handleDisconnectSupabase = async () => {
    try {
      await clearSupabaseConfig();
      setSupabaseConfigured(false);
      Alert.alert('Success', 'Supabase disconnected');
    } catch (error) {
      console.error('Error disconnecting Supabase:', error);
      Alert.alert('Error', 'Failed to disconnect Supabase');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await getAllData();
      const dataString = JSON.stringify(data, null, 2);
      
      Alert.alert(
        'Export Data',
        `Ready to export:\n- ${data.loans.length} loans\n- ${data.payments.length} payments\n\nExport functionality will be available in a future update.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all loans and payments? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await refreshData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const currency = getCurrencyByCode(settings.currency);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLargeTitle: true,
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Currency Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currency</Text>
            <View style={commonStyles.card}>
              <Pressable style={styles.settingItem} onPress={handleCurrencySettings}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                    <IconSymbol name="dollarsign.circle" size={24} color={colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Default Currency</Text>
                    <Text style={styles.settingSubtitle}>
                      {currency?.name || 'Euro'} ({settings.currencySymbol})
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={commonStyles.card}>
              <Pressable
                style={styles.settingItem}
                onPress={handleEnableBiometric}
                disabled={!biometricAvailable}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <IconSymbol name="faceid" size={24} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Biometric Lock</Text>
                    <Text style={styles.settingSubtitle}>
                      {biometricAvailable ? 'Secure app with Face ID/Touch ID' : 'Not available on this device'}
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Data Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <View style={commonStyles.card}>
              <Pressable style={styles.settingItem} onPress={handleCloudBackup}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <IconSymbol name="icloud.and.arrow.up" size={24} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.settingTitleRow}>
                      <Text style={styles.settingTitle}>Cloud Backup</Text>
                      {supabaseConfigured && (
                        <View style={styles.connectedBadge}>
                          <Text style={styles.connectedText}>Connected</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.settingSubtitle}>
                      {settings.lastBackupDate 
                        ? `Last backup: ${new Date(settings.lastBackupDate).toLocaleDateString()}`
                        : supabaseConfigured
                        ? 'Tap to backup or restore'
                        : 'Enable Supabase for cloud backup'}
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.settingItem} onPress={handleExportData}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                    <IconSymbol name="square.and.arrow.up" size={24} color={colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Export Data</Text>
                    <Text style={styles.settingSubtitle}>Export loans as PDF or CSV</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.settingItem} onPress={handleClearData}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                    <IconSymbol name="trash" size={24} color={colors.error} />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: colors.error }]}>Clear All Data</Text>
                    <Text style={styles.settingSubtitle}>Delete all loans and payments</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={commonStyles.card}>
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>1.0.0</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>Storage</Text>
                <Text style={styles.aboutValue}>
                  {supabaseConfigured ? 'Local + Cloud' : 'Local Only'}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            FriendLend stores all data locally on your device. Enable cloud backup to sync your data across devices.
          </Text>
        </ScrollView>
      </View>

      {/* Supabase Configuration Modal */}
      <Modal
        visible={showSupabaseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSupabaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Supabase</Text>
            <Text style={styles.modalDescription}>
              Enter your Supabase project credentials to enable cloud backup.
            </Text>

            <Text style={styles.modalLabel}>Supabase URL</Text>
            <TextInput
              style={styles.modalInput}
              value={supabaseUrl}
              onChangeText={setSupabaseUrl}
              placeholder="https://your-project.supabase.co"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.modalLabel}>Supabase Anon Key</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputMultiline]}
              value={supabaseKey}
              onChangeText={setSupabaseKey}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowSupabaseModal(false);
                  setSupabaseUrl('');
                  setSupabaseKey('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveSupabaseConfig}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  connectedBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 16,
    color: colors.text,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  modalInputMultiline: {
    height: 80,
    paddingTop: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
