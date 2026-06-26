import { Tabs } from 'expo-router';
import { House, Compass, Star } from 'lucide-react-native';
import { LAYOUT } from '@/constants/layout';
import ProfileTabIcon from '@/components/ProfileTabIcon';
import SavedTabIcon from '@/components/SavedTabIcon';

export default function NavJsTabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: LAYOUT.navScreenBackground,
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#C0D1FF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
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
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
