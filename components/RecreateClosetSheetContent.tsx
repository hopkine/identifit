import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import type { StatsClosetItem } from '@/constants/statsClosetItems';

const CAROUSEL_CARD_WIDTH = 128;
const CAROUSEL_GAP = 14;
const CAROUSEL_SNAP_INTERVAL = CAROUSEL_CARD_WIDTH + CAROUSEL_GAP;
const SELECTED_SLOTS = 5;

type RecreateClosetSheetContentProps = {
  suggestions: StatsClosetItem[];
  selected: StatsClosetItem[];
  carouselIndex: number;
  onCarouselIndexChange: (index: number) => void;
  onToggleSelect: (item: StatsClosetItem) => void;
};

export default function RecreateClosetSheetContent({
  suggestions,
  selected,
  carouselIndex,
  onCarouselIndexChange,
  onToggleSelect,
}: RecreateClosetSheetContentProps) {
  const renderDot = (active: boolean) => (
    <View style={[styles.dot, active && styles.dotActive]} />
  );

  const syncCarouselIndex = (offsetX: number) => {
    const next = Math.round(offsetX / CAROUSEL_SNAP_INTERVAL);
    onCarouselIndexChange(Math.max(0, Math.min(suggestions.length - 1, next)));
  };

  return (
    <View style={styles.container}>
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
          onScroll={(event) => syncCarouselIndex(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) =>
            syncCarouselIndex(event.nativeEvent.contentOffset.x)
          }
          renderItem={({ item }) => {
            const isSelected = selected.some((entry) => entry.id === item.id);
            return (
              <TouchableOpacity
                style={[styles.carouselCard, isSelected && styles.carouselCardSelected]}
                activeOpacity={0.88}
                onPress={() => onToggleSelect(item)}>
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
          {suggestions.map((_, index) => (
            <React.Fragment key={index}>{renderDot(index === carouselIndex)}</React.Fragment>
          ))}
        </View>
      </View>

      <Text style={styles.selectedTitle}>Selected Items</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.selectedRowScroll}>
        {Array.from({ length: SELECTED_SLOTS }).map((_, index) => {
          const item = selected[index];
          return (
            <View key={index} style={styles.selectedSlot}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 22,
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
