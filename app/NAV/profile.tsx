import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {
  ChartBar as BarChart3,
  UserPlus,
  User,
  Settings,
  Lock,
} from 'lucide-react-native';
import { useFonts, Caladea_400Regular } from '@expo-google-fonts/caladea';
import { useOOTD } from '@/hooks/useOOTD';
import { currentUser } from '@/data/ootd';
import { calculateOOTDStreak } from '@/utils/ootdStreak';
import { resolveUserAvatarSource } from '@/utils/userAvatar';
import FlameIcon from '@/components/FlameIcon';
import { LAYOUT, constrainedWidth, getConstrainedWidth } from '@/constants/layout';
import type { OOTD } from '@/types/ootd';

const GRID_GAP = 6;
const PHOTO_CORNER_RADIUS = 10;

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
            aspectRatio: 3 / 4,
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

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const { userOOTDs } = useOOTD();
  const ootdStreak = calculateOOTDStreak(userOOTDs);
  const { width: windowWidth } = useWindowDimensions();
  const profileAvatarSource = resolveUserAvatarSource(currentUser);

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
  });

  const { cellWidth } = useMemo(() => {
    const contentW = getConstrainedWidth(windowWidth);
    const inner = contentW - LAYOUT.paddingHorizontal * 2;
    const w = (inner - GRID_GAP) / 2;
    return { cellWidth: Math.max(120, w) };
  }, [windowWidth]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerWrapper}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topNav}>
            <TouchableOpacity style={styles.navButton}>
              <BarChart3 size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <UserPlus size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Settings size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profilePictureContainer}>
              {profileAvatarSource ? (
                <Image
                  source={profileAvatarSource}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <User size={44} color="#AEAEB2" strokeWidth={1.75} />
                </View>
              )}
            </View>

            <Text style={styles.name}>{currentUser.name}</Text>

            <View style={styles.statsContainer}>
              <Text style={styles.statsPart}>@{currentUser.username}</Text>
              <Text style={styles.statsSep}> · </Text>
              <Text style={styles.statsPart}>13 friends</Text>
              <Text style={styles.statsSep}> · </Text>
              <View style={styles.streakInline}>
                <FlameIcon width={16} height={22} />
                <Text style={styles.streakNumber}>{ootdStreak}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'posts' && styles.activeTabText,
                ]}
              >
                Posts
              </Text>
              {activeTab === 'posts' && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
              onPress={() => setActiveTab('saved')}
            >
              <View style={styles.savedTabContent}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'saved' && styles.activeTabText,
                  ]}
                >
                  Saved Posts
                </Text>
                <Lock
                  size={16}
                  color={activeTab === 'saved' ? '#C0D1FF' : '#757575'}
                />
              </View>
              {activeTab === 'saved' && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            {activeTab === 'posts' && userOOTDs.length > 0 && (
              <View style={styles.ootdsGrid}>
                {userOOTDs.map((ootd, index) => (
                  <ProfilePostTile
                    key={ootd.id}
                    ootd={ootd}
                    cellWidth={cellWidth}
                    gapAfter={index % 2 === 0 ? GRID_GAP : 0}
                    marginBottom={GRID_GAP}
                  />
                ))}
              </View>
            )}

            {activeTab === 'saved' && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No saved posts yet</Text>
              </View>
            )}

            {activeTab === 'posts' && userOOTDs.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No OOTDs yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start sharing your daily outfits!
                </Text>
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  profilePictureContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#2C2C2E',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A3A3C',
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    marginBottom: 10,
    fontFamily: 'Caladea-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  statsPart: {
    color: '#E5E7EB',
    fontSize: 15,
    fontFamily: 'System',
  },
  statsSep: {
    color: '#9CA3AF',
    fontSize: 15,
    fontFamily: 'System',
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakNumber: {
    color: '#A5B4FC',
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '700',
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#757575',
    fontFamily: 'System',
  },
  activeTabText: {
    color: '#C0D1FF',
    fontWeight: '500',
  },
  savedTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#C0D1FF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 12,
    paddingBottom: 24,
  },
  ootdsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    paddingTop: 64,
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
