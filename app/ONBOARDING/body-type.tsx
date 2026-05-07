import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import * as Haptics from 'expo-haptics';
import { constrainedWidth } from '@/constants/layout';
import {
  onboardingScreenStyles as os,
  ONBOARDING_IN_FLOW_TOP as flowTop,
} from '@/constants/onboardingScreens';

/** San Francisco on iOS (`fontFamily: 'System'`); unused on other platforms. */
const iosNativeFont =
  Platform.OS === 'ios' ? ({ fontFamily: 'System' } as const) : null;

interface BodyType {
  id: string;
  name: string;
  description: string;
  image: any;
}

const bodyTypes: BodyType[] = [
  {
    id: 'hourglass',
    name: 'Hourglass',
    description: 'Waist is the narrowest part of frame',
    image: require('@/assets/images/body-type/Hourglass.png'),
  },
  {
    id: 'triangle',
    name: 'Triangle',
    description: 'Hips are broader than shoulders',
    image: require('@/assets/images/body-type/Triangle.png'),
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    description: 'Hips, shoulders & waist are the same proportion',
    image: require('@/assets/images/body-type/Rectangle.png'),
  },
  {
    id: 'oval',
    name: 'Oval',
    description: 'Hips & shoulders are narrower than waist',
    image: require('@/assets/images/body-type/Oval.png'),
  },
  {
    id: 'heart',
    name: 'Heart',
    description: 'Hips are narrower than shoulders',
    image: require('@/assets/images/body-type/Heart.png'),
  },
];

export default function BodyTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(24)).current;
  const ctaScale = useRef(new Animated.Value(0.94)).current;
  const hasShownCta = useRef(false);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
  });

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.push('/NAV');
  };

  const handleContinue = () => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/ONBOARDING/personal-style');
  };

  const handleBodyTypeSelect = (bodyTypeId: string) => {
    setSelectedBodyType(bodyTypeId);
  };

  useEffect(() => {
    if (!selectedBodyType) {
      return;
    }
    if (hasShownCta.current) {
      return;
    }
    hasShownCta.current = true;
    ctaOpacity.setValue(0);
    ctaTranslateY.setValue(24);
    ctaScale.setValue(0.94);
    Animated.parallel([
      Animated.spring(ctaOpacity, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }),
      Animated.spring(ctaTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 16,
        stiffness: 280,
      }),
      Animated.spring(ctaScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        stiffness: 280,
      }),
    ]).start();
  }, [selectedBodyType]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={os.container} edges={['top', 'left', 'right']}>
      <View style={[os.innerContainer, { width: constrainedWidth }]}>
        <View style={[os.content, styles.mainContent]}>
          <View style={[os.headerBarInFlow, styles.headerBarShiftUp]}>
            <TouchableOpacity
              style={os.backButton}
              onPress={handleBack}
              activeOpacity={0.6}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={os.skipButton}
              onPress={handleSkip}
              activeOpacity={0.6}
            >
              <Text style={os.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <View style={os.titleContainer}>
            <Text style={os.title}>Body Type</Text>
            <Text style={os.subtitle}>
              This will help us offer better recommendations based on your body
              type.
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {bodyTypes.map((bodyType) => (
              <TouchableOpacity
                key={bodyType.id}
                style={[
                  styles.optionCard,
                  selectedBodyType === bodyType.id && styles.selectedOptionCard,
                ]}
                onPress={() => handleBodyTypeSelect(bodyType.id)}
                activeOpacity={0.8}
              >
                <View style={styles.optionContent}>
                  <View style={styles.imageContainer}>
                    <Image source={bodyType.image} style={styles.bodyImage} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>{bodyType.name}</Text>
                    <Text style={[styles.optionDescription, iosNativeFont]}>
                      {bodyType.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedBodyType ? (
          <Animated.View
            style={[
              os.bottomContainer,
              {
                paddingBottom: Math.max(insets.bottom, 12),
              },
              styles.bottomBar,
              {
                opacity: ctaOpacity,
                transform: [{ translateY: ctaTranslateY }, { scale: ctaScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.75}
            >
              <Text style={[styles.continueButtonText, iosNativeFont]}>
                Continue
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBarShiftUp: {
    marginTop: flowTop.headerShiftMarginTop,
    marginBottom: flowTop.headerShiftMarginBottom,
  },
  mainContent: {
    flex: 1,
    paddingTop: flowTop.scrollPaddingTop,
    paddingBottom: 32,
  },
  optionsContainer: {
    gap: 14,
  },
  optionCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A4A4C',
    borderRadius: 14,
    padding: 14,
  },
  selectedOptionCard: {
    borderColor: '#A8B3FF',
    backgroundColor: 'rgba(168, 179, 255, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bodyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Caladea-Regular',
    color: '#C0D1FF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'Caladea-Regular',
    color: '#D9D9D9',
    lineHeight: 18,
  },
  bottomBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  continueButton: {
    width: '100%',
    minHeight: 52,
    backgroundColor: '#A8B3FF',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Caladea-Regular',
    color: '#000000',
    letterSpacing: 0.2,
  },
});
