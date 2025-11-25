
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { getPassword } from '@/utils/storage';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const themeColors = useThemeColors();
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);

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

            {/* Password Input */}
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
                  autoFocus={false}
                />
              </View>

              <Pressable
                style={[styles.button, { backgroundColor: '#4A9FD8', opacity: !password ? 0.5 : 1 }]}
                onPress={handlePasswordAuth}
                disabled={!password}
              >
                <Text style={styles.buttonText}>Unlock</Text>
              </Pressable>
            </View>
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
});
