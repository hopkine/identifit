import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Platform,
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
import RecreateClosetSheetContent from '@/components/RecreateClosetSheetContent';
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
  }, [ootdFromFriend, headerImages, headerIndex, params.ootdId]);

  const [category, setCategory] = React.useState<Category>('Tops');
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const [closetSheetVisible, setClosetSheetVisible] = React.useState(true);
  const [selectedByCategory, setSelectedByCategory] = React.useState<
    Record<Category, ClosetItem[]>
  >({
    Tops: [],
    Bottoms: [],
    Shoes: [],
    Accessories: [],
  });

  const suggestions = React.useMemo(
    () => STATS_CLOSET_PLACEHOLDERS.filter((item) => item.category === category),
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
  const useNativeClosetSheet = Platform.OS === 'ios';

  if (!fontsLoaded) {
    return null;
  }

  const toggleSelect = (item: ClosetItem) => {
    setSelectedByCategory((prev) => {
      const existing = prev[category];
      const already = existing.some((entry) => entry.id === item.id);
      if (already) {
        return {
          ...prev,
          [category]: existing.filter((entry) => entry.id !== item.id),
        };
      }
      if (existing.length >= 5) return prev;
      return {
        ...prev,
        [category]: [...existing, item],
      };
    });
  };

  const closeClosetSheet = () => {
    setClosetSheetVisible(false);
    router.back();
  };

  const closetSheet = (
    <RecreateClosetSheetContent
      suggestions={suggestions}
      selected={selected}
      carouselIndex={carouselIndex}
      onCarouselIndexChange={setCarouselIndex}
      onToggleSelect={toggleSelect}
    />
  );

  const hero = (
    <View style={[styles.header, useNativeClosetSheet ? styles.headerFullScreen : { height: headerHeight }]}>
      <Image source={headerImage} style={styles.headerImage} />
      <View style={[styles.headerTopRow, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.85}
          accessibilityLabel="Back">
          <ChevronLeft size={26} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.createButton} activeOpacity={0.85}>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerCategoryOverlay} pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.categoryRowOnPhoto}>
          {CATEGORIES.map((entry) => {
            const active = entry === category;
            return (
              <TouchableOpacity
                key={entry}
                onPress={() => setCategory(entry)}
                style={[styles.categoryPillOnPhoto, active && styles.categoryPillOnPhotoActive]}
                activeOpacity={0.85}>
                <Text
                  style={[styles.categoryTextOnPhoto, active && styles.categoryTextOnPhotoActive]}
                  numberOfLines={1}>
                  {entry}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.backdrop}>
      <View style={[styles.stage, { width: contentWidth }]}>
        {useNativeClosetSheet ? (
          <>
            {hero}
            <Modal
              visible={closetSheetVisible}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={closeClosetSheet}>
              <SafeAreaView style={styles.nativeSheetContainer}>{closetSheet}</SafeAreaView>
            </Modal>
          </>
        ) : (
          <>
            {hero}
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={[
                styles.sheetScrollContent,
                { paddingBottom: Math.max(insets.bottom, 16) + 12 },
              ]}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled">
              <View
                style={[
                  styles.inlineSheet,
                  {
                    width: sheetWidth,
                    borderTopLeftRadius: sheetRadius,
                    borderTopRightRadius: sheetRadius,
                  },
                ]}>
                {closetSheet}
              </View>
            </ScrollView>
          </>
        )}
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
  headerFullScreen: {
    flex: 1,
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
  nativeSheetContainer: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    flexGrow: 1,
  },
  inlineSheet: {
    alignSelf: 'center',
    marginTop: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});
