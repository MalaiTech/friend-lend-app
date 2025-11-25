
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors, useThemeColors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { getPassword, isBiometricEnabled } from '@/utils/storage';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const themeColors = useThemeColors();
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    checkBiometricAndAuthenticate();
  }, []);

  const checkBiometricAndAuthenticate = async () => {
    try {
      const biometricEnabledStatus = await isBiometricEnabled();
      setBiometricEnabledState(biometricEnabledStatus);

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = compatible && enrolled;
      setBiometricAvailable(available);

      // If biometric is enabled and available, try to authenticate automatically
      if (biometricEnabledStatus && available) {
        setTimeout(() => {
          handleBiometricAuth();
        }, 500);
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Friend2Lend',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        onAuthenticated();
      } else {
        console.log('Biometric authentication failed');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
    }
  };

  const handlePasswordAuth = async () => {
    try {
      const storedPassword = await getPassword();
      
      if (password === storedPassword) {
        setPassword('');
        setAttempts(0);
        onAuthenticated();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          Alert.alert(
            'Too Many Attempts',
            'You have entered an incorrect password too many times. Please try again later.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Incorrect Password', `Please try again. ${3 - newAttempts} attempts remaining.`);
        }
        setPassword('');
      }
    } catch (error) {
      console.error('Error authenticating:', error);
      Alert.alert('Error', 'Failed to authenticate. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require('@/assets/images/ab4803b4-93b1-436f-91c4-71c8950562eb.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          {/* App Name */}
          <Text style={[styles.appName, { color: themeColors.text }]}>Friend2Lend</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Enter your password to continue
          </Text>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <IconSymbol name="lock.fill" size={20} color={themeColors.textSecondary} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter password"
                placeholderTextColor={themeColors.textSecondary}
                onSubmitEditing={handlePasswordAuth}
                autoFocus={!biometricEnabled}
              />
            </View>

            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handlePasswordAuth}
              disabled={!password}
            >
              <Text style={styles.buttonText}>Unlock</Text>
            </Pressable>
          </View>

          {/* Biometric Button */}
          {biometricEnabled && biometricAvailable && (
            <View style={styles.biometricContainer}>
              <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
              <Text style={[styles.orText, { color: themeColors.textSecondary }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
            </View>
          )}

          {biometricEnabled && biometricAvailable && (
            <Pressable
              style={[styles.biometricButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={handleBiometricAuth}
            >
              <IconSymbol name="faceid" size={32} color={colors.primary} />
              <Text style={[styles.biometricText, { color: themeColors.text }]}>
                Use Face ID / Touch ID
              </Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#4A9FD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  appIcon: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 14,
    marginHorizontal: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
