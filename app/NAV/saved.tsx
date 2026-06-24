import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import ClosetMasonryGrid from '@/components/ClosetMasonryGrid';
import { STATS_CLOSET_PLACEHOLDERS } from '@/constants/statsClosetItems';
import { LAYOUT, constrainedWidth, getConstrainedWidth } from '@/constants/layout';

const TAB_BAR_CLEARANCE = 108;

export default function SavedScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(getConstrainedWidth(windowWidth), constrainedWidth);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
  });

  const itemCount = STATS_CLOSET_PLACEHOLDERS.length;
  const categorySummary = useMemo(() => {
    const counts = { Tops: 0, Bottoms: 0, Shoes: 0, Accessories: 0 };
    for (const item of STATS_CLOSET_PLACEHOLDERS) {
      counts[item.category] += 1;
    }
    return counts;
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.innerWrapper, { width: contentWidth }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: TAB_BAR_CLEARANCE },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Your Closet</Text>
            <Text style={styles.subtitle}>
              {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} from your wardrobe
            </Text>
            <Text style={styles.meta}>
              {categorySummary.Tops} tops · {categorySummary.Bottoms} bottoms ·{' '}
              {categorySummary.Shoes} shoes · {categorySummary.Accessories} accessories
            </Text>
          </View>

          <ClosetMasonryGrid
            items={STATS_CLOSET_PLACEHOLDERS}
            horizontalPadding={LAYOUT.paddingHorizontal}
            maxContentWidth={contentWidth}
            gap={10}
            columnCount={2}
          />
        </ScrollView>
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
    maxWidth: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Caladea-Regular',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '500',
    color: 'rgba(168,179,255,0.75)',
  },
});
