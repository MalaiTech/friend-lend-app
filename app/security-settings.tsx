
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import {
  savePassword,
  deletePassword,
  hasPassword,
  getPassword,
} from '@/utils/storage';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const [passwordExists, setPasswordExists] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      console.log('Checking security status in settings...');
      const passwordSet = await hasPassword();
      console.log('Password exists:', passwordSet);
      setPasswordExists(passwordSet);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking security status:', error);
      // On error, assume no password exists
      setPasswordExists(false);
      setIsLoading(false);
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
      Alert.alert('Success', 'Password has been set successfully. You will need to enter this password when opening the app.');
    } catch (error) {
      console.error('Error setting password:', error);
      Alert.alert('Error', 'Failed to set password. Please try again.');
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
      Alert.alert('Error', 'Failed to change password. Please try again.');
    }
  };

  const handleRemovePassword = async () => {
    Alert.alert(
      'Remove Password',
      'Are you sure you want to remove your password? The app will no longer require authentication on startup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePassword();
              setPasswordExists(false);
              Alert.alert('Success', 'Password has been removed. The app will no longer require authentication.');
            } catch (error) {
              console.error('Error removing password:', error);
              Alert.alert('Error', 'Failed to remove password. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Security Settings',
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            ),
          }}
        />
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
          <View style={[commonStyles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: colors.text }}>Loading...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Security Settings',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Password Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Password Protection</Text>
              <View style={[commonStyles.card, { backgroundColor: colors.card }]}>
                {!passwordExists ? (
                  <>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
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
                        <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                        <TextInput
                          style={[commonStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry
                          placeholder="Enter new password"
                          placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                        <TextInput
                          style={[commonStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry
                          placeholder="Confirm new password"
                          placeholderTextColor={colors.textSecondary}
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
                        <IconSymbol 
                          ios_icon_name="lock.fill" 
                          android_material_icon_name="lock" 
                          size={24} 
                          color={colors.secondary} 
                        />
                        <Text style={[styles.statusText, { color: colors.text }]}>Password is set</Text>
                      </View>
                      <IconSymbol 
                        ios_icon_name="checkmark.circle.fill" 
                        android_material_icon_name="check_circle" 
                        size={24} 
                        color={colors.secondary} 
                      />
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
                        <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
                        <TextInput
                          style={[commonStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          secureTextEntry
                          placeholder="Enter current password"
                          placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                        <TextInput
                          style={[commonStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry
                          placeholder="Enter new password"
                          placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
                        <TextInput
                          style={[commonStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry
                          placeholder="Confirm new password"
                          placeholderTextColor={colors.textSecondary}
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

            {/* Info Section */}
            <View style={[commonStyles.card, { backgroundColor: colors.card }]}>
              <View style={styles.infoRow}>
                <IconSymbol 
                  ios_icon_name="info.circle" 
                  android_material_icon_name="info" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Your password is stored securely on your device using the same encryption as other passwords on your phone.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: '600',
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
