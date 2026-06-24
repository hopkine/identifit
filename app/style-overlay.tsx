import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  type ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useFonts, Caladea_700Bold } from '@expo-google-fonts/caladea';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import {
  STATS_CLOSET_PLACEHOLDERS,
  type ClosetCategory,
  type StatsClosetItem,
} from '@/constants/statsClosetItems';
import { useOOTD } from '@/hooks/useOOTD';
import type { OOTD } from '@/types/ootd';

type Category = ClosetCategory;
type ClosetItem = StatsClosetItem;

const inspirationImages = {
  forYou: [
    require('@/assets/images/recs/rec-white-halter-top-black-pants.png'),
    require('@/assets/images/recs/rec-striped-offshoulder-white-pants.png'),
    require('@/assets/images/recs/rec-mesh-tank-denim-shorts-cap.png'),
    require('@/assets/images/recs/rec-white-graphic-tee-black-wide-pants.png'),
    require('@/assets/images/recs/rec-black-tank-ruffle-hem-jeans.png'),
    require('@/assets/images/recs/rec-white-bucket-hat-black-skirt.png'),
    require('@/assets/images/recs/rec-cropped-knit-wide-jeans.png'),
  ],
  nearMe: [
    require('@/assets/images/near-me/01.png'),
    require('@/assets/images/near-me/02.png'),
    require('@/assets/images/near-me/03.png'),
    require('@/assets/images/near-me/04.png'),
  ],
} as const;

const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Shoes', 'Accessories'];

const CAROUSEL_CARD_WIDTH = 128;
const CAROUSEL_GAP = 14;
const CAROUSEL_SNAP_INTERVAL = CAROUSEL_CARD_WIDTH + CAROUSEL_GAP;

function clampIndex(raw: unknown, maxExclusive: number) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  const i = Math.floor(n);
  if (maxExclusive <= 0) return 0;
  return Math.max(0, Math.min(maxExclusive - 1, i));
}

function ootdHeroSource(ootd: OOTD) {
  const raw = ootd.cutoutImageUri ?? ootd.imageUri;
  if (raw == null) return null;
  return typeof raw === 'string' ? { uri: raw } : raw;
}

export default function StyleOverlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getOOTDById } = useOOTD();
  const [fontsLoaded] = useFonts({
    'Caladea-Bold': Caladea_700Bold,
  });
  const params = useLocalSearchParams<{
    imageSet?: 'forYou' | 'nearMe';
    imageIndex?: string;
    ootdId?: string;
  }>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const imageSet = params.imageSet === 'nearMe' ? 'nearMe' : 'forYou';
  const headerImages = inspirationImages[imageSet];
  const headerIndex = clampIndex(params.imageIndex, headerImages.length);

  const ootdFromFriend = React.useMemo(() => {
    const id = params.ootdId;
    if (typeof id !== 'string' || id.length === 0) return undefined;
    return getOOTDById(id);
  }, [params.ootdId, getOOTDById]);

  const headerImage = React.useMemo(() => {
    if (ootdFromFriend) {
      const src = ootdHeroSource(ootdFromFriend);
      if (src) return src;
    }
    if (typeof params.ootdId === 'string' && params.ootdId.length > 0) {
      return headerImages[0];
    }
    return headerImages[headerIndex];
  }, [
    ootdFromFriend,
    headerImages,
    headerIndex,
    params.ootdId,
  ]);

  const [category, setCategory] = React.useState<Category>('Tops');
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const [selectedByCategory, setSelectedByCategory] = React.useState<
    Record<Category, ClosetItem[]>
  >({
    Tops: [],
    Bottoms: [],
    Shoes: [],
    Accessories: [],
  });

  const suggestions = React.useMemo(
    () => STATS_CLOSET_PLACEHOLDERS.filter((x) => x.category === category),
    [category]
  );

  React.useEffect(() => {
    setCarouselIndex(0);
  }, [category]);

  const contentWidth = Math.min(windowWidth, constrainedWidth);
  const sheetWidth = contentWidth - LAYOUT.paddingHorizontal * 2;
  const sheetRadius = 26;

  const headerHeight = Math.min(400, Math.max(300, Math.round(windowHeight * 0.44)));

  const selected = selectedByCategory[category];
  const selectedSlots = 5;

  if (!fontsLoaded) {
    return null;
  }

  const toggleSelect = (item: ClosetItem) => {
    setSelectedByCategory((prev) => {
      const existing = prev[category];
      const already = existing.some((x) => x.id === item.id);
      if (already) {
        return {
          ...prev,
          [category]: existing.filter((x) => x.id !== item.id),
        };
      }
      if (existing.length >= selectedSlots) return prev;
      return {
        ...prev,
        [category]: [...existing, item],
      };
    });
  };

  const renderDot = (active: boolean) => (
    <View style={[styles.dot, active && styles.dotActive]} />
  );

  return (
    <View style={styles.backdrop}>
      <View style={[styles.stage, { width: contentWidth }]}>
        <View style={[styles.header, { height: headerHeight }]}>
          <Image source={headerImage} style={styles.headerImage} />
          <View style={[styles.headerTopRow, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.85}
              accessibilityLabel="Back"
            >
              <ChevronLeft size={26} color="#FFFFFF" strokeWidth={2.6} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              style={styles.createButton}
              activeOpacity={0.85}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerCategoryOverlay} pointerEvents="box-none">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.categoryRowOnPhoto}
            >
              {CATEGORIES.map((c) => {
                const active = c === category;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.categoryPillOnPhoto, active && styles.categoryPillOnPhotoActive]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[styles.categoryTextOnPhoto, active && styles.categoryTextOnPhotoActive]}
                      numberOfLines={1}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={[
            styles.sheetScrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.sheet,
              {
                width: sheetWidth,
                borderTopLeftRadius: sheetRadius,
                borderTopRightRadius: sheetRadius,
              },
            ]}
          >
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>Recreate using </Text>
              <Text style={styles.sheetTitleEmph}>your closet</Text>
            </View>

            <View style={styles.carouselWrap}>
              <FlatList
                data={suggestions}
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.carouselContent}
                snapToInterval={CAROUSEL_SNAP_INTERVAL}
                snapToAlignment="start"
                decelerationRate="fast"
                ItemSeparatorComponent={() => <View style={{ width: CAROUSEL_GAP }} />}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const next = Math.round(x / CAROUSEL_SNAP_INTERVAL);
                  setCarouselIndex(
                    Math.max(0, Math.min(suggestions.length - 1, next))
                  );
                }}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const next = Math.round(x / CAROUSEL_SNAP_INTERVAL);
                  setCarouselIndex(
                    Math.max(0, Math.min(suggestions.length - 1, next))
                  );
                }}
                renderItem={({ item }) => {
                  const isSelected = selected.some((x) => x.id === item.id);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.carouselCard,
                        isSelected && styles.carouselCardSelected,
                      ]}
                      activeOpacity={0.88}
                      onPress={() => toggleSelect(item)}
                    >
                      <Image
                        source={item.image}
                        style={styles.carouselImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  );
                }}
              />

              <View style={styles.dotsRow} pointerEvents="none">
                {suggestions.map((_, idx) => (
                  <React.Fragment key={idx}>
                    {renderDot(idx === carouselIndex)}
                  </React.Fragment>
                ))}
              </View>
            </View>

            <Text style={styles.selectedTitle}>Selected Items</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.selectedRowScroll}
            >
              {Array.from({ length: selectedSlots }).map((_, i) => {
                const item = selected[i];
                return (
                  <View key={i} style={styles.selectedSlot}>
                    {item ? (
                      <Image
                        source={item.image}
                        style={styles.selectedSlotImage}
                        resizeMode="contain"
                      />
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stage: {
    flex: 1,
    maxWidth: constrainedWidth,
  },
  header: {
    width: '100%',
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTopRow: {
    paddingHorizontal: LAYOUT.paddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCategoryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 14,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  categoryRowOnPhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  categoryPillOnPhoto: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  categoryPillOnPhotoActive: {
    backgroundColor: '#E8EBFF',
  },
  categoryTextOnPhoto: {
    fontSize: 13,
    fontFamily: 'Default',
    fontWeight: '600',
    color: '#111827',
  },
  categoryTextOnPhotoActive: {
    color: '#1e1b4b',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(225, 231, 255, 0.92)',
  },
  createButtonText: {
    fontSize: 15,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#111827',
    letterSpacing: 0.1,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    flexGrow: 1,
  },
  sheet: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#1c1c1e',
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sheetTitleEmph: {
    fontSize: 22,
    fontFamily: 'Caladea-Bold',
    fontStyle: 'italic',
    color: '#A8B3FF',
    letterSpacing: -0.3,
  },
  carouselWrap: {
    marginBottom: 14,
  },
  carouselContent: {
    paddingVertical: 4,
    paddingRight: 18,
  },
  carouselCard: {
    width: CAROUSEL_CARD_WIDTH,
    height: 128,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2c2c2e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  carouselCardSelected: {
    borderColor: '#A8B3FF',
    borderWidth: 2,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dotActive: {
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  selectedTitle: {
    fontSize: 17,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  selectedRowScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 4,
  },
  selectedSlot: {
    width: 64,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#2a2a2c',
    borderWidth: 1,
    borderColor: 'rgba(168,179,255,0.35)',
    overflow: 'hidden',
  },
  selectedSlotImage: {
    width: '100%',
    height: '100%',
  },
});

