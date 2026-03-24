import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';

import { LAYOUT, constrainedWidth, SCREEN_HEIGHT } from '@/constants/layout';

export default function LocationScreen() {
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);

  // Load Caladea fonts
  const [fontsLoaded] = useFonts({
    Caladea_400Regular,
    Caladea_700Bold,
  });

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  const handleEnableLocation = async () => {
    if (isRequesting) return;
    setIsRequesting(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        // Location permission granted, navigate to main app
        router.push('/(tabs)');
      } else {
        // Permission denied
        Alert.alert(
          'Location Access',
          'Location permission is needed to provide personalized outfit recommendations based on weather and local trends.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Allow{'\n'}Location?</Text>
            <Text style={styles.description}>
              We'll use your location to recommend outfits based on weather and explore local people around you.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnableLocation}
            activeOpacity={0.8}
            disabled={isRequesting}
          >
            <Text style={styles.enableButtonText}>
              {isRequesting ? 'Requesting...' : 'Enable Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LAYOUT.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: constrainedWidth,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: LAYOUT.paddingHorizontal,
    zIndex: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 180,
    paddingBottom: 60,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Caladea_400Regular',
    fontSize: 30,
    lineHeight: 35,
    color: '#C0D1FF',
    marginBottom: 24,
  },
  description: {
    fontFamily: 'Helvetica Neue',
    fontSize: 15,
    lineHeight: 18,
    color: '#B5AFA9',
    maxWidth: 287,
  },
  enableButton: {
    backgroundColor: '#A8B3FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});