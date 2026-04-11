import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
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
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
} from '@expo-google-fonts/work-sans';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { constrainedWidth } from '@/constants/layout';
import { onboardingScreenStyles as os } from '@/constants/onboardingScreens';

const styleOptions = [
  'Y2K',
  'Casual',
  'Street',
  'Cottage',
  'Sporty',
  'Minimal',
  'Bold',
  'Layering',
  'Grunge',
  'Cozy',
  'Vintage',
  'Cyber',
  'Clean Girl',
  'Coquette',
];

export default function PersonalStyleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [customStyles, setCustomStyles] = useState<string[]>([]);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
    'WorkSans-Regular': WorkSans_400Regular,
    'WorkSans-Medium': WorkSans_500Medium,
    'WorkSans-SemiBold': WorkSans_600SemiBold,
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
    console.log('Continue pressed with styles:', selectedStyles);
    router.push('/NAV');
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSearchSubmit = () => {
    if (
      searchText.trim() &&
      !styleOptions.includes(searchText.trim()) &&
      !customStyles.includes(searchText.trim())
    ) {
      const newStyle = searchText.trim();
      setCustomStyles((prev) => [...prev, newStyle]);
      setSelectedStyles((prev) => [...prev, newStyle]);
      setSearchText('');
    }
  };

  const allStyles = [...styleOptions, ...customStyles];

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={os.container} edges={['top', 'left', 'right']}>
      <View style={[os.innerContainer, { width: constrainedWidth }]}>
        <View style={os.headerBar}>
          <TouchableOpacity
            style={os.backButton}
            onPress={handleBack}
            activeOpacity={0.6}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.6}>
            <Text style={os.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={os.content}
          contentContainerStyle={os.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={os.titleContainer}>
            <Text style={os.title}>Personal Style</Text>
            <Text style={os.subtitle}>
              This will help us identify your style and offer better outfit
              recommendations.
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="ex. balletcore"
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="done"
            />
          </View>

          <View style={styles.stylesContainer}>
            {allStyles.map((style, index) => (
              <TouchableOpacity
                key={`${style}-${index}`}
                style={[
                  styles.styleChip,
                  selectedStyles.includes(style) && styles.selectedStyleChip,
                ]}
                onPress={() => toggleStyle(style)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.styleChipText,
                    selectedStyles.includes(style) &&
                      styles.selectedStyleChipText,
                  ]}
                >
                  {style}
                </Text>
                {selectedStyles.includes(style) && (
                  <View style={styles.checkIcon}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View
          style={[
            os.bottomContainer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedStyles.length === 0 && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={selectedStyles.length > 0 ? 0.8 : 1}
            disabled={selectedStyles.length === 0}
          >
            <Text
              style={[
                styles.continueButtonText,
                selectedStyles.length === 0 && styles.continueButtonTextDisabled,
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
  searchContainer: {
    marginBottom: 32,
  },
  searchInput: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#4B5563',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  stylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  styleChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A4A4C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedStyleChip: {
    backgroundColor: '#A8B3FF',
    borderColor: '#A8B3FF',
  },
  styleChipText: {
    fontSize: 14,
    fontFamily: 'Default',
    color: '#C0D1FF',
  },
  selectedStyleChipText: {
    color: '#000000',
  },
  checkIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
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
  continueButtonText: {
    fontSize: 16,
    color: '#000000',
    letterSpacing: 0.2,
  },
  continueButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
  continueButtonTextDisabled: {
    color: '#8E8E93',
  },
});
