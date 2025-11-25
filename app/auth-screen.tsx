
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
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
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanAnimation = useState(new Animated.Value(1))[0];

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
        // Small delay to let the UI render first
        setTimeout(() => {
          handleBiometricAuth(true);
        }, 300);
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const startScanAnimation = () => {
    setIsScanning(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopScanAnimation = () => {
    setIsScanning(false);
    scanAnimation.stopAnimation();
    scanAnimation.setValue(1);
  };

  const handleBiometricAuth = async (isAutomatic = false) => {
    try {
      // Show scanning animation
      if (!isAutomatic) {
        startScanAnimation();
        // Add a short delay to show the scanning animation
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Friend2Lend',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true, // This prevents immediate passcode prompt
      });

      stopScanAnimation();
      console.log('Biometric authentication result:', result);

      if (result.success) {
        onAuthenticated();
      } else {
        if (result.error === 'user_cancel') {
          console.log('Biometric authentication cancelled by user');
        } else if (result.error === 'user_fallback') {
          // User chose to use password instead
          console.log('User chose to use password fallback');
        } else if (result.error === 'authentication_failed') {
          // Biometric authentication failed, but don't show alert on automatic attempt
          if (!isAutomatic) {
            Alert.alert(
              'Authentication Failed',
              'Biometric authentication failed. Please try again or use your password.',
              [{ text: 'OK' }]
            );
          }
        } else {
          console.log('Biometric authentication failed:', result.error);
          // For other errors, show a message
          if (!isAutomatic) {
            Alert.alert(
              'Authentication Error',
              'Unable to authenticate with biometrics. Please use your password.',
              [{ text: 'OK' }]
            );
          }
        }
      }
    } catch (error) {
      stopScanAnimation();
      console.error('Biometric authentication error:', error);
      if (!isAutomatic) {
        Alert.alert(
          'Error',
          'An error occurred during biometric authentication. Please use your password.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handlePasswordAuth = async () => {
    try {
      const storedPassword = await getPassword();
      
      if (password === storedPassword) {
        setPassword('');
        setAttempts(0);
        Keyboard.dismiss();
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsPasswordFocused(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <View style={styles.content}>
            {/* App Icon - positioned lower */}
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

            {/* Password Input - Only show when not focused on biometric */}
            {!isPasswordFocused && (
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <IconSymbol 
                    ios_icon_name="lock.fill" 
                    android_material_icon_name="lock" 
                    size={20} 
                    color={themeColors.textSecondary} 
                  />
                  <TextInput
                    style={[styles.input, { color: themeColors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Enter password"
                    placeholderTextColor={themeColors.textSecondary}
                    onSubmitEditing={handlePasswordAuth}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    autoFocus={false}
                  />
                </View>

                <Pressable
                  style={[styles.button, { backgroundColor: colors.primary, opacity: !password ? 0.5 : 1 }]}
                  onPress={handlePasswordAuth}
                  disabled={!password}
                >
                  <Text style={styles.buttonText}>Unlock</Text>
                </Pressable>
              </View>
            )}

            {/* Show password input when focused */}
            {isPasswordFocused && (
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <IconSymbol 
                    ios_icon_name="lock.fill" 
                    android_material_icon_name="lock" 
                    size={20} 
                    color={themeColors.textSecondary} 
                  />
                  <TextInput
                    style={[styles.input, { color: themeColors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Enter password"
                    placeholderTextColor={themeColors.textSecondary}
                    onSubmitEditing={handlePasswordAuth}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    autoFocus={true}
                  />
                </View>

                <Pressable
                  style={[styles.button, { backgroundColor: colors.primary, opacity: !password ? 0.5 : 1 }]}
                  onPress={handlePasswordAuth}
                  disabled={!password}
                >
                  <Text style={styles.buttonText}>Unlock</Text>
                </Pressable>
              </View>
            )}

            {/* Biometric Button */}
            {biometricEnabled && biometricAvailable && !isPasswordFocused && (
              <>
                <View style={styles.biometricContainer}>
                  <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                  <Text style={[styles.orText, { color: themeColors.textSecondary }]}>or</Text>
                  <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                </View>

                <Pressable
                  style={[styles.biometricButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                  onPress={() => handleBiometricAuth(false)}
                >
                  {isScanning ? (
                    <Animated.View style={{ opacity: scanAnimation }}>
                      <IconSymbol 
                        ios_icon_name="faceid" 
                        android_material_icon_name="fingerprint" 
                        size={32} 
                        color={colors.primary} 
                      />
                    </Animated.View>
                  ) : (
                    <IconSymbol 
                      ios_icon_name="faceid" 
                      android_material_icon_name="fingerprint" 
                      size={32} 
                      color={colors.primary} 
                    />
                  )}
                  <Text style={[styles.biometricText, { color: themeColors.text }]}>
                    {isScanning 
                      ? 'Scanning...' 
                      : Platform.OS === 'ios' 
                        ? 'Use Face ID / Touch ID' 
                        : 'Use Biometric'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    paddingBottom: 80,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#4A9FD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
    marginBottom: 48,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
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
    width: '100%',
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
