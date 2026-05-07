import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { House } from 'lucide-react-native';
import { LAYOUT } from '@/constants/layout';

export default function LinksScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <House size={64} color="#8B7CF6" />
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Your style dashboard</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LAYOUT.navScreenBackground,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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