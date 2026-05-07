import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActionSheetIOS,
  Platform,
  type ImageSourcePropType,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Plus, Calendar, ChevronRight } from 'lucide-react-native';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useOOTD } from '@/hooks/useOOTD';
import { calculateOOTDStreak } from '@/utils/ootdStreak';
import { formatLocalDateKey } from '@/utils/localDateKey';
import { currentUser } from '@/data/ootd';
import type { OOTD } from '@/types/ootd';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import OutfitWeekSlotCutout from '@/components/OutfitWeekSlotCutout';
import StreakIcon from '@/components/StreakIcon';
import StarIcon from '@/components/StarIcon';
import ClosetIcon from '@/components/ClosetIcon';
import Sparkle from '@/components/Sparkle';
import OotdCameraCapture from '@/components/OotdCameraCapture';

/** Outfit-of-the-week strip — matches design reference proportions (~1 : 3.7) */
const OUTFIT_SLOT_WIDTH = 56;
const OUTFIT_SLOT_HEIGHT = 208;
const OUTFIT_DAY_GAP = 10;
/** Dot + date + weekday stack above each slot (aligns chevron with slot column) */
const OUTFIT_LABEL_STACK_HEIGHT = 64;

/** Corner decoration on legacy stat cards (top styles + closet) */
const STAT_CARD_DECOR_ICON_WIDTH = 46;
const STAT_CARD_DECOR_ICON_HEIGHT = 70;

/** iOS dark grouped secondary surface */
const GROUPED_CARD_BG = '#1C1C1E';
const IOS_SECONDARY_LABEL = 'rgba(235, 235, 245, 0.55)';
const HAIRLINE = 'rgba(255, 255, 255, 0.08)';

function ootdSlotImageSource(ootd: OOTD | undefined): ImageSourcePropType {
  const raw = ootd?.cutoutImageUri ?? ootd?.imageUri;
  if (raw == null) return { uri: '' };
  return typeof raw === 'string' ? { uri: raw } : raw;
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
  const { saveOOTD, getOOTDForDate, userOOTDs, deleteOOTD, getTopStyles } =
    useOOTD();
  const [ootdCameraOpen, setOotdCameraOpen] = React.useState(false);
  const calendarScrollRef = React.useRef<ScrollView>(null);

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
          text: 'Photo Library',
          onPress: pickImageFromLibrary,
        },
        {
          text: 'Take Photo',
          onPress: openCamera,
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

  const openCamera = () => {
    setOotdCameraOpen(true);
  };

  const handleLongPressOOTD = (day: any) => {
    if (!day.hasOutfit || !day.ootd) return;

    // Trigger haptic feedback on long press
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete Photo'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: 'Manage OOTD',
          message: `What would you like to do with your outfit from ${day.day}, ${day.date}?`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Delete option selected
            Alert.alert(
              'Delete OOTD',
              'Are you sure you want to delete this outfit? This action cannot be undone.',
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
          }
        }
      );
    } else {
      // Android fallback
      Alert.alert(
        'Manage OOTD',
        `What would you like to do with your outfit from ${day.day}, ${day.date}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Photo',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Delete OOTD',
                'Are you sure you want to delete this outfit? This action cannot be undone.',
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
            },
          },
        ]
      );
    }
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

  const currentStreak = calculateOOTDStreak(userOOTDs);

  // Calculate items worn this month
  const calculateItemsWornThisMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return userOOTDs.filter((ootd) => {
      const ootdDate = new Date(ootd.date);
      return (
        ootdDate.getMonth() === currentMonth &&
        ootdDate.getFullYear() === currentYear
      );
    }).length;
  };

  const itemsWornThisMonth = calculateItemsWornThisMonth();
  const CLOSET_SIZE_ESTIMATE = 30; // placeholder for "closet size" until we have real data
  const closetWornPercent = Math.min(
    100,
    Math.round((itemsWornThisMonth / CLOSET_SIZE_ESTIMATE) * 100)
  );

  const topStyles = getTopStyles(3);

  const streakCardBody = (
    <>
      <View style={styles.streakCardDecoration} pointerEvents="none">
        <StreakIcon
          width={STAT_CARD_DECOR_ICON_WIDTH}
          height={STAT_CARD_DECOR_ICON_HEIGHT}
        />
      </View>
      <View style={styles.streakCardContent}>
        <Text style={styles.streakStatNumber}>{currentStreak}</Text>
        <Text style={styles.streakFootnote}>
          {currentStreak === 0
            ? 'Log an OOTD to start a streak.'
            : currentStreak === 1
              ? 'day in a row'
              : 'days in a row'}
        </Text>
      </View>
    </>
  );

  const topStylesCardBody = (
    <>
      <View style={styles.topStylesCardDecoration} pointerEvents="none">
        <StarIcon
          width={STAT_CARD_DECOR_ICON_WIDTH}
          height={STAT_CARD_DECOR_ICON_HEIGHT}
        />
      </View>
      <View style={styles.topStylesTextBlock}>
        <Text style={styles.statTitle}>My Top Styles</Text>
        {topStyles.length > 0 ? (
          topStyles.map((style, index) => (
            <Text key={style} style={styles.styleItem}>
              {index + 1}. {style}
            </Text>
          ))
        ) : (
          <Text style={styles.styleItem}>No styles yet</Text>
        )}
      </View>
    </>
  );

  const progressCardBody = (
    <>
      <View style={styles.progressCardDecoration} pointerEvents="none">
        <ClosetIcon
          width={STAT_CARD_DECOR_ICON_WIDTH}
          height={STAT_CARD_DECOR_ICON_HEIGHT}
        />
      </View>
      <View style={styles.progressCardInner}>
        <Text style={styles.progressNumber}>{closetWornPercent}%</Text>
        <Text style={styles.progressLabel}>
          of your{'\n'}closet worn{'\n'}this month
        </Text>
      </View>
    </>
  );

  const outfitWeekSectionInner = (
    <>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Outfit of the Week
          </Text>
          <Text style={styles.sectionDate}>
            {formatOutfitWeekRange(outfitDays)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => router.push('/memories')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Open memories calendar"
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
    <>
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
          <Text style={styles.greetingKicker}>Good morning</Text>
          <Text style={styles.greetingDisplayName}>
            {currentUser.name.split(' ')[0]}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.dayStreakCardFlat}>{streakCardBody}</View>
            <View style={styles.topStylesCardFlat}>{topStylesCardBody}</View>
          </View>
          <View style={styles.progressCardFlat}>{progressCardBody}</View>
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
    <OotdCameraCapture
      open={ootdCameraOpen}
      onClose={() => setOotdCameraOpen(false)}
      onPhotoCaptured={(uri) => {
        saveOOTD(uri, {
          occasion: 'casual',
          weather: 'sunny',
          isPrivate: false,
        });
        Alert.alert('Success', 'Your OOTD has been captured and shared!');
      }}
    />
  </>
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
  statsContainer: {
    marginBottom: 16,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  groupedCard: {
    backgroundColor: GROUPED_CARD_BG,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
  },
  dayStreakCardFlat: {
    flex: 1,
    backgroundColor: 'rgba(63, 63, 63, 0.25)',
    borderRadius: 10,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(244, 173, 179, 0.25)',
  },
  streakCardDecoration: {
    position: 'absolute',
    right: -6,
    bottom: -8,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 0,
  },
  streakCardContent: {
    zIndex: 1,
  },
  streakStatNumber: {
    fontSize: 27,
    color: '#E5ADFE',
    fontFamily: 'Caladea-Bold',
  },
  streakFootnote: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Default',
    color: '#A8B0BD',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  topStylesCardFlat: {
    flex: 1,
    backgroundColor: 'rgba(63, 63, 63, 0.25)',
    borderRadius: 10,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(235, 252, 183, 0.25)',
  },
  topStylesCardDecoration: {
    position: 'absolute',
    right: -1,
    bottom: -12,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 0,
  },
  topStylesTextBlock: {
    zIndex: 1,
  },
  statTitle: {
    fontSize: 21,
    color: '#EBFCB7',
    fontFamily: 'Caladea-Bold',
    fontWeight: 'bold',
    letterSpacing: -0.3,
    lineHeight: 26,
    marginBottom: 2,
  },
  styleItem: {
    fontSize: 12,
    fontFamily: 'Default',
    color: '#A8B0BD',
    lineHeight: 17,
    letterSpacing: 0.15,
  },
  progressCardFlat: {
    backgroundColor: 'rgba(63, 63, 63, 0.25)',
    borderRadius: 10,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168, 198, 255, 0.25)',
  },
  progressCardDecoration: {
    position: 'absolute',
    right: -6,
    bottom: -8,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 0,
  },
  progressCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
  },
  progressNumber: {
    fontSize: 27,
    fontWeight: '700',
    fontFamily: 'Caladea-Bold',
    color: '#A8C6FF',
    marginRight: 15,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Default',
    color: '#A8B0BD',
    lineHeight: 18,
    letterSpacing: 0.15,
    flex: 1,
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
  logoImage: {
    width: 50,
    height: 50,
    marginBottom: 12,
    opacity: 0.6,
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
