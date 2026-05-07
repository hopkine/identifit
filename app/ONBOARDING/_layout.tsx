import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 350,
        contentStyle: { backgroundColor: '#1a1a1a' },
      }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="feature-overview" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="username" options={{ headerShown: false }} />
      <Stack.Screen name="body-type" options={{ headerShown: false }} />
      <Stack.Screen name="personal-style" options={{ headerShown: false }} />
    </Stack>
  );
}