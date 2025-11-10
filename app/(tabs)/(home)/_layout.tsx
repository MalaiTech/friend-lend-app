
import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: Platform.OS !== 'ios',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS !== 'ios',
          title: 'Home'
        }}
      />
    </Stack>
  );
}
