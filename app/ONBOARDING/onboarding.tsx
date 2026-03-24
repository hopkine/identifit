import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LAYOUT, constrainedWidth, SCREEN_HEIGHT } from '@/constants/layout';

export default function Welcome() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated values
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(0)).current;
  const starFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start text fade-in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
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

    // Show star
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
      ]).start();

      // Start floating animation
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
    }, 2200);

    // Progress bar
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          navigateTimeoutRef.current = setTimeout(() => {
            router.push('/ONBOARDING/feature-overview');
          }, 500);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, [router]);

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
              <Image
                source={require('@/assets/images/identifit.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Vector Star */}
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
              <Image
                source={require('@/assets/images/Star.png')}
                style={styles.starImage}
                resizeMode="contain"
              />
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
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
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
  logo: {
    width: 220,
    height: 76,
  },
  star: {
    position: 'absolute',
    left: 128,
    top: -15,
  },
  starImage: {
    width: 50,
    height: 50,
  },
  tagline: {
    fontFamily: 'Caladea-Italic',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    fontStyle: 'italic',
    marginTop: 16,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 120,
    width: 280,
    alignItems: 'center',
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