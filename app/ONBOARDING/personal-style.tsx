import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
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
    console.log('Skip pressed');
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
          <Text style={styles.title}>Personal Style</Text>
          <Text style={styles.subtitle}>
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

      <View style={styles.bottomContainer}>
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
    paddingTop: 10,
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
  bottomContainer: {
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingBottom: 34,
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
