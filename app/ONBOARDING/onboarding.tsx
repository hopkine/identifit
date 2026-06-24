import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
  useFonts,
  Caladea_400Regular_Italic,
} from '@expo-google-fonts/caladea';
import { preloadOutfitGalleryImages } from '@/constants/outfitGalleryAssets';
import { LAYOUT, constrainedWidth, SCREEN_HEIGHT } from '@/constants/layout';
import BannerLogo from '@/components/BannerLogo';
import Sparkle from '@/components/Sparkle';

const PROGRESS_DURATION_MS = 4800;

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    preloadOutfitGalleryImages().catch(() => {});
  }, []);

  const [fontsLoaded] = useFonts({
    'Caladea-Italic': Caladea_400Regular_Italic,
  });
  const [progressLabel, setProgressLabel] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lastRoundedProgressRef = useRef(-1);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressListenerIdRef = useRef<string | undefined>(undefined);

  // Animated values
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  // Avoid scale 0 with SVG (layout / first-frame jank); still invisible at opacity 0.
  const starScale = useRef(new Animated.Value(0.01)).current;
  const starFloat = useRef(new Animated.Value(0)).current;

  const stopWelcomeProgressAndGo = (href: Href) => {
    if (navigateTimeoutRef.current) {
      clearTimeout(navigateTimeoutRef.current);
      navigateTimeoutRef.current = null;
    }
    if (progressListenerIdRef.current) {
      progressAnim.removeListener(progressListenerIdRef.current);
      progressListenerIdRef.current = undefined;
    }
    progressAnim.stopAnimation();
    router.replace(href);
  };

  useEffect(() => {
    if (!fontsLoaded) return;

    // Web: react-native-svg often does not paint inside Animated.View when useNativeDriver is true.
    const logoNativeDriver = Platform.OS !== 'web';

    // Start text fade-in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: logoNativeDriver,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: logoNativeDriver,
        }),
      ]).start();
    }, 400);

    // Show tagline
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1600);

    // Show star — run float loop after entrance so two animations aren’t fighting on first frames.
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(starOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(starScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(starFloat, {
              toValue: -5,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(starFloat, {
              toValue: 5,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, 2200);

    const progressListenerId = progressAnim.addListener(({ value }) => {
      const clamped = Math.min(100, Math.max(0, value));
      const rounded = Math.round(clamped);
      if (rounded !== lastRoundedProgressRef.current) {
        lastRoundedProgressRef.current = rounded;
        setProgressLabel(rounded);
      }
    });
    progressListenerIdRef.current = progressListenerId;

    Animated.timing(progressAnim, {
      toValue: 100,
      duration: PROGRESS_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (progressListenerIdRef.current === progressListenerId) {
        progressAnim.removeListener(progressListenerId);
        progressListenerIdRef.current = undefined;
      }
      if (finished) {
        setProgressLabel(100);
        navigateTimeoutRef.current = setTimeout(() => {
          router.replace('/ONBOARDING/login' as Href);
        }, 500);
      }
    });

    return () => {
      if (progressListenerIdRef.current) {
        progressAnim.removeListener(progressListenerIdRef.current);
        progressListenerIdRef.current = undefined;
      }
      progressAnim.stopAnimation();
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, [router, fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.centerContent}>
          {/* Text Logo */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={{
                opacity: textOpacity,
                transform: [{ scale: textScale }],
              }}
            >
              <View style={styles.bannerLogoBox}>
                <BannerLogo width={220} />
              </View>
            </Animated.View>

            {/* Sparkle Star */}
            <Animated.View
              style={[
                styles.star,
                {
                  opacity: starOpacity,
                  transform: [
                    { scale: starScale },
                    { translateY: starFloat },
                  ],
                },
              ]}
            >
              <Sparkle width={34} height={50} />
            </Animated.View>
          </View>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineTranslateY }],
              },
            ]}
          >
            capture your identity in every fit
          </Animated.Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.welcomeSkipRow}>
            <TouchableOpacity
              onPress={() =>
                stopWelcomeProgressAndGo('/ONBOARDING/login' as Href)
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go to sign in"
            >
              <Text style={styles.welcomeSkipLink}>Sign in</Text>
            </TouchableOpacity>
            <Text style={styles.welcomeSkipSep}>·</Text>
            <TouchableOpacity
              onPress={() => stopWelcomeProgressAndGo('/NAV' as Href)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Try the app without signing in"
            >
              <Text style={styles.welcomeSkipLinkEmphasis}>
                Try without signing in
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progressLabel}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: constrainedWidth,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLogoBox: {
    width: 220,
    height: (67 / 228) * 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    left: 136,
    top: -15,
  },
  starImage: {
    width: 50,
    height: 50,
  },
  tagline: {
    fontFamily: 'Caladea-Italic',
    fontSize: 15,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0,
    lineHeight: 22.5,
    marginBottom: 48,
    marginTop: 16,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 120,
    width: 280,
    alignItems: 'center',
  },
  welcomeSkipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  welcomeSkipLink: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeSkipSep: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 14,
  },
  welcomeSkipLinkEmphasis: {
    color: '#C0D1FF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C0D1FF',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '300',
    textAlign: 'center',
  },
});