import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Plus, Calendar, ChevronRight, Bookmark } from 'lucide-react-native';
import HomeWeatherWidget from '@/components/HomeWeatherWidget';
import HomeActionCards, { type HomeActionCard } from '@/components/HomeActionCards';
import HomeStatsWidgets from '@/components/HomeStatsWidgets';
import { useWeather } from '@/hooks/useWeather';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useOOTD } from '@/hooks/useOOTD';
import { formatLocalDateKey } from '@/utils/localDateKey';
import type { OOTD } from '@/types/ootd';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import OutfitWeekSlotCutout from '@/components/OutfitWeekSlotCutout';
import ClosetIcon from '@/components/ClosetIcon';
import Sparkle from '@/components/Sparkle';

/** Outfit-of-the-week strip — matches design reference proportions (~1 : 3.7) */
const OUTFIT_SLOT_WIDTH = 56;
const OUTFIT_SLOT_HEIGHT = 208;
const OUTFIT_DAY_GAP = 10;
/** Dot + date + weekday stack above each slot (aligns chevron with slot column) */
const OUTFIT_LABEL_STACK_HEIGHT = 64;

/** iOS dark grouped secondary surface */
const GROUPED_CARD_BG = '#1C1C1E';
const IOS_SECONDARY_LABEL = 'rgba(235, 235, 245, 0.55)';
const HAIRLINE = 'rgba(255, 255, 255, 0.08)';

function ootdSlotImageSource(ootd: OOTD | undefined): ImageSourcePropType {
  const raw = ootd?.cutoutImageUri ?? ootd?.imageUri;
  if (raw == null) return { uri: '' };
  return typeof raw === 'string' ? { uri: raw } : raw;
}

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatOutfitWeekRange(
  days: { dateString: string }[]
): string {
  if (days.length === 0) return '';
  const first = new Date(days[0].dateString);
  const last = new Date(days[days.length - 1].dateString);
  const sameMonth =
    first.getMonth() === last.getMonth() &&
    first.getFullYear() === last.getFullYear();
  if (sameMonth) {
    return first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  const start = first.toLocaleDateString('en-US', { month: 'long' });
  const end = last.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return `${start} – ${end}`;
}

export default function HomeScreen() {
  const {
    saveOOTD,
    getOOTDForDate,
    userOOTDs,
    deleteOOTD,
    currentUserForDisplay,
    getTopStyles,
  } = useOOTD();
  const calendarScrollRef = React.useRef<ScrollView>(null);
  const topPagerRef = React.useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [topPageIndex, setTopPageIndex] = React.useState(0);
  const {
    status: weatherStatus,
    visibleHours,
    selectedIndex: selectedWeatherIndex,
    selectHour,
    refresh: refreshWeather,
  } = useWeather();

  const firstName = currentUserForDisplay.name.split(' ')[0];

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
  });

  // Force re-render when OOTDs change
  React.useEffect(() => {
    // This will trigger a re-render when userOOTDs changes
  }, [userOOTDs]);

  const handleAddOutfit = () => {
    // Trigger haptic feedback on button press
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      "Upload Today's OOTD",
      'Add your outfit of the day to your collection',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            void takePhotoFromCamera();
          },
        },
        {
          text: 'Photo Library',
          onPress: pickImageFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // iOS crop UI is always square when allowsEditing is true; use full frame and crop in UI if needed.
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      // Handle the selected image
      console.log('Selected image:', result.assets[0].uri);

      // Save the OOTD
      saveOOTD(result.assets[0].uri, {
        occasion: 'casual', // Could be determined from context or user input
        weather: 'sunny', // Could be fetched from weather API
        isPrivate: false,
      });

      Alert.alert('Success', 'Your OOTD has been saved and shared!');
    }
  };

  const takePhotoFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera',
        'Allow camera access to take photos of your outfits.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      saveOOTD(result.assets[0].uri, {
        occasion: 'casual',
        weather: 'sunny',
        isPrivate: false,
      });
      Alert.alert('Success', 'Your OOTD has been captured and shared!');
    }
  };

  const handleLongPressOOTD = (day: any) => {
    if (!day.hasOutfit || !day.ootd) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Delete OOTD',
      `Delete your outfit from ${day.day}, ${day.date}? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteOOTD(day.ootd.id);
          },
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  // Generate outfit days based on actual OOTD data
  const generateOutfitDays = () => {
    const today = new Date();
    const todayDateString = formatLocalDateKey(today);
    const days = [];

    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateString = formatLocalDateKey(date);
      const ootd = getOOTDForDate(dateString);

      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate().toString().padStart(2, '0'),
        dateString,
        isToday: dateString === todayDateString,
        hasOutfit: !!ootd,
        ootd,
      });
    }

    return days;
  };

  const outfitDays = generateOutfitDays();
  const topStyles = getTopStyles(3);

  const contentWidth = Math.min(LAYOUT.contentMaxWidth, windowWidth);
  const topPageWidth = contentWidth - LAYOUT.paddingHorizontal * 2;

  const handleTopPagerScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / Math.max(topPageWidth, 1)
    );
    setTopPageIndex(Math.min(Math.max(nextIndex, 0), 1));
  };

  const actionCards: HomeActionCard[] = [
    {
      id: 'manual',
      label: 'Select\nManually',
      icon: <ClosetIcon width={34} height={40} />,
      onPress: handleAddOutfit,
    },
    {
      id: 'saved',
      label: 'Choose from\nSaved',
      icon: <Bookmark size={34} color="#A8C6FF" strokeWidth={1.75} />,
      onPress: () => router.push('/NAV/saved'),
    },
    {
      id: 'rec',
      label: 'Get Outfit\nrec',
      icon: <Sparkle width={28} height={40} color="#A8C6FF" />,
      onPress: () =>
        router.push({
          pathname: '/style-overlay',
          params: { imageSet: 'forYou', imageIndex: '0' },
        }),
    },
  ];

  const outfitWeekSectionInner = (
    <>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Outfit of the Week</Text>
          <Text style={styles.sectionDate}>
            {formatOutfitWeekRange(outfitDays)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => router.push('/memories')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Open calendar"
        >
          <Calendar size={18} color={LAYOUT.accentPurple} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarRow}>
        <ScrollView
          ref={calendarScrollRef}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.calendarScroll}
          contentContainerStyle={styles.calendarScrollContent}
        >
          {outfitDays.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <View style={styles.dayIndicatorContainer}>
                {day.isToday && <View style={styles.activeDayDot} />}
              </View>

              <Text
                style={[
                  styles.dayNumber,
                  day.isToday && styles.currentDayNumber,
                ]}
              >
                {day.date}
              </Text>
              <Text
                style={[
                  styles.dayName,
                  day.isToday && styles.currentDayName,
                ]}
              >
                {day.day}
              </Text>

              {day.hasOutfit ? (
                <TouchableOpacity
                  style={styles.outfitImageContainer}
                  onLongPress={() => handleLongPressOOTD(day)}
                  delayLongPress={500}
                  activeOpacity={0.8}
                >
                  <OutfitWeekSlotCutout source={ootdSlotImageSource(day.ootd)} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addOutfitButton}
                  onPress={handleAddOutfit}
                  activeOpacity={0.85}
                >
                  <View style={styles.outfitWeekAddFrame}>
                    <Plus size={24} color="#A8B3FF" strokeWidth={2.25} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.calendarChevron}
          onPress={() =>
            calendarScrollRef.current?.scrollToEnd({ animated: true })
          }
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          accessibilityLabel="Scroll outfits"
        >
          <ChevronRight size={20} color={IOS_SECONDARY_LABEL} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.innerWrapper}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greetingKicker}>{timeGreeting()}</Text>
          <Text style={styles.greetingDisplayName}>{firstName}</Text>
        </View>

        <View style={styles.topPagerSection}>
          <ScrollView
            ref={topPagerRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleTopPagerScrollEnd}
            onScrollEndDrag={handleTopPagerScrollEnd}
            style={{ width: topPageWidth }}
            contentContainerStyle={styles.topPagerContent}
          >
            <View style={[styles.topPage, { width: topPageWidth }]}>
              <HomeWeatherWidget
                status={weatherStatus}
                hours={visibleHours}
                selectedIndex={selectedWeatherIndex}
                onSelectHour={selectHour}
                onRetry={refreshWeather}
              />
              <View style={styles.actionCardsInPager}>
                <HomeActionCards cards={actionCards} />
              </View>
            </View>

            <View style={[styles.topPage, { width: topPageWidth }]}>
              <HomeStatsWidgets userOOTDs={userOOTDs} topStyles={topStyles} />
            </View>
          </ScrollView>

          <View style={styles.topPagerDots}>
            {(['Weather', 'Stats'] as const).map((label, index) => (
              <TouchableOpacity
                key={label}
                onPress={() => {
                  topPagerRef.current?.scrollTo({
                    x: topPageWidth * index,
                    animated: true,
                  });
                  setTopPageIndex(index);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`${label} page`}
              >
                <View
                  style={[
                    styles.topPagerDot,
                    index === topPageIndex && styles.topPagerDotActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.groupedCard, styles.outfitSectionOuter]}>
          <View style={styles.outfitSectionInner}>{outfitWeekSectionInner}</View>
        </View>

        {/* Bottom spoiler — scroll to reveal */}
        <View style={styles.spoilerFooter}>
          <View style={styles.spoilerRule} />
          <View style={styles.logoTeaser}>
            <Sparkle width={50} height={50} />
            <Text style={styles.logoText}>identifit</Text>
            <Text style={styles.logoTagline}>Your style, identified</Text>
          </View>
        </View>
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
    width: '100%',
    maxWidth: constrainedWidth,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 26,
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 4,
  },
  greetingKicker: {
    fontSize: 11,
    fontFamily: 'Default',
    fontWeight: '600',
    color: 'rgba(192, 209, 255, 0.88)',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  greetingDisplayName: {
    fontSize: 36,
    fontFamily: 'Caladea-Bold',
    color: '#F8FAFC',
    letterSpacing: -0.8,
    lineHeight: 40,
    marginBottom: 14,
  },
  topPagerSection: {
    marginBottom: 18,
    paddingHorizontal: LAYOUT.paddingHorizontal,
    alignItems: 'center',
  },
  topPagerContent: {
    alignItems: 'flex-start',
  },
  topPage: {
    minHeight: 280,
  },
  actionCardsInPager: {
    marginTop: 16,
  },
  topPagerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  topPagerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  topPagerDotActive: {
    backgroundColor: '#A8B3FF',
  },
  groupedCard: {
    backgroundColor: GROUPED_CARD_BG,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
  },
  outfitSectionOuter: {
    marginHorizontal: LAYOUT.paddingHorizontal,
    marginTop: 2,
    marginBottom: 12,
  },
  outfitSectionInner: {
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.24,
    lineHeight: 22,
  },
  sectionDate: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '400',
    color: IOS_SECONDARY_LABEL,
  },
  calendarButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  calendarScroll: {
    flex: 1,
    marginRight: 4,
  },
  calendarScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: OUTFIT_DAY_GAP,
    paddingRight: 4,
  },
  dayContainer: {
    alignItems: 'center',
    width: OUTFIT_SLOT_WIDTH,
  },
  calendarChevron: {
    height: OUTFIT_SLOT_HEIGHT,
    justifyContent: 'center',
    marginTop: OUTFIT_LABEL_STACK_HEIGHT,
    paddingLeft: 4,
  },
  dayIndicatorContainer: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeDayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C0D1FF',
  },
  dayNumber: {
    fontSize: 12,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#F1F5F9',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  dayName: {
    fontSize: 11,
    fontFamily: 'Default',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 10,
    letterSpacing: 0.25,
  },
  currentDayNumber: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentDayName: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outfitImageContainer: {
    width: OUTFIT_SLOT_WIDTH,
    height: OUTFIT_SLOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOutfitButton: {
    width: OUTFIT_SLOT_WIDTH,
    height: OUTFIT_SLOT_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitWeekAddFrame: {
    width: OUTFIT_SLOT_WIDTH,
    height: OUTFIT_SLOT_HEIGHT,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spoilerFooter: {
    marginTop: 24,
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingBottom: 20,
  },
  spoilerRule: {
    height: 1,
    backgroundColor: 'rgba(192, 209, 255, 0.12)',
    marginBottom: 20,
  },
  logoTeaser: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoText: {
    fontSize: 19,
    fontFamily: 'Caladea-Regular',
    color: '#D4DFF9',
    letterSpacing: -0.2,
    opacity: 0.88,
    marginBottom: 5,
  },
  logoTagline: {
    fontSize: 12,
    fontFamily: 'Default',
    color: '#9CA3AF',
    letterSpacing: 0.2,
    opacity: 0.75,
  },
});
