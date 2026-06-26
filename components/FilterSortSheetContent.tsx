import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg';
import type { FilterState } from '@/components/FilterSortSheet.types';

const FILTER_CHIP_ICON_SLOT = 42;
const FILTER_CHIP_SVG_SIZE = 40;

const HERO_PLAY_OUTLINE_D =
  'M5.25 5.65273C5.25 4.79705 6.1674 4.25462 6.91716 4.66698L18.4577 11.0143C19.2349 11.4417 19.2349 12.5584 18.4577 12.9858L6.91716 19.3331C6.1674 19.7455 5.25 19.203 5.25 18.3474V5.65273Z';

function BodyTypePlayIcon({ color, size = FILTER_CHIP_SVG_SIZE }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-90deg' }],
      }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d={HERO_PLAY_OUTLINE_D}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function NearMeMapPinIcon({ color, size = FILTER_CHIP_SVG_SIZE }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type FilterSortSheetContentProps = {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  onApply: () => void;
  itemCountDefault: number;
  itemCountNearMe: number;
  showDragHandle?: boolean;
};

export default function FilterSortSheetContent({
  filters,
  onUpdateFilter,
  onReset,
  onApply,
  itemCountDefault,
  itemCountNearMe,
  showDragHandle = false,
}: FilterSortSheetContentProps) {
  return (
    <View style={styles.sheetInner}>
      {showDragHandle ? (
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filter & Sort</Text>
        <TouchableOpacity onPress={onReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces>
        <View style={styles.content}>
          <View style={styles.filterRow}>
            <View style={styles.filterOption}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.season === 'summer' && styles.selectedFilter,
                ]}
                onPress={() =>
                  onUpdateFilter('season', filters.season === 'summer' ? null : 'summer')
                }>
                <View style={styles.filterIconSlot}>
                  <Text style={styles.seasonEmoji}>🏖️</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.filterText}>Season: Summer</Text>
            </View>

            <View style={styles.filterOption}>
              <TouchableOpacity
                style={[styles.filterButton, filters.bodyType && styles.selectedFilter]}
                onPress={() =>
                  onUpdateFilter('bodyType', filters.bodyType ? null : 'hourglass')
                }>
                <View style={styles.filterIconSlot}>
                  <BodyTypePlayIcon color={filters.bodyType ? '#1C1C1E' : '#FFFFFF'} />
                </View>
              </TouchableOpacity>
              <Text style={styles.filterText}>Body Type</Text>
            </View>

            <View style={styles.filterOption}>
              <TouchableOpacity
                style={[styles.filterButton, filters.showNearMe && styles.selectedFilter]}
                onPress={() => onUpdateFilter('showNearMe', !filters.showNearMe)}>
                <View style={styles.filterIconSlot}>
                  <NearMeMapPinIcon color={filters.showNearMe ? '#1C1C1E' : '#FFFFFF'} />
                </View>
              </TouchableOpacity>
              <Text style={styles.filterText}>Show Posts Near Me</Text>
            </View>
          </View>

          <View style={styles.comfortabilitySection}>
            <Text style={styles.sectionTitle}>Comfortability Scale</Text>

            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={filters.comfortability}
                onValueChange={(value) => onUpdateFilter('comfortability', value)}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="#FFFFFF"
              />
            </View>

            <View style={styles.sliderLabels}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelEmoji}>🧑‍💼</Text>
                <Text style={styles.labelText}>Less Comfy</Text>
              </View>
              <View style={styles.labelContainer}>
                <Text style={styles.labelEmoji}>🛋️</Text>
                <Text style={styles.labelText}>Most Comfy</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={onApply}>
          <Text style={styles.applyButtonText}>
            {`Show ${filters.showNearMe ? itemCountNearMe : itemCountDefault} Results`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetInner: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#3A3A3C',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
  },
  resetText: {
    fontSize: 15,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
    gap: 12,
  },
  filterOption: {
    flex: 1,
    alignItems: 'center',
  },
  filterButton: {
    alignSelf: 'stretch',
    width: '100%',
    minHeight: 52,
    paddingHorizontal: 22,
    paddingVertical: 11,
    backgroundColor: '#333333',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedFilter: {
    backgroundColor: '#C0D1FF',
    borderColor: 'rgba(60, 60, 67, 0.22)',
  },
  filterIconSlot: {
    width: FILTER_CHIP_ICON_SLOT,
    height: FILTER_CHIP_ICON_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  seasonEmoji: {
    fontSize: 36,
    lineHeight: FILTER_CHIP_ICON_SLOT,
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
  },
  comfortabilitySection: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  sliderContainer: {
    marginBottom: 24,
    position: 'relative',
    height: 60,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
    zIndex: 1,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelEmoji: {
    fontSize: 22,
  },
  labelText: {
    fontSize: 14,
    fontFamily: 'Default',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 20,
  },
  applyButton: {
    backgroundColor: '#A8B3FF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Default',
    fontWeight: '600',
    color: '#000000',
  },
});
