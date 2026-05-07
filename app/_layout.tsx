import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { OOTDProvider } from '@/hooks/useOOTD';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <OOTDProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 350,
          contentStyle: { backgroundColor: '#1a1a1a' },
        }}>
        <Stack.Screen name="ONBOARDING" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="NAV"
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen
          name="style-overlay"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        <Stack.Screen
          name="memories"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen
          name="stats-report"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#121517' },
          }}
        />
        <Stack.Screen
          name="april-outfit-wrap"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
      </Stack>
      </OOTDProvider>
    </SafeAreaProvider>
  );
}