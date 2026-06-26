import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { OOTDProvider } from '@/hooks/useOOTD';

const modalStackOptions =
  Platform.OS === 'ios'
    ? ({
        presentation: 'formSheet' as const,
        contentStyle: { backgroundColor: '#000000' },
      } as const)
    : ({
        animation: 'slide_from_right' as const,
        contentStyle: { backgroundColor: '#000000' },
      } as const);

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
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
            <Stack.Screen name="style-overlay" options={{ headerShown: false, ...modalStackOptions }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            <Stack.Screen name="memories" options={{ headerShown: false, ...modalStackOptions }} />
            <Stack.Screen
              name="stats-report"
              options={{
                headerShown: false,
                ...(Platform.OS === 'ios'
                  ? { presentation: 'formSheet' as const, contentStyle: { backgroundColor: '#121517' } }
                  : { animation: 'slide_from_right' as const, contentStyle: { backgroundColor: '#121517' } }),
              }}
            />
            <Stack.Screen name="april-outfit-wrap" options={{ headerShown: false, ...modalStackOptions }} />
          </Stack>
        </OOTDProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
