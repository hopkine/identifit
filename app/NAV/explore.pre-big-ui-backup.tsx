import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Plus } from 'lucide-react-native';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import FilterSortSheet, { type FilterState } from '@/components/FilterSortSheet';
import { LAYOUT, constrainedWidth } from '@/constants/layout';

// Outfit images from recs folder
const outfitImages = [
  require('@/assets/images/recs/rec-white-halter-top-black-pants.png'),
  require('@/assets/images/recs/rec-striped-offshoulder-white-pants.png'),
  require('@/assets/images/recs/rec-mesh-tank-denim-shorts-cap.png'),
  require('@/assets/images/recs/rec-white-graphic-tee-black-wide-pants.png'),
  require('@/assets/images/recs/rec-black-tank-ruffle-hem-jeans.png'),
  require('@/assets/images/recs/rec-white-bucket-hat-black-skirt.png'),
  require('@/assets/images/recs/rec-cropped-knit-wide-jeans.png'),
];

const nearMeOutfitImages = [
  require('@/assets/images/near-me/01.png'),
  require('@/assets/images/near-me/02.png'),
  require('@/assets/images/near-me/03.png'),
  require('@/assets/images/near-me/04.png'),
];

export default function ExploreScreenBackup() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'forYou' | 'friends'>('forYou');
  const [searchText, setSearchText] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [appliedShowNearMe, setAppliedShowNearMe] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
  });

  const handleApplyFilters = (filters: FilterState) => {
    setAppliedShowNearMe(filters.showNearMe);
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderMasonryGrid = () => {
    const leftColumn: React.ReactNode[] = [];
    const rightColumn: React.ReactNode[] = [];

    const gridImages = appliedShowNearMe ? nearMeOutfitImages : outfitImages;

    const contentWidth = Math.min(windowWidth, constrainedWidth);
    const columnWidth =
      (contentWidth - LAYOUT.paddingHorizontal * 2 - styles.masonryContainer.gap) /
      2;

    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const heightFor = (image: any, index: number) => {
      const resolved = Image.resolveAssetSource(image);
      if (resolved?.width && resolved?.height && columnWidth > 0) {
        const ratio = resolved.height / resolved.width;
        return clamp(Math.round(columnWidth * ratio), 220, 380);
      }
      return index % 3 === 0 ? 280 : index % 2 === 0 ? 320 : 240;
    };

    let leftHeight = 0;
    let rightHeight = 0;

    gridImages.forEach((image, index) => {
      const height = heightFor(image, index);
      const imageComponent = (
        <TouchableOpacity
          key={index}
          style={[styles.gridItem, { height }]}
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: '/style-overlay' as any,
              params: {
                imageSet: appliedShowNearMe ? 'nearMe' : 'forYou',
                imageIndex: String(index),
              },
            });
          }}
        >
          <Image source={image} style={styles.gridImage} />
        </TouchableOpacity>
      );

      if (leftHeight <= rightHeight) {
        leftColumn.push(imageComponent);
        leftHeight += height;
      } else {
        rightColumn.push(imageComponent);
        rightHeight += height;
      }
    });

    return (
      <View style={styles.masonryContainer}>
        <View style={styles.masonryColumn}>{leftColumn}</View>
        <View style={styles.masonryColumn}>{rightColumn}</View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <TouchableOpacity
            style={styles.headerFilterButton}
            onPress={() => setShowFilterSheet(true)}
            activeOpacity={0.75}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <SlidersHorizontal size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'forYou' && styles.activeTab]}
              onPress={() => setActiveTab('forYou')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'forYou' && styles.activeTabText,
                ]}
              >
                For You
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
              onPress={() => setActiveTab('friends')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'friends' && styles.activeTabText,
                ]}
              >
                Your Friends
              </Text>
            </TouchableOpacity>

            <View style={[styles.tab, styles.sparklesPill]}>
              <Text style={styles.sparkleEmoji}>✨✨✨</Text>
            </View>
          </View>

          {renderMasonryGrid()}
        </ScrollView>

        <TouchableOpacity style={styles.floatingPlusFab} activeOpacity={0.88}>
          <Plus size={30} color="#1a1a1a" strokeWidth={2.25} />
        </TouchableOpacity>

        <FilterSortSheet
          visible={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          onApplyFilters={handleApplyFilters}
          itemCountDefault={outfitImages.length}
          itemCountNearMe={nearMeOutfitImages.length}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LAYOUT.backgroundColor,
    alignItems: 'center',
  },
  innerWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: constrainedWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
  },
  headerFilterButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Default',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#A8B3FF',
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'System',
    color: '#FFFFFF',
  },
  activeTabText: {
    color: '#000000',
  },
  sparklesPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleEmoji: {
    fontSize: 14,
  },
  masonryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 100,
  },
  masonryColumn: {
    flex: 1,
    gap: 12,
  },
  gridItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingPlusFab: {
    position: 'absolute',
    bottom: 96,
    right: LAYOUT.paddingHorizontal,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#B3C8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
});
