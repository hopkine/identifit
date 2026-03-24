import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Caladea_400Regular, Caladea_700Bold } from '@expo-google-fonts/caladea';
import { WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold } from '@expo-google-fonts/work-sans';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useOOTD } from '@/hooks/useOOTD';
import { currentUser } from '@/data/ootd';
import { LAYOUT, constrainedWidth, SCREEN_HEIGHT } from '@/constants/layout';

export default function OnboardingScreen() {
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
    'WorkSans-Regular': WorkSans_400Regular,
    'WorkSans-Medium': WorkSans_500Medium,
    'WorkSans-SemiBold': WorkSans_600SemiBold,
  });

  const handleContinue = () => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/ONBOARDING/body-type');
  };

  const handleSkip = () => {
    console.log('Skip pressed');
    router.push('/NAV');
  };

  if (!fontsLoaded) {
    return null;
  }
    
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.innerContainer, { width: constrainedWidth, minHeight: SCREEN_HEIGHT }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hi {currentUser.name.split(' ')[0]},{"\n"}let's get your identifit set up.</Text>
          <Text style={styles.subtitle}>
            We'll dive into your style for your best fit!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.6}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LAYOUT.backgroundColor,
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingVertical: 60,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greeting: {
  fontSize: 25,
  fontWeight: '400',
  fontFamily: 'Caladea-Regular',
  color: '#C0D1FF',
  textAlign: 'center',
  marginBottom: 20,
  lineHeight: 29, // 115% of font size
},
  subtitle: {
    fontSize: 16,
    color: '#B5AFA9',
    textAlign: 'center',
    fontFamily: 'Helvetica Neue',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#A8B3FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.2,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    color: '#FFFFFF',
  },
});