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
} from 'react-native';
import { Search, Sparkles, Settings } from 'lucide-react-native';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
} from '@expo-google-fonts/work-sans';
import FilterSortSheet from '@/components/FilterSortSheet';
import { LAYOUT, constrainedWidth } from '@/constants/layout';

// Outfit images from recs folder
const outfitImages = [
  require('@/assets/images/recs/image 64 (1).png'),
  require('@/assets/images/recs/image 60 (1).png'),
  require('@/assets/images/recs/image 65 (1).png'),
  require('@/assets/images/recs/image 62 (1).png'),
  require('@/assets/images/recs/image 61 (1).png'),
  require('@/assets/images/recs/_ (7) 1 (1).png'),
  require('@/assets/images/recs/_ (6) 1 (1).png'),
  require('@/assets/images/recs/_ (4) 1 (1).png'),
];

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<'forYou' | 'friends'>('forYou');
  const [searchText, setSearchText] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
    'WorkSans-Regular': WorkSans_400Regular,
    'WorkSans-Medium': WorkSans_500Medium,
    'WorkSans-SemiBold': WorkSans_600SemiBold,
  });

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // Handle filter application logic here
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderMasonryGrid = () => {
    const leftColumn = [];
    const rightColumn = [];

    outfitImages.forEach((image, index) => {
      const height = index % 3 === 0 ? 280 : index % 2 === 0 ? 320 : 240;
      const imageComponent = (
        <TouchableOpacity
          key={index}
          style={[styles.gridItem, { height }]}
          activeOpacity={0.8}
        >
          <Image source={image} style={styles.gridImage} />
        </TouchableOpacity>
      );

      if (index % 2 === 0) {
        leftColumn.push(imageComponent);
      } else {
        rightColumn.push(imageComponent);
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#6A6A6A" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#6A6A6A"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Tab Navigation */}
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

          <View style={styles.sparklesContainer}>
            <Text style={styles.sparkleEmoji}>✨✨✨</Text>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowFilterSheet(true)}
          >
            <Settings size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            🔍 Discover Styles That Match Your Closet
          </Text>
        </View>

        {/* Masonry Grid */}
        {renderMasonryGrid()}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      {/* Filter Sheet */}
      <FilterSortSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApplyFilters={handleApplyFilters}
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
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
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
    backgroundColor: '#424242',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 18,
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
  sparklesContainer: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  sparkleEmoji: {
    fontSize: 14,
  },
  settingsButton: {
    padding: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    color: '#9CA3AF',
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
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: LAYOUT.paddingHorizontal,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A8B3FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});
