import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';

import { LAYOUT } from '@/constants/layout';
import { onboardingScreenStyles as os } from '@/constants/onboardingScreens';

const SLIDE_TRANSITION_DURATION = 280;
const GALLERY_TRANSITION_DURATION = 400;

export default function FeatureOverview() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Animated opacities for smooth slide crossfade (all images stay mounted = preloaded)
  const slideOpacities = useRef(
    [1, 0, 0, 0].map((v) => new Animated.Value(v))
  ).current;
  const galleryOpacities = useRef(
    [1, 0, 0].map((v) => new Animated.Value(v))
  ).current;

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
  });

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const safeW = Math.max(windowWidth, 1);
  const safeH = Math.max(windowHeight, 1);
  const maxContent =
    safeW >= 768 ? LAYOUT.contentMaxWidthDesktop : LAYOUT.contentMaxWidthMobile;
  const innerWidth = Math.min(maxContent, safeW);

  /** Web static export: opacity + useNativeDriver on Image/SVG layers often fails to paint. */
  const opacityNativeDriver = Platform.OS !== 'web';

  const galleryImages = [
    require('@/assets/images/onboarding-assets/Frame 121075726.png'),
    require('@/assets/images/onboarding-assets/Frame 121075729.png'),
    require('@/assets/images/onboarding-assets/Frame 121075728.png'),
  ];

  // Crossfade when slide changes
  useEffect(() => {
    slideOpacities.forEach((op, i) => {
      Animated.timing(op, {
        toValue: i === currentSlide ? 1 : 0,
        duration: SLIDE_TRANSITION_DURATION,
        useNativeDriver: opacityNativeDriver,
      }).start();
    });
  }, [currentSlide, opacityNativeDriver]);

  // Smooth crossfade when gallery image changes (slide 1)
  useEffect(() => {
    galleryOpacities.forEach((op, i) => {
      Animated.timing(op, {
        toValue: i === galleryIndex ? 1 : 0,
        duration: GALLERY_TRANSITION_DURATION,
        useNativeDriver: opacityNativeDriver,
      }).start();
    });
  }, [galleryIndex, opacityNativeDriver]);

  useEffect(() => {
    if (currentSlide === 1) {
      const interval = setInterval(() => {
        setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [currentSlide, galleryImages.length]);

  if (!fontsLoaded) {
    return null;
  }

  const slides = [
    {
      title: 'Track Your Style',
      description:
        "Upload your daily outfits (OOTD) to discover your style trends and see how much of your wardrobe you're actually using.",
      image: require('@/assets/images/Track_your_style.png'),
    },
    {
      title: 'Personalized Outfit Suggestions',
      description:
        'Get personalized outfit suggestions based on your preferences, weather, events, and the clothes you own.',
    },
    {
      title: 'Recreate Inspirations',
      description:
        'Find similar pieces in your wardrobe to recreate outfit inspirations you love from social media and fashion magazines.',
      image: require('@/assets/images/onboarding-assets/Group 121075721.png'),
    },
    {
      title: 'Monthly Style Recap',
      description:
        'Review your style journey with monthly recaps showing your most-worn pieces, color preferences, and style evolution.',
      image: require('@/assets/images/onboarding-assets/Group 121075722.png'),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/ONBOARDING/account');
    }
  };

  const handleSkip = () => {
    router.push('/NAV');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, { width: innerWidth, height: safeH }]}>
        <View style={[os.headerBar, os.headerBarSkipOnly]}>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.6}>
            <Text style={os.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* All images stay mounted (preloaded) - visibility via animated opacity for smooth crossfade */}
        <View style={styles.imageContainer} pointerEvents="none">
          {slides[0].image && (
            <Animated.View
              style={[styles.slideImageWrapper, { opacity: slideOpacities[0] }]}
              pointerEvents="none">
              <Image
                source={slides[0].image}
                style={styles.slideImage}
                resizeMode="contain"
              />
            </Animated.View>
          )}
          <Animated.View
            style={[
              styles.slideImageWrapper,
              { opacity: slideOpacities[1] },
              styles.galleryWrapper,
            ]}
            pointerEvents="none">
            <View style={styles.galleryContainer}>
              {galleryImages.map((image, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.galleryImage,
                    { opacity: galleryOpacities[index] },
                  ]}>
                  <Image
                    source={image}
                    style={styles.galleryImageInner}
                    resizeMode="contain"
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
          {slides[2].image && (
            <Animated.View
              style={[styles.slideImageWrapper, { opacity: slideOpacities[2] }]}
              pointerEvents="none">
              <Image
                source={slides[2].image}
                style={styles.slideImage}
                resizeMode="contain"
              />
            </Animated.View>
          )}
          {slides[3].image && (
            <Animated.View
              style={[styles.slideImageWrapper, { opacity: slideOpacities[3] }]}
              pointerEvents="none">
              <Image
                source={slides[3].image}
                style={styles.slideImage}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.textContent}>
            <Text style={styles.title}>{slides[currentSlide].title}</Text>
            <Text style={styles.description}>
              {slides[currentSlide].description}
            </Text>
          </View>

          <View style={styles.navigationContainer}>
            <View style={styles.dotsContainer}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentSlide
                      ? styles.dotActive
                      : styles.dotInactive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleNext}
              style={styles.nextButton}
              activeOpacity={0.8}
            >
              <ArrowRight size={24} color="#000000" />
            </TouchableOpacity>
          </View>
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
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImageWrapper: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width: 300,
    height: 300,
  },
  galleryWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryContainer: {
    width: 200,
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  galleryImageInner: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 60,
    left: LAYOUT.paddingHorizontal,
    right: LAYOUT.paddingHorizontal,
  },
  textContent: {
    marginBottom: 60,
  },
  title: {
    fontFamily: 'Caladea-Regular',
    fontSize: 32,
    lineHeight: 38,
    color: '#C0D1FF',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#B5AFA9',
    maxWidth: 335,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 32,
    backgroundColor: '#C0D1FF',
  },
  dotInactive: {
    width: 4,
    backgroundColor: 'rgba(192, 209, 255, 0.3)',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C0D1FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
