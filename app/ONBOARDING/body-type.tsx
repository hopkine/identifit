import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
} from '@expo-google-fonts/work-sans';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LAYOUT, constrainedWidth } from '@/constants/layout';

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
    image: require('@/assets/images/image 122.png'),
  },
  {
    id: 'triangle',
    name: 'Triangle',
    description: 'Hips are broader than shoulders',
    image: require('@/assets/images/image copy copy copy.png'),
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    description: 'Hips, shoulders & waist are the same proportion',
    image: require('@/assets/images/image (1).png'),
  },
  {
    id: 'oval',
    name: 'Oval',
    description: 'Hips & shoulders are narrower than waist',
    image: require('@/assets/images/image (2).png'),
  },
  {
    id: 'heart',
    name: 'Heart',
    description: 'Hips are narrower than shoulders',
    image: require('@/assets/images/image (3).png'),
  },
];

export default function BodyTypeScreen() {
  const router = useRouter();
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
    'WorkSans-Regular': WorkSans_400Regular,
    'WorkSans-Medium': WorkSans_500Medium,
    'WorkSans-SemiBold': WorkSans_600SemiBold,
  });

  const handleBack = () => {
    console.log('Back pressed');
    router.back();
  };

  const handleSkip = () => {
    console.log('Skip pressed');
    router.push('/NAV');
  };

  const handleContinue = () => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Continue pressed with selection:', selectedBodyType);
    router.push('/ONBOARDING/personal-style');
  };

  const handleBodyTypeSelect = (bodyTypeId: string) => {
    setSelectedBodyType(bodyTypeId);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.innerContainer, { width: constrainedWidth }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.6}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.6}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Body Type</Text>
          <Text style={styles.subtitle}>
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
                  <Text style={styles.optionDescription}>
                    {bodyType.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedBodyType && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={selectedBodyType ? 0.8 : 1}
          disabled={!selectedBodyType}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedBodyType && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
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
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Caladea-Regular',
    color: '#C0D1FF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    color: '#B5AFA9',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A4A4C',
    borderRadius: 12,
    padding: 16,
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
    fontFamily: 'Helvetica Neue',
    color: '#D9D9D9',
    lineHeight: 18,
  },
  bottomContainer: {
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 20,
  },
  continueButton: {
    backgroundColor: '#A8B3FF',
    paddingVertical: 16,
    borderRadius: 12,
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
  continueButtonDisabled: {
    backgroundColor: '#4A4A4C',
  },
  continueButtonText: {
    fontSize: 16,
    color: '#000000',
    letterSpacing: 0.2,
  },
  continueButtonTextDisabled: {
    color: '#8E8E93',
  },
});
