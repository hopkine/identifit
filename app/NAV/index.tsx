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
import { currentUser } from '@/data/ootd';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import StreakIcon from '@/components/StreakIcon';
import StarIcon from '@/components/StarIcon';
import ClosetIcon from '@/components/ClosetIcon';

/** Outfit-of-the-week strip — matches design reference proportions (~1 : 3.7) */
const OUTFIT_SLOT_WIDTH = 56;
const OUTFIT_SLOT_HEIGHT = 208;
const OUTFIT_DAY_GAP = 10;
/** Dot + date + weekday stack above each slot (aligns chevron with slot column) */
const OUTFIT_LABEL_STACK_HEIGHT = 64;

/** Corner decoration icons on stat cards (Streak + Top Styles) */
const STAT_CARD_DECOR_ICON_WIDTH = 46;
const STAT_CARD_DECOR_ICON_HEIGHT = 70;

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
      allowsEditing: true,
      aspect: [3, 4],
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

  // Calculate OOTD streak
  const calculateOOTDStreak = () => {
    if (userOOTDs.length === 0) return 0;

    // Sort OOTDs by date (most recent first)
    const sortedOOTDs = [...userOOTDs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    // Check each day going backwards from today
    for (let i = 0; i < 365; i++) {
      // Max check 1 year
      const dateString = currentDate.toISOString().split('T')[0];
      const hasOOTDForDate = sortedOOTDs.some(
        (ootd) => ootd.date === dateString
      );

      if (hasOOTDForDate) {
        streak++;
      } else {
        // If we haven't found any OOTDs yet, keep looking (maybe they started yesterday)
        if (streak === 0 && i === 0) {
          // Today doesn't have an OOTD, check yesterday
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        // Break the streak if we find a day without an OOTD
        break;
      }

      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const currentStreak = calculateOOTDStreak();

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
          <Text style={styles.greeting}>
            Good Morning {currentUser.name.split(' ')[0]}!
          </Text>
          <Text style={styles.subtitle}>Keep your streaks going strong</Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.dayStreakCard}>
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
            </View>

            <View style={styles.topStylesCard}>
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
            </View>
          </View>

          <View style={styles.progressCard}>
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
          </View>
        </View>

        <View style={styles.pageIndicator}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        {/* Outfit of the Week — closed card */}
        <View style={styles.outfitSectionWrapper}>
          <View style={styles.outfitSectionInner}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {currentUser.name.split(' ')[0]}'s Outfit of the Week
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
                      <Image
                        source={
                          typeof day.ootd?.imageUri === 'string'
                            ? { uri: day.ootd.imageUri }
                            : day.ootd?.imageUri
                        }
                        style={styles.backgroundImage}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.addOutfitButton}
                      onPress={handleAddOutfit}
                      activeOpacity={0.85}
                    >
                      <View style={styles.addOutfitCircle}>
                        <Plus size={18} color="#1a1a1a" strokeWidth={2.5} />
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
          </View>
        </View>

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
    marginBottom: 24,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Helvetica Neue',
    color: '#C0D1FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 25,
    fontFamily: 'Caladea-Regular',
    color: '#ffffff',
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
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(63, 63, 63, 0.25)',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  dayStreakCard: {
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
  dayStreakTextBlock: {
    zIndex: 1,
  },
  topStylesCard: {
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
  statNumber: {
    fontSize: 27,
    color: '#E5ADFE',
    fontFamily: 'Caladea-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    color: '#9CA3AF',
    lineHeight: 18,
  },
  statTitle: {
    fontSize: 22,
    color: '#EBFCB7',
    fontFamily: 'Caladea-Bold',
    fontWeight: 'Bold',
  },
  styleItem: {
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    color: '#9CA3AF',
  },
  iconImage: {
    width: 40,
    height: 40,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  progressCard: {
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
    fontFamily: 'Helvetica Neue',
    color: '#9CA3AF',
    lineHeight: 18,
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
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Caladea-Regular',
    color: '#ffffff',
  },
  sectionDate: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Helvetica Neue',
    color: '#B3C8FF',
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
    fontWeight: '400',
    fontFamily: 'Helvetica Neue',
    color: '#ffffff',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    color: 'rgba(255, 255, 255, 0.82)',
    marginBottom: 10,
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
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.92)',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 18,
    fontFamily: 'Caladea-Regular',
    color: '#C0D1FF',
    opacity: 0.8,
    marginBottom: 4,
  },
  logoTagline: {
    fontSize: 12,
    color: '#9CA3AF',
    opacity: 0.7,
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
