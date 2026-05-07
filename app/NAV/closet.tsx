import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Shirt } from 'lucide-react-native';
import { LAYOUT, constrainedWidth } from '@/constants/layout';

export default function ClosetScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerWrapper}>
      <View style={styles.content}>
        <Shirt size={64} color="#8B7CF6" />
        <Text style={styles.title}>Your Closet</Text>
        <Text style={styles.subtitle}>Organize and manage your wardrobe</Text>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LAYOUT.navScreenBackground,
    alignItems: 'center',
  },
  innerWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: constrainedWidth,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: LAYOUT.paddingHorizontal,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});