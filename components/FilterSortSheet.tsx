import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg';
import { useFonts, Caladea_400Regular, Caladea_700Bold } from '@expo-google-fonts/caladea';

interface FilterSortSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  /** Result counts for the primary button label (grid size when near me on vs off) */
  itemCountDefault?: number;
  itemCountNearMe?: number;
}

export interface FilterState {
  season: 'spring' | 'summer' | 'fall' | 'winter' | null;
  bodyType: 'hourglass' | 'triangle' | 'rectangle' | 'oval' | 'heart' | null;
  showNearMe: boolean;
  comfortability: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.85;
const SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.5;

/** Heroicons v2 outline `play` (https://heroicons.com), rotated −90° → tip up */
const HERO_PLAY_OUTLINE_D =
  'M5.25 5.65273C5.25 4.79705 6.1674 4.25462 6.91716 4.66698L18.4577 11.0143C19.2349 11.4417 19.2349 12.5584 18.4577 12.9858L6.91716 19.3331C6.1674 19.7455 5.25 19.203 5.25 18.3474V5.65273Z';

/** Same box as summer emoji so SVG chips align visually */
const FILTER_CHIP_ICON_SLOT = 42;
const FILTER_CHIP_SVG_SIZE = 40;

function BodyTypePlayIcon({ color, size = FILTER_CHIP_SVG_SIZE }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-90deg' }],
      }}
    >
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

/** Heroicons v2 outline map-pin (https://heroicons.com) */
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

export default function FilterSortSheet({
  visible,
  onClose,
  onApplyFilters,
  itemCountDefault = 7,
  itemCountNearMe = 4,
}: FilterSortSheetProps) {
  const [filters, setFilters] = useState<FilterState>({
    season: null,
    bodyType: null,
    showNearMe: false,
    comfortability: 0.5,
  });

  const sheetHeight = useRef(new Animated.Value(0)).current;
  const panStartHeightRef = useRef(SHEET_MAX_HEIGHT);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        sheetHeight.stopAnimation((value) => {
          panStartHeightRef.current = value;
        });
      },
      onPanResponderMove: (_, { dy }) => {
        const next = panStartHeightRef.current - dy;
        sheetHeight.setValue(
          Math.max(0, Math.min(SHEET_MAX_HEIGHT, next))
        );
      },
      onPanResponderRelease: (_, { vy }) => {
        sheetHeight.stopAnimation((currentHeight) => {
          const dismissThreshold = SHEET_MIN_HEIGHT * 0.35;
          if (currentHeight < dismissThreshold || (currentHeight < SHEET_MIN_HEIGHT && vy > 0.35)) {
            closeSheet();
            return;
          }
          const mid = (SHEET_MIN_HEIGHT + SHEET_MAX_HEIGHT) / 2;
          let target: number;
          if (vy < -0.45) {
            target = SHEET_MAX_HEIGHT;
          } else if (vy > 0.45) {
            target = SHEET_MIN_HEIGHT;
          } else {
            target =
              currentHeight > mid ? SHEET_MAX_HEIGHT : SHEET_MIN_HEIGHT;
          }
          target = Math.max(SHEET_MIN_HEIGHT, Math.min(SHEET_MAX_HEIGHT, target));
          Animated.spring(sheetHeight, {
            toValue: target,
            useNativeDriver: false,
            damping: 52,
            stiffness: 320,
          }).start();
        });
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      sheetHeight.setValue(0);
      Animated.spring(sheetHeight, {
        toValue: SHEET_MAX_HEIGHT,
        useNativeDriver: false,
        damping: 50,
        stiffness: 300,
      }).start();
    }
  }, [visible]);

  const closeSheet = () => {
    Animated.timing(sheetHeight, {
      toValue: 0,
      duration: 260,
      useNativeDriver: false,
    }).start(() => {
      onClose();
    });
  };

  const handleReset = () => {
    setFilters({
      season: null,
      bodyType: null,
      showNearMe: false,
      comfortability: 0.5,
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    closeSheet();
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeSheet}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetContainer,
            {
              height: sheetHeight,
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.sheetInner}>
            {/* Drag Handle — drag up to expand, down to shrink / dismiss */}
            <View {...panResponder.panHandlers} style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
        >
        <View style={styles.content}>
          {/* Filter Options */}
          <View style={styles.filterRow}>
            {/* Season Filter */}
            <View style={styles.filterOption}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.season === 'summer' && styles.selectedFilter,
                ]}
                onPress={() => updateFilter('season',
                  filters.season === 'summer' ? null : 'summer'
                )}
              >
                <View style={styles.filterIconSlot}>
                  <Text style={styles.seasonEmoji}>🏖️</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.filterText}>
                Season: Summer
              </Text>
            </View>

            {/* Body Type Filter */}
            <View style={styles.filterOption}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.bodyType && styles.selectedFilter,
                ]}
                onPress={() => updateFilter('bodyType',
                  filters.bodyType ? null : 'hourglass'
                )}
              >
                <View style={styles.filterIconSlot}>
                  <BodyTypePlayIcon
                    color={filters.bodyType ? '#1C1C1E' : '#FFFFFF'}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.filterText}>
                Body Type
              </Text>
            </View>

            {/* Location Filter */}
            <View style={styles.filterOption}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.showNearMe && styles.selectedFilter,
                ]}
                onPress={() => updateFilter('showNearMe', !filters.showNearMe)}
              >
                <View style={styles.filterIconSlot}>
                  <NearMeMapPinIcon
                    color={filters.showNearMe ? '#1C1C1E' : '#FFFFFF'}
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.filterText}>
                Show Posts Near Me
              </Text>
            </View>
          </View>

          {/* Comfortability Scale */}
          <View style={styles.comfortabilitySection}>
            <Text style={styles.sectionTitle}>Comfortability Scale</Text>

            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={filters.comfortability}
                onValueChange={(value) => updateFilter('comfortability', value)}
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
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>
                  {`Show ${
                    filters.showNearMe ? itemCountNearMe : itemCountDefault
                  } Results`}
                </Text>
              </TouchableOpacity>
            </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sheetInner: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
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
  /** Wide capsule like iOS-style dark control + faint inner rim */
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
  sliderBackground: {
    position: 'absolute',
    width: '100%',
    height: 60,
    left: 0,
    right: 0,
  },
  sliderBackgroundImage: {
    resizeMode: 'stretch',
    borderRadius: 30,
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