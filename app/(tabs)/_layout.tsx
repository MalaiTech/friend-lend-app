
import React from 'react';
import { Platform, View, Text, Image, StyleSheet } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'house.fill',
      label: 'Dashboard',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'gear',
      label: 'Settings',
    },
  ];

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <Icon sf="house.fill" drawable="ic_home" />
          <Label>Dashboard</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf="gear" drawable="ic_settings" />
          <Label>Settings</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Custom header component
  const HeaderTitle = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerIconContainer}>
        <Image 
          source={require('@/assets/images/ad6209b2-efa8-49b8-89c3-bd81dff2c5ea.png')} 
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.headerTitle}>FriendLend</Text>
    </View>
  );

  return (
    <>
      <Stack
        screenOptions={{
          animation: 'none',
        }}
      >
        <Stack.Screen 
          name="(home)" 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="profile" 
          options={{
            headerShown: true,
            headerTitle: () => <HeaderTitle />,
            headerLargeTitle: false,
            headerTransparent: false,
            headerLeft: () => null,
          }}
        />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
});
