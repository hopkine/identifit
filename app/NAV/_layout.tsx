import { Tabs } from 'expo-router';
import { House, Compass, Star, Users } from 'lucide-react-native';
import { Platform } from 'react-native';
import ProfileTabIcon from '@/components/ProfileTabIcon';
import SavedTabIcon from '@/components/SavedTabIcon';
import TabBarGlassBackground from '@/components/TabBarGlassBackground';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <TabBarGlassBackground />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#C0D1FF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
        ...(Platform.OS === 'ios' ? { tabBarTranslucent: true } : {}),
      }}>
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ size, color }) => (
            <SavedTabIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Star size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ size, color }) => (
            <House size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Compass size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ size, color }) => (
            <ProfileTabIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="links"
        options={{
          href: null,
          tabBarIcon: ({ size, color }) => (
            <House size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          href: null,
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
