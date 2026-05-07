import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Search } from 'lucide-react-native';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import { LAYOUT, constrainedWidth, getConstrainedWidth } from '@/constants/layout';
import {
  MONTHLY_WRAP_LISTINGS,
  type MonthlyWrapListing,
} from '@/constants/statsReport';

const BG = '#121517';
const SURFACE_SEARCH = '#1E2224';
const SUBTITLE = '#87888B';
const MONTH_BLUE = '#7AA4BC';
const CARD_CORNER = 14;
const CARD_W = 168;
const CARD_GAP = 14;

const APRIL_PREVIEW = {
  shirt: require('@/assets/images/april-wrap/shirt.png'),
  whiteSkirt: require('@/assets/images/april-wrap/white-skirt.png'),
  slippers: require('@/assets/images/april-wrap/slippers.png'),
  lookFullbody: require('@/assets/images/april-wrap/look-fullbody.png'),
  mirrorSelfie: require('@/assets/images/april-wrap/mirror-selfie.png'),
  checkeredSkirt: require('@/assets/images/april-wrap/checkered-skirt.png'),
};

function AprilMiniPreview({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size, backgroundColor: '#000000' }}>
      <Image
        source={APRIL_PREVIEW.shirt}
        style={[styles.aprilPrevAsset, { left: size * 0.02, top: size * 0.02, width: size * 0.46, height: size * 0.48, zIndex: 1 }]}
        resizeMode="contain"
      />
      <Image
        source={APRIL_PREVIEW.whiteSkirt}
        style={[styles.aprilPrevAsset, { right: -size * 0.02, top: -size * 0.02, width: size * 0.48, height: size * 0.52, zIndex: 2 }]}
        resizeMode="contain"
      />
      <Image
        source={APRIL_PREVIEW.lookFullbody}
        style={[styles.aprilPrevAsset, { left: -size * 0.10, top: size * 0.20, width: size * 0.70, height: size * 0.86, zIndex: 3 }]}
        resizeMode="contain"
      />
      <Image
        source={APRIL_PREVIEW.checkeredSkirt}
        style={[styles.aprilPrevAsset, { right: -size * 0.04, top: size * 0.34, width: size * 0.56, height: size * 0.60, zIndex: 4, transform: [{ rotate: '-12deg' }] }]}
        resizeMode="contain"
      />
      <Image
        source={APRIL_PREVIEW.slippers}
        style={[styles.aprilPrevAsset, { right: size * 0.06, bottom: size * 0.05, width: size * 0.42, height: size * 0.26, zIndex: 5 }]}
        resizeMode="contain"
      />
      <Image
        source={APRIL_PREVIEW.mirrorSelfie}
        style={[styles.aprilPrevAsset, { left: size * 0.06, bottom: -size * 0.10, width: size * 0.44, height: size * 0.56, zIndex: 6 }]}
        resizeMode="contain"
      />
    </View>
  );
}

function groupByYear(items: MonthlyWrapListing[]) {
  const map = new Map<string, MonthlyWrapListing[]>();
  for (const item of items) {
    const y = item.yearGroup;
    const list = map.get(y) ?? [];
    list.push(item);
    map.set(y, list);
  }
  const years = [...map.keys()].sort((a, b) => Number(b) - Number(a));
  return years.map((year) => ({ year, wraps: map.get(year) ?? [] }));
}

export default function StatsReportScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(getConstrainedWidth(windowWidth), constrainedWidth);
  const [query, setQuery] = useState('');

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
  });

  const sections = useMemo(() => groupByYear(MONTHLY_WRAP_LISTINGS), []);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map(({ year, wraps }) => ({
        year,
        wraps: wraps.filter(
          (w) =>
            w.monthAccent.toLowerCase().includes(q) ||
            w.titleAccent.toLowerCase().includes(q) ||
            year.includes(q)
        ),
      }))
      .filter((s) => s.wraps.length > 0);
  }, [sections, query]);

  if (!fontsLoaded) {
    return null;
  }

  const openWrap = (item: MonthlyWrapListing) => {
    if (!item.hasStory) return;
    if (!item.storyPath) return;
    router.push(item.storyPath);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          {
            paddingBottom: 28 + insets.bottom,
            maxWidth: contentW,
            alignSelf: 'center',
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={26} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Stats Report</Text>
            <Text style={styles.subtitle}>Your Monthly Outfits, Wrapped Up</Text>
          </View>
        </View>

        <View style={styles.searchShell}>
          <Search size={18} color={SUBTITLE} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="rgba(135, 136, 139, 0.75)"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search reports"
          />
        </View>

        {filteredSections.length === 0 ? (
          <Text style={styles.emptyHint}>No reports match “{query.trim()}”.</Text>
        ) : (
          filteredSections.map(({ year, wraps }) => (
            <View key={year} style={styles.yearSection}>
              <Text style={styles.yearHeading}>{year}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselRow}
              >
                {wraps.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.wrapCard,
                      { width: CARD_W },
                      !item.hasStory && styles.wrapCardDisabled,
                    ]}
                    activeOpacity={item.hasStory ? 0.88 : 1}
                    disabled={!item.hasStory}
                    onPress={() => openWrap(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.monthAccent} ${item.titleAccent}`}
                  >
                    {item.storyPath === '/april-outfit-wrap' ? (
                      <AprilMiniPreview size={CARD_W} />
                    ) : (
                      <Image
                        source={item.thumbnail}
                        style={styles.wrapThumb}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.wrapFooter}>
                      <Text style={styles.monthOnCard}>{item.monthAccent}</Text>
                      <Text style={styles.titleOnCard}>{item.titleAccent}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollInner: {
    width: '100%',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 22,
  },
  backBtn: {
    marginTop: 2,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: 'Caladea-Bold',
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    lineHeight: 36,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 15,
    fontWeight: '400',
    color: SUBTITLE,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SURFACE_SEARCH,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#E8E9EA',
    paddingVertical: Platform.OS === 'android' ? 4 : 0,
  },
  yearSection: {
    marginBottom: 26,
  },
  yearHeading: {
    fontFamily: 'Caladea-Regular',
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  carouselRow: {
    gap: CARD_GAP,
    paddingRight: 8,
    paddingVertical: 2,
  },
  wrapCard: {
    borderRadius: CARD_CORNER,
    overflow: 'hidden',
    backgroundColor: '#ECEBE8',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  wrapCardDisabled: {
    opacity: 0.45,
  },
  wrapThumb: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EDEDED',
  },
  aprilPrevAsset: {
    position: 'absolute',
  },
  wrapFooter: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#F7F7F5',
    minHeight: 72,
  },
  monthOnCard: {
    fontFamily: 'Caladea-Regular',
    fontSize: 17,
    color: MONTH_BLUE,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  titleOnCard: {
    fontFamily: 'Caladea-Bold',
    fontSize: 15,
    color: BG,
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  emptyHint: {
    marginTop: 24,
    fontSize: 15,
    color: SUBTITLE,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
