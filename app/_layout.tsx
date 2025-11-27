
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import AuthScreen from './auth-screen';
import { hasPassword } from '@/utils/storage';
import { colors } from '@/styles/commonStyles';

SplashScreen.preventAutoHideAsync();

// Force light theme - custom theme based on DefaultTheme
const ForcedLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Force light background color at system level
    SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  useEffect(() => {
    if (loaded) {
      checkAuthStatus();
    }
  }, [loaded]);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      const passwordSet = await hasPassword();
      console.log('Password set:', passwordSet);
      
      setNeedsAuth(passwordSet);
      
      // If no password is set, user is automatically authenticated
      if (!passwordSet) {
        setIsAuthenticated(true);
      }
      
      setCheckingAuth(false);
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('Error checking security status:', error);
      // On error, assume no password is set and allow access
      setNeedsAuth(false);
      setIsAuthenticated(true);
      setCheckingAuth(false);
      await SplashScreen.hideAsync();
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!loaded || checkingAuth) {
    return null;
  }

  // Show auth screen if password is set and user is not authenticated
  if (needsAuth && !isAuthenticated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={ForcedLightTheme}>
          <SystemBars style="dark" />
          <AuthScreen onAuthenticated={handleAuthenticated} />
          <StatusBar style="dark" />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={ForcedLightTheme}>
        <SystemBars style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-loan"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
          <Stack.Screen
            name="loan-detail"
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
          <Stack.Screen
            name="add-payment"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
          <Stack.Screen
            name="currency-selector"
            options={{
              presentation: 'modal',
              headerShown: false,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
          <Stack.Screen
            name="metric-graph"
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
          <Stack.Screen
            name="security-settings"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Security',
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
          <Stack.Screen
            name="privacy-policy"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Privacy Policy',
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
