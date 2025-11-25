
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Pressable,
  Switch,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors, commonStyles, useThemeColors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import {
  savePassword,
  deletePassword,
  hasPassword,
  getPassword,
  setBiometricEnabled,
  isBiometricEnabled,
} from '@/utils/storage';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const [passwordExists, setPasswordExists] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      const passwordSet = await hasPassword();
      setPasswordExists(passwordSet);

      const biometricEnabledStatus = await isBiometricEnabled();
      setBiometricEnabledState(biometricEnabledStatus);

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking security status:', error);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters long');
      return;
    }

    try {
      await savePassword(newPassword);
      setPasswordExists(true);
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      Alert.alert('Success', 'Password has been set successfully');
    } catch (error) {
      console.error('Error setting password:', error);
      Alert.alert('Error', 'Failed to set password');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters long');
      return;
    }

    try {
      const storedPassword = await getPassword();
      if (storedPassword !== currentPassword) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      await savePassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      Alert.alert('Success', 'Password has been changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password');
    }
  };

  const handleRemovePassword = async () => {
    Alert.alert(
      'Remove Password',
      'Are you sure you want to remove your password? This will also disable biometric authentication.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePassword();
              await setBiometricEnabled(false);
              setPasswordExists(false);
              setBiometricEnabledState(false);
              Alert.alert('Success', 'Password has been removed');
            } catch (error) {
              console.error('Error removing password:', error);
              Alert.alert('Error', 'Failed to remove password');
            }
          },
        },
      ]
    );
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (!passwordExists) {
      Alert.alert('Error', 'Please set a password first before enabling biometric authentication');
      return;
    }

    if (!biometricAvailable) {
      Alert.alert('Error', 'Biometric authentication is not available on this device');
      return;
    }

    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric lock',
          fallbackLabel: 'Use passcode',
        });

        if (result.success) {
          await setBiometricEnabled(true);
          setBiometricEnabledState(true);
          Alert.alert('Success', 'Biometric authentication enabled');
        } else {
          Alert.alert('Failed', 'Authentication failed');
        }
      } catch (error) {
        console.error('Biometric error:', error);
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    } else {
      await setBiometricEnabled(false);
      setBiometricEnabledState(false);
      Alert.alert('Success', 'Biometric authentication disabled');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[commonStyles.container, { backgroundColor: themeColors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Password Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Password Protection</Text>
            <View style={[commonStyles.card, { backgroundColor: themeColors.card }]}>
              {!passwordExists ? (
                <>
                  <Text style={[styles.description, { color: themeColors.textSecondary }]}>
                    Set a password to secure your app. You&apos;ll be asked to enter this password when opening Friend2Lend.
                  </Text>
                  <Pressable
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => setShowPasswordSection(!showPasswordSection)}
                  >
                    <Text style={styles.buttonText}>
                      {showPasswordSection ? 'Cancel' : 'Set Password'}
                    </Text>
                  </Pressable>

                  {showPasswordSection && (
                    <View style={styles.passwordForm}>
                      <Text style={[styles.label, { color: themeColors.text }]}>New Password</Text>
                      <TextInput
                        style={[commonStyles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholder="Enter new password"
                        placeholderTextColor={themeColors.textSecondary}
                      />

                      <Text style={[styles.label, { color: themeColors.text }]}>Confirm Password</Text>
                      <TextInput
                        style={[commonStyles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="Confirm new password"
                        placeholderTextColor={themeColors.textSecondary}
                      />

                      <Pressable
                        style={[styles.button, { backgroundColor: colors.secondary }]}
                        onPress={handleSetPassword}
                      >
                        <Text style={styles.buttonText}>Save Password</Text>
                      </Pressable>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.statusRow}>
                    <View style={styles.statusLeft}>
                      <IconSymbol name="lock.fill" size={24} color={colors.secondary} />
                      <Text style={[styles.statusText, { color: themeColors.text }]}>Password is set</Text>
                    </View>
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.secondary} />
                  </View>

                  <View style={styles.buttonRow}>
                    <Pressable
                      style={[styles.smallButton, { backgroundColor: colors.primary }]}
                      onPress={() => setShowPasswordSection(!showPasswordSection)}
                    >
                      <Text style={styles.buttonText}>
                        {showPasswordSection ? 'Cancel' : 'Change Password'}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[styles.smallButton, { backgroundColor: colors.error }]}
                      onPress={handleRemovePassword}
                    >
                      <Text style={styles.buttonText}>Remove Password</Text>
                    </Pressable>
                  </View>

                  {showPasswordSection && (
                    <View style={styles.passwordForm}>
                      <Text style={[styles.label, { color: themeColors.text }]}>Current Password</Text>
                      <TextInput
                        style={[commonStyles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholder="Enter current password"
                        placeholderTextColor={themeColors.textSecondary}
                      />

                      <Text style={[styles.label, { color: themeColors.text }]}>New Password</Text>
                      <TextInput
                        style={[commonStyles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholder="Enter new password"
                        placeholderTextColor={themeColors.textSecondary}
                      />

                      <Text style={[styles.label, { color: themeColors.text }]}>Confirm New Password</Text>
                      <TextInput
                        style={[commonStyles.input, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="Confirm new password"
                        placeholderTextColor={themeColors.textSecondary}
                      />

                      <Pressable
                        style={[styles.button, { backgroundColor: colors.secondary }]}
                        onPress={handleChangePassword}
                      >
                        <Text style={styles.buttonText}>Update Password</Text>
                      </Pressable>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          {/* Biometric Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Biometric Authentication</Text>
            <View style={[commonStyles.card, { backgroundColor: themeColors.card }]}>
              <View style={styles.biometricRow}>
                <View style={styles.biometricLeft}>
                  <IconSymbol name="faceid" size={32} color={colors.primary} />
                  <View style={styles.biometricText}>
                    <Text style={[styles.biometricTitle, { color: themeColors.text }]}>
                      Face ID / Touch ID
                    </Text>
                    <Text style={[styles.biometricDescription, { color: themeColors.textSecondary }]}>
                      {!passwordExists
                        ? 'Set a password first to enable biometric authentication'
                        : !biometricAvailable
                        ? 'Not available on this device'
                        : biometricEnabled
                        ? 'Enabled - Use biometrics to unlock the app'
                        : 'Disabled - Use password to unlock the app'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  disabled={!passwordExists || !biometricAvailable}
                  trackColor={{ false: themeColors.border, true: colors.primary }}
                  thumbColor={biometricEnabled ? colors.card : themeColors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Info Section */}
          <View style={[commonStyles.card, { backgroundColor: themeColors.card }]}>
            <View style={styles.infoRow}>
              <IconSymbol name="info.circle" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
                Your password is stored securely on your device using the same encryption as other passwords on your phone.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordForm: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  biometricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  biometricText: {
    flex: 1,
  },
  biometricTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  biometricDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
