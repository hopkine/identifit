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
import { ChevronLeft } from 'lucide-react-native';
import { useFonts, Caladea_700Bold } from '@expo-google-fonts/caladea';
import { LAYOUT, constrainedWidth } from '@/constants/layout';

type Category = 'Tops' | 'Bottoms' | 'Shoes' | 'Accessories';

type ClosetItem = {
  id: string;
  category: Category;
  image: ImageSourcePropType;
  label?: string;
};

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

// Stubbed “closet” suggestions. This is intentionally simple for now — we’ll swap
// in your real closet inventory + similarity scoring next.
const CLOSET_SUGGESTIONS: ClosetItem[] = [
  { id: 'top-1', category: 'Tops', image: require('@/assets/images/recs/rec-white-halter-top-black-pants.png') },
  { id: 'top-2', category: 'Tops', image: require('@/assets/images/recs/rec-white-graphic-tee-black-wide-pants.png') },
  { id: 'top-3', category: 'Tops', image: require('@/assets/images/recs/rec-mesh-tank-denim-shorts-cap.png') },
  { id: 'bottom-1', category: 'Bottoms', image: require('@/assets/images/recs/rec-black-tank-ruffle-hem-jeans.png') },
  { id: 'bottom-2', category: 'Bottoms', image: require('@/assets/images/recs/rec-white-bucket-hat-black-skirt.png') },
  { id: 'bottom-3', category: 'Bottoms', image: require('@/assets/images/recs/rec-cropped-knit-wide-jeans.png') },
  { id: 'shoes-1', category: 'Shoes', image: require('@/assets/images/near-me/01.png') },
  { id: 'shoes-2', category: 'Shoes', image: require('@/assets/images/near-me/02.png') },
  { id: 'acc-1', category: 'Accessories', image: require('@/assets/images/near-me/03.png') },
  { id: 'acc-2', category: 'Accessories', image: require('@/assets/images/near-me/04.png') },
];

function clampIndex(raw: unknown, maxExclusive: number) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  const i = Math.floor(n);
  if (maxExclusive <= 0) return 0;
  return Math.max(0, Math.min(maxExclusive - 1, i));
}

export default function StyleOverlayScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Caladea-Bold': Caladea_700Bold,
  });
  const params = useLocalSearchParams<{
    imageSet?: 'forYou' | 'nearMe';
    imageIndex?: string;
  }>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const imageSet = params.imageSet === 'nearMe' ? 'nearMe' : 'forYou';
  const headerImages = inspirationImages[imageSet];
  const headerIndex = clampIndex(params.imageIndex, headerImages.length);
  const headerImage = headerImages[headerIndex];

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
    () => CLOSET_SUGGESTIONS.filter((x) => x.category === category),
    [category]
  );

  React.useEffect(() => {
    setCarouselIndex(0);
  }, [category]);

  const contentWidth = Math.min(windowWidth, constrainedWidth);
  const sheetWidth = contentWidth - LAYOUT.paddingHorizontal * 2;
  const sheetRadius = 26;

  const headerHeight = Math.min(420, Math.max(320, Math.round(windowHeight * 0.46)));

  const selected = selectedByCategory[category];
  const selectedSlots = 4;

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
          <View style={styles.headerTopRow}>
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
        </View>

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
            <Text style={styles.sheetTitle}>Recreate using</Text>
            <Text style={styles.sheetTitleEmph}> your closet</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionTitle}>Item suggestions</Text>

          <View style={styles.carouselWrap}>
            <FlatList
              data={suggestions}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.carouselContent}
              snapToAlignment="start"
              decelerationRate="fast"
              pagingEnabled
              onMomentumScrollEnd={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const pageWidth = styles.carouselCard.width as number;
                const next = pageWidth > 0 ? Math.round(x / (pageWidth + 14)) : 0;
                setCarouselIndex(Math.max(0, Math.min(suggestions.length - 1, next)));
              }}
              renderItem={({ item }) => {
                const isSelected = selected.some((x) => x.id === item.id);
                return (
                  <TouchableOpacity
                    style={[styles.carouselCard, isSelected && styles.carouselCardSelected]}
                    activeOpacity={0.88}
                    onPress={() => toggleSelect(item)}
                  >
                    <Image source={item.image} style={styles.carouselImage} />
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.dotsRow} pointerEvents="none">
              {suggestions.map((_, idx) => (
                <React.Fragment key={idx}>{renderDot(idx === carouselIndex)}</React.Fragment>
              ))}
            </View>
          </View>

          <Text style={styles.selectedTitle}>Selected Items</Text>
          <View style={styles.selectedRow}>
            {Array.from({ length: selectedSlots }).map((_, i) => {
              const item = selected[i];
              return (
                <View key={i} style={styles.selectedSlot}>
                  {item ? (
                    <Image source={item.image} style={styles.selectedSlotImage} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
    marginTop: 52,
    paddingHorizontal: LAYOUT.paddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  sheet: {
    alignSelf: 'center',
    marginTop: -28,
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
    marginBottom: 14,
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
    color: '#A8B3FF',
    letterSpacing: -0.3,
  },
  categoryRow: {
    paddingBottom: 14,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  categoryPillActive: {
    backgroundColor: '#A8B3FF',
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#111827',
  },
  categoryTextActive: {
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Default',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  carouselWrap: {
    marginBottom: 14,
  },
  carouselContent: {
    paddingVertical: 4,
    paddingRight: 6,
    gap: 14,
  },
  carouselCard: {
    width: 128,
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
    resizeMode: 'cover',
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
    fontSize: 13,
    fontFamily: 'Default',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  selectedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectedSlot: {
    flex: 1,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#2a2a2c',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  selectedSlotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

