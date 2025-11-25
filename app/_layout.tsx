
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
import AuthScreen from './auth-screen';
import { hasPassword } from '@/utils/storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (loaded) {
      checkAuthStatus();
    }
  }, [loaded]);

  const checkAuthStatus = async () => {
    try {
      const passwordSet = await hasPassword();
      setNeedsAuth(passwordSet);
      
      // If no password is set, user is automatically authenticated
      if (!passwordSet) {
        setIsAuthenticated(true);
      }
      
      setCheckingAuth(false);
      SplashScreen.hideAsync();
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCheckingAuth(false);
      SplashScreen.hideAsync();
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
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SystemBars style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <AuthScreen onAuthenticated={handleAuthenticated} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SystemBars style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-loan"
            options={{
              presentation: 'modal',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="loan-detail"
            options={{
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="add-payment"
            options={{
              presentation: 'modal',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="currency-selector"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="metric-graph"
            options={{
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="security-settings"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Security',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
