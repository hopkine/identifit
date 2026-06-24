import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { LAYOUT } from '@/constants/layout';

function canUseLiquidGlass(): boolean {
  return (
    Platform.OS === 'ios' &&
    isGlassEffectAPIAvailable() &&
    isLiquidGlassAvailable()
  );
}

export default function TabBarGlassBackground() {
  if (canUseLiquidGlass()) {
    return (
      <GlassView
        style={StyleSheet.absoluteFill}
        glassEffectStyle="regular"
        colorScheme="dark"
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={72}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: LAYOUT.navScreenBackground },
      ]}
    />
  );
}
