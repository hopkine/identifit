import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import {
  ChartBar as BarChart3,
  UserPlus,
  User,
  Settings,
  Lock,
  Plus,
} from 'lucide-react-native';
import { useFonts, Caladea_400Regular } from '@expo-google-fonts/caladea';
import { useOOTD } from '@/hooks/useOOTD';
import { calculateOOTDStreak } from '@/utils/ootdStreak';
import { resolveUserAvatarSource } from '@/utils/userAvatar';
import FlameIcon from '@/components/FlameIcon';
import { LAYOUT, constrainedWidth, getConstrainedWidth } from '@/constants/layout';
import type { OOTD } from '@/types/ootd';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import DashedLavenderFrame from '@/components/DashedLavenderFrame';

/** Match explore header horizontal inset */
const HEADER_EDGE_INSET = 10;
/** Gutters between grid cells */
const GRID_GAP = 6;
/** Pull grid slightly wider than body text for bigger pins */
const GRID_HORIZONTAL_BLEED = 10;
/** BeReal-style dense profile grid: three thumbnails per row */
const GRID_COLUMNS = 3;
const PHOTO_CORNER_RADIUS = 10;
/** BeReal-style Pins grid: ~3:4 portrait cards (not full-screen 9:16; shorter than phone capture). */
const PIN_ASPECT_RATIO = 3 / 4;

function ProfilePostTile({
  ootd,
  cellWidth,
  gapAfter,
  marginBottom,
}: {
  ootd: OOTD;
  cellWidth: number;
  gapAfter: number;
  marginBottom: number;
}) {
  const source =
    typeof ootd.imageUri === 'string'
      ? { uri: ootd.imageUri }
      : ootd.imageUri;

  return (
    <TouchableOpacity
      style={[
        styles.tileOuter,
        {
          width: cellWidth,
          marginRight: gapAfter,
          marginBottom,
          borderRadius: PHOTO_CORNER_RADIUS,
        },
      ]}
      activeOpacity={0.92}
    >
      <View
        style={[
          styles.tileFrame,
          {
            width: cellWidth,
            aspectRatio: PIN_ASPECT_RATIO,
            borderRadius: PHOTO_CORNER_RADIUS,
          },
        ]}
      >
        <Image
          source={source}
          style={styles.tileImage}
          resizeMode="cover"
        />
        {ootd.isPrivate && (
          <View style={styles.privateCorner}>
            <Lock size={11} color="#ffffff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ProfileAddPinTile({
  cellWidth,
  gapAfter,
  marginBottom,
  onPress,
}: {
  cellWidth: number;
  gapAfter: number;
  marginBottom: number;
  onPress: () => void;
}) {
  const frameHeight = cellWidth / PIN_ASPECT_RATIO;
  return (
    <TouchableOpacity
      style={[
        styles.addPinTileOuter,
        {
          width: cellWidth,
          marginRight: gapAfter,
          marginBottom,
          borderRadius: PHOTO_CORNER_RADIUS,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel="Add outfit"
    >
      <DashedLavenderFrame
        width={cellWidth}
        height={frameHeight}
        borderRadius={PHOTO_CORNER_RADIUS}
      >
        <Plus size={28} color="#A8B3FF" strokeWidth={2.25} />
      </DashedLavenderFrame>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const {
    userOOTDs,
    saveOOTD,
    currentUserForDisplay,
    setProfileAvatar,
    setProfileDisplayName,
  } = useOOTD();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentUserForDisplay.name);

  useEffect(() => {
    if (!editingName) {
      setNameDraft(currentUserForDisplay.name);
    }
  }, [currentUserForDisplay.name, editingName]);

  const beginEditName = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNameDraft(currentUserForDisplay.name);
    setEditingName(true);
  };

  const finishEditName = async () => {
    const t = nameDraft.trim();
    if (!t) {
      setNameDraft(currentUserForDisplay.name);
      setEditingName(false);
      return;
    }
    await setProfileDisplayName(t);
    setEditingName(false);
  };
  const ootdStreak = calculateOOTDStreak(userOOTDs);
  const { width: windowWidth } = useWindowDimensions();
  const profileAvatarSource = resolveUserAvatarSource(currentUserForDisplay);

  const pickProfileFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo library',
        'Allow access to your photos to set a profile picture.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.92,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await setProfileAvatar(result.assets[0].uri);
    }
  };

  const pickProfileFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera',
        'Allow camera access to take a profile picture.'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.92,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await setProfileAvatar(result.assets[0].uri);
    }
  };

  const confirmRemoveProfilePhoto = () => {
    Alert.alert(
      'Remove profile photo',
      'Your profile picture will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void setProfileAvatar(null);
          },
        },
      ]
    );
  };

  const openProfilePhotoOptions = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const hasPhoto = profileAvatarSource != null;
    Alert.alert(
      'Profile photo',
      'Choose a source',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            void pickProfileFromCamera();
          },
        },
        {
          text: 'Photo Library',
          onPress: () => {
            void pickProfileFromLibrary();
          },
        },
        ...(hasPhoto
          ? [
              {
                text: 'Remove Photo',
                style: 'destructive' as const,
                onPress: () => confirmRemoveProfilePhoto(),
              },
            ]
          : []),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      saveOOTD(result.assets[0].uri, {
        occasion: 'casual',
        weather: 'sunny',
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

  const openCreateOOTD = () => {
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
          onPress: () => {
            void pickImageFromLibrary();
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
  });

  const { cellWidth } = useMemo(() => {
    const contentW = getConstrainedWidth(windowWidth);
    const inner =
      contentW -
      LAYOUT.paddingHorizontal * 2 +
      GRID_HORIZONTAL_BLEED * 2;
    const gapsTotal = GRID_GAP * (GRID_COLUMNS - 1);
    const w = (inner - gapsTotal) / GRID_COLUMNS;
    return { cellWidth: Math.max(72, w) };
  }, [windowWidth]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topNav}>
            <TouchableOpacity
              style={[styles.headerToolIcon, styles.headerToolIconFriends]}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Add friends"
            >
              <UserPlus size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.topNavTrailing}>
              <TouchableOpacity
                style={styles.headerIconButton}
                activeOpacity={0.75}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Monthly stats"
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push('/stats-report');
                }}
              >
                <BarChart3 size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                activeOpacity={0.75}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Settings"
              >
                <Settings size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={openProfilePhotoOptions}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              {profileAvatarSource ? (
                <Image
                  source={profileAvatarSource}
                  style={styles.profilePicture}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <User size={36} color="#AEAEB2" strokeWidth={1.75} />
                </View>
              )}
            </TouchableOpacity>

            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={nameDraft}
                onChangeText={setNameDraft}
                onBlur={() => {
                  void finishEditName();
                }}
                onSubmitEditing={() => {
                  void finishEditName();
                }}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
                blurOnSubmit
                accessibilityLabel="Display name"
              />
            ) : (
              <Pressable
                onPress={beginEditName}
                accessibilityRole="button"
                accessibilityLabel="Edit display name"
              >
                <Text style={styles.name}>{currentUserForDisplay.name}</Text>
              </Pressable>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.streakInline}>
                <FlameIcon width={16} height={22} />
                <Text style={styles.streakNumber}>{ootdStreak}</Text>
              </View>
              <Text style={styles.statsSep}> · </Text>
              <Text style={styles.statsPart}>@{currentUserForDisplay.username}</Text>
              <Text style={styles.statsSep}> · </Text>
              <Text style={styles.statsPart}>0 friends</Text>
            </View>
          </View>

          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.tabPressed]}
              onPress={() => setActiveTab('posts')}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'posts' }}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'posts' && styles.tabLabelActive,
                ]}
              >
                Posts
              </Text>
              {activeTab === 'posts' ? (
                <View style={styles.tabUnderline} />
              ) : (
                <View style={styles.tabUnderlinePlaceholder} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'saved' && styles.tabPressed]}
              onPress={() => setActiveTab('saved')}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'saved' }}
            >
              <View style={styles.savedTabRow}>
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'saved' && styles.tabLabelActive,
                  ]}
                >
                  Saved
                </Text>
                <Lock
                  size={14}
                  color={
                    activeTab === 'saved' ? '#B8C4FF' : 'rgba(255,255,255,0.38)'
                  }
                  strokeWidth={2}
                />
              </View>
              {activeTab === 'saved' ? (
                <View style={styles.tabUnderline} />
              ) : (
                <View style={styles.tabUnderlinePlaceholder} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            {activeTab === 'posts' && (
              <>
                {userOOTDs.length === 0 && (
                  <Text style={styles.gridEmptyHint}>
                    No OOTDs yet — tap + to add your first.
                  </Text>
                )}
                <View style={styles.ootdsGridBleed}>
                  <View style={styles.ootdsGrid}>
                    {userOOTDs.map((ootd, index) => (
                      <ProfilePostTile
                        key={ootd.id}
                        ootd={ootd}
                        cellWidth={cellWidth}
                        gapAfter={
                          index % GRID_COLUMNS < GRID_COLUMNS - 1
                            ? GRID_GAP
                            : 0
                        }
                        marginBottom={GRID_GAP}
                      />
                    ))}
                    <ProfileAddPinTile
                      cellWidth={cellWidth}
                      gapAfter={
                        userOOTDs.length % GRID_COLUMNS < GRID_COLUMNS - 1
                          ? GRID_GAP
                          : 0
                      }
                      marginBottom={GRID_GAP}
                      onPress={openCreateOOTD}
                    />
                  </View>
                </View>
              </>
            )}

            {activeTab === 'saved' && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No saved posts yet</Text>
              </View>
            )}

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
    flexGrow: 1,
    paddingBottom: 28,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEADER_EDGE_INSET,
    paddingTop: 12,
    paddingBottom: 14,
  },
  topNavTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  headerToolIcon: {
    paddingVertical: 4,
  },
  headerToolIconFriends: {
    marginLeft: 10,
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 4,
    paddingBottom: 8,
  },
  profilePictureContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: 8,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  profileAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    marginBottom: 8,
    fontFamily: 'Caladea-Regular',
    letterSpacing: -0.2,
  },
  nameInput: {
    color: '#ffffff',
    fontSize: 22,
    marginBottom: 8,
    fontFamily: 'Caladea-Regular',
    letterSpacing: -0.2,
    textAlign: 'center',
    minWidth: 200,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(168, 179, 255, 0.55)',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    rowGap: 6,
    columnGap: 0,
    maxWidth: '100%',
  },
  statsPart: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  statsSep: {
    color: 'rgba(255, 255, 255, 0.28)',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakNumber: {
    color: '#C4CAFF',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
    fontWeight: '700',
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    marginTop: 0,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    paddingTop: 10,
    paddingBottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabPressed: {},
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.35,
    color: 'rgba(255, 255, 255, 0.42)',
  },
  tabLabelActive: {
    color: '#E8EAFF',
  },
  savedTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabUnderline: {
    marginTop: 8,
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: '#A8B3FF',
  },
  tabUnderlinePlaceholder: {
    marginTop: 8,
    height: 2,
    opacity: 0,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 18,
    paddingBottom: 8,
  },
  gridEmptyHint: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
    fontFamily: 'System',
  },
  ootdsGridBleed: {
    marginHorizontal: -GRID_HORIZONTAL_BLEED,
  },
  ootdsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addPinTileOuter: {
    overflow: 'visible',
  },
  tileOuter: {
    overflow: 'hidden',
    backgroundColor: '#1f1f22',
  },
  tileFrame: {
    overflow: 'hidden',
    backgroundColor: '#2C2C2E',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  privateCorner: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptyStateSubtext: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
    marginTop: 8,
  },
});
