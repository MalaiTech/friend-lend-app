
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as LocalAuthentication from 'expo-local-authentication';
import { clearAllData, getAllData } from '@/utils/storage';
import { useSettings } from '@/hooks/useSettings';
import { useLoans } from '@/hooks/useLoans';
import { getCurrencyByCode } from '@/utils/currencies';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateLastBackupDate } = useSettings();
  const { refreshData } = useLoans();
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);

  React.useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
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
    Alert.alert(
      'Cloud Backup',
      'To enable cloud backup, please enable Supabase by pressing the Supabase button in the Natively interface and connecting to a project.\n\nOnce connected, your data will be automatically backed up to the cloud.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await getAllData();
      const dataString = JSON.stringify(data, null, 2);
      
      // For now, just show the data count
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
                    <Text style={styles.settingTitle}>Cloud Backup</Text>
                    <Text style={styles.settingSubtitle}>
                      {settings.lastBackupDate 
                        ? `Last backup: ${new Date(settings.lastBackupDate).toLocaleDateString()}`
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
                <Text style={styles.aboutValue}>Local + Cloud</Text>
              </View>
            </View>
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            FriendLend stores all data locally on your device. Enable cloud backup to sync your data across devices.
          </Text>
        </ScrollView>
      </View>
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
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
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
});
