import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
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
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
} from '@expo-google-fonts/work-sans';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useOOTD } from '@/hooks/useOOTD';
import { calculateOOTDStreak } from '@/utils/ootdStreak';
import { currentUser } from '@/data/ootd';
import type { OOTD } from '@/types/ootd';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import { BETA_HOME_CARD_3D } from '@/constants/beta';
import StreakIcon from '@/components/StreakIcon';
import StarIcon from '@/components/StarIcon';
import ClosetIcon from '@/components/ClosetIcon';
import OutfitWeekSlotCutout from '@/components/OutfitWeekSlotCutout';

/** Outfit-of-the-week strip — matches design reference proportions (~1 : 3.7) */
const OUTFIT_SLOT_WIDTH = 56;
const OUTFIT_SLOT_HEIGHT = 208;
const OUTFIT_DAY_GAP = 10;
/** Dot + date + weekday stack above each slot (aligns chevron with slot column) */
const OUTFIT_LABEL_STACK_HEIGHT = 64;

/** Corner decoration icons on stat cards (Streak + Top Styles) */
const STAT_CARD_DECOR_ICON_WIDTH = 46;
const STAT_CARD_DECOR_ICON_HEIGHT = 70;

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
  const { saveOOTD, getOOTDForDate, getRecentOOTDs, userOOTDs, deleteOOTD, getTopStyles } =
    useOOTD();
  const cameraRef = React.useRef<any>(null);
  const [showCamera, setShowCamera] = React.useState(false);
  const [facing, setFacing] = React.useState<CameraType>('back');
  const calendarScrollRef = React.useRef<ScrollView>(null);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
    'WorkSans-Regular': WorkSans_400Regular,
    'WorkSans-Medium': WorkSans_500Medium,
    'WorkSans-SemiBold': WorkSans_600SemiBold,
  });

  // Force re-render when OOTDs change
  React.useEffect(() => {
    // This will trigger a re-render when userOOTDs changes
  }, [userOOTDs]);

  if (!fontsLoaded) {
    return null;
  }

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
          onPress: openCamera,
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
      const newOOTD = saveOOTD(result.assets[0].uri, {
        occasion: 'casual', // Could be determined from context or user input
        weather: 'sunny', // Could be fetched from weather API
        isPrivate: false,
      });

      Alert.alert('Success', 'Your OOTD has been saved and shared!');
    }
  };

  const openCamera = async () => {
    setShowCamera(true);
  };

  const takePicture = async (camera: any) => {
    if (camera) {
      const photo = await camera.takePictureAsync({
        quality: 1,
        base64: false,
      });

      setShowCamera(false);
      console.log('Photo taken:', photo.uri);

      // Save the OOTD
      const newOOTD = saveOOTD(photo.uri, {
        occasion: 'casual',
        weather: 'sunny',
        isPrivate: false,
      });

      Alert.alert('Success', 'Your OOTD has been captured and shared!');
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
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
                    Alert.alert('Deleted', 'Your OOTD has been deleted.');
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
                      Alert.alert('Deleted', 'Your OOTD has been deleted.');
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

  if (showCamera) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <StatusBar style="light" />
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => {
                if (cameraRef.current) {
                  takePicture(cameraRef.current);
                }
              }}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.cameraButtonText}>Flip</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  // Generate outfit days based on actual OOTD data
  const generateOutfitDays = () => {
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const days = [];

    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateString = date.toISOString().split('T')[0];
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
      <View style={styles.dayStreakTextBlock}>
        <Text style={styles.statNumber}>{currentStreak}</Text>
        <Text style={styles.statLabel}>day OOTD{'\n'}streak</Text>
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
        <TouchableOpacity style={styles.calendarButton}>
          <Calendar size={18} color="#FFFFFF" />
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
                  <View style={styles.addOutfitCircle}>
                    <Plus size={11} color="#1a1a1a" strokeWidth={2} />
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
          <ChevronRight size={22} color="#B3C8FF" strokeWidth={2} />
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
          <Text style={styles.greetingKicker}>Good morning</Text>
          <Text style={styles.greetingDisplayName}>
            {currentUser.name.split(' ')[0]}
          </Text>
        </View>

        {/* Statistics Cards — 3D shells gated by BETA_HOME_CARD_3D */}
        <View style={styles.statsContainer}>
          {BETA_HOME_CARD_3D && (
            <View style={styles.betaHomeRow}>
              <View style={styles.betaPill}>
                <Text style={styles.betaPillText}>Beta · elevated cards</Text>
              </View>
            </View>
          )}
          <View style={styles.statsRow}>
            {BETA_HOME_CARD_3D ? (
              <View style={styles.dayStreakCardElevated}>
                <View style={styles.dayStreakCard}>{streakCardBody}</View>
              </View>
            ) : (
              <View style={styles.dayStreakCardFlat}>{streakCardBody}</View>
            )}

            {BETA_HOME_CARD_3D ? (
              <View style={styles.topStylesCardElevated}>
                <View style={styles.topStylesCardFace}>
                  {topStylesCardBody}
                </View>
              </View>
            ) : (
              <View style={styles.topStylesCardFlat}>{topStylesCardBody}</View>
            )}
          </View>

          {BETA_HOME_CARD_3D ? (
            <View style={styles.progressCardElevated}>
              <View style={styles.progressCard}>{progressCardBody}</View>
            </View>
          ) : (
            <View style={styles.progressCardFlat}>{progressCardBody}</View>
          )}
        </View>

        <View style={styles.pageIndicator}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        {/* Outfit of the Week */}
        {BETA_HOME_CARD_3D ? (
          <View style={styles.outfitSectionElevated}>
            <View style={styles.outfitSectionFace}>
              <View style={styles.outfitSectionInner}>
                {outfitWeekSectionInner}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.outfitSectionWrapper}>
            <View style={styles.outfitSectionInner}>
              {outfitWeekSectionInner}
            </View>
          </View>
        )}

        {/* Bottom spoiler — scroll to reveal */}
        <View style={styles.spoilerFooter}>
          <View style={styles.spoilerRule} />
          <View style={styles.logoTeaser}>
            <Image
              source={require('@/assets/images/image copy.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
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
    backgroundColor: LAYOUT.backgroundColor,
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
    fontFamily: 'WorkSans-SemiBold',
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
  subtitle: {
    fontSize: 15,
    fontFamily: 'WorkSans-Regular',
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 22,
    letterSpacing: 0.15,
    maxWidth: 320,
  },
  statsContainer: {
    marginBottom: 16,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  betaHomeRow: {
    marginBottom: 10,
  },
  betaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 209, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(192, 209, 255, 0.28)',
  },
  betaPillText: {
    fontSize: 11,
    fontFamily: 'WorkSans-Medium',
    color: '#B3C8FF',
    letterSpacing: 0.35,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(63, 63, 63, 0.25)',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
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
  dayStreakCardElevated: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    shadowColor: '#1a0a10',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 14,
  },
  dayStreakCard: {
    flex: 1,
    backgroundColor: 'rgba(72, 68, 78, 0.42)',
    borderRadius: 11,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    borderLeftColor: 'rgba(255, 255, 255, 0.09)',
    borderRightColor: 'rgba(0, 0, 0, 0.28)',
    borderBottomColor: 'rgba(0, 0, 0, 0.42)',
  },
  streakCardDecoration: {
    position: 'absolute',
    right: -6,
    bottom: -8,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 0,
  },
  dayStreakTextBlock: {
    zIndex: 1,
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
  topStylesCardElevated: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(26, 28, 20, 0.65)',
    shadowColor: '#121808',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.52,
    shadowRadius: 16,
    elevation: 14,
  },
  topStylesCardFace: {
    flex: 1,
    backgroundColor: 'rgba(56, 58, 44, 0.42)',
    borderRadius: 11,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 2,
    borderTopColor: 'rgba(235, 252, 183, 0.22)',
    borderLeftColor: 'rgba(235, 252, 183, 0.11)',
    borderRightColor: 'rgba(0, 0, 0, 0.28)',
    borderBottomColor: 'rgba(0, 0, 0, 0.44)',
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
  statNumber: {
    fontSize: 27,
    color: '#E5ADFE',
    fontFamily: 'Caladea-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'WorkSans-Regular',
    color: '#A8B0BD',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  statTitle: {
    fontSize: 21,
    color: '#EBFCB7',
    fontFamily: 'Caladea-Bold',
    fontWeight: 'bold',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  styleItem: {
    fontSize: 12,
    fontFamily: 'WorkSans-Regular',
    color: '#A8B0BD',
    lineHeight: 17,
    letterSpacing: 0.15,
  },
  iconImage: {
    width: 40,
    height: 40,
    position: 'absolute',
    bottom: 20,
    right: 20,
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
  progressCardElevated: {
    borderRadius: 12,
    backgroundColor: 'rgba(22, 26, 36, 0.65)',
    shadowColor: '#050a18',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 16,
  },
  progressCard: {
    backgroundColor: 'rgba(58, 64, 82, 0.4)',
    borderRadius: 11,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 2,
    borderTopColor: 'rgba(179, 200, 255, 0.22)',
    borderLeftColor: 'rgba(179, 200, 255, 0.1)',
    borderRightColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomColor: 'rgba(0, 0, 0, 0.48)',
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
    fontFamily: 'WorkSans-Regular',
    color: '#A8B0BD',
    lineHeight: 18,
    letterSpacing: 0.15,
    flex: 1,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#595959',
  },
  activeDot: {
    backgroundColor: '#C0D1FF',
  },
  outfitSectionWrapper: {
    marginHorizontal: LAYOUT.paddingHorizontal,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(235, 252, 183, 0.25)',
    backgroundColor: 'rgba(63, 63, 63, 0.25)',
    overflow: 'hidden',
  },
  outfitSectionElevated: {
    marginHorizontal: LAYOUT.paddingHorizontal,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(22, 24, 18, 0.72)',
    shadowColor: '#0a0c06',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.48,
    shadowRadius: 18,
    elevation: 16,
  },
  outfitSectionFace: {
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: 'rgba(52, 54, 42, 0.4)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 2,
    borderTopColor: 'rgba(235, 252, 183, 0.2)',
    borderLeftColor: 'rgba(235, 252, 183, 0.1)',
    borderRightColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomColor: 'rgba(0, 0, 0, 0.45)',
  },
  outfitSectionInner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: 'Caladea-Regular',
    color: '#F8FAFC',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  sectionDate: {
    marginTop: 7,
    fontSize: 12,
    fontFamily: 'WorkSans-Medium',
    color: 'rgba(179, 200, 255, 0.95)',
    letterSpacing: 0.4,
  },
  calendarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'WorkSans-Medium',
    color: '#F1F5F9',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  dayName: {
    fontSize: 11,
    fontFamily: 'WorkSans-Regular',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 10,
    letterSpacing: 0.25,
  },
  currentDayNumber: {
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  currentDayName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.5)',
  },
  addOutfitCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#B3C8FF',
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
    fontFamily: 'WorkSans-Regular',
    color: '#9CA3AF',
    letterSpacing: 0.2,
    opacity: 0.75,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cameraButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
});
