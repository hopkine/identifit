import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  type ImageSourcePropType,
} from 'react-native';
import {
  SlidersHorizontal,
  Bell,
  Share2,
  UserPlus,
  Music,
  Send,
  MessageCircle,
  Smile,
  MessageSquare,
  User as UserIcon,
} from 'lucide-react-native';
import FilterSortSheet, { type FilterState } from '@/components/FilterSortSheet';
import { LAYOUT } from '@/constants/layout';
import { useOOTD } from '@/hooks/useOOTD';
import { resolveUserAvatarSource } from '@/utils/userAvatar';
import type { OOTD, User } from '@/types/ootd';
import { SymbolView } from 'expo-symbols';

const FEED_EDGE_INSET = 10;
const PHOTO_CORNER_RADIUS = 22;

type FeedItem = {
  id: string;
  imageSource: any;
  likeTargetId?: string;
  /** Display name (profile / settings) */
  displayName: string;
  /** Handle without @ */
  username: string;
  avatarSource: ImageSourcePropType | null;
  timestamp: string;
};

function shortTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const hours = Math.floor((Date.now() - then) / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function posterForOotd(ootd: OOTD, self: User): User {
  if (ootd.userId === self.id) return self;
  return {
    id: ootd.userId,
    name: 'User',
    username: 'user',
    isOnline: false,
  };
}

export default function ExploreScreen() {
  const router = useRouter();
  const { getAllFriendsOOTDs, currentUserForDisplay } = useOOTD();
  const [activeTab, setActiveTab] = useState<'friends' | 'forYou'>('friends');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [appliedShowNearMe, setAppliedShowNearMe] = useState(false);

  const handleApplyFilters = (filters: FilterState) => {
    setAppliedShowNearMe(filters.showNearMe);
  };

  const feedItems = useMemo<FeedItem[]>(() => {
    if (activeTab === 'forYou') {
      return [];
    }

    const all = getAllFriendsOOTDs();
    const afterNearMe = appliedShowNearMe
      ? all.slice(0, Math.min(2, all.length))
      : all;
    return afterNearMe.map((ootd) => {
      const poster = posterForOotd(ootd, currentUserForDisplay);
      return {
        id: ootd.id,
        imageSource:
          typeof ootd.imageUri === 'string'
            ? { uri: ootd.imageUri }
            : ootd.imageUri,
        likeTargetId: ootd.id,
        displayName: poster.name,
        username: poster.username,
        avatarSource: resolveUserAvatarSource(poster),
        timestamp: shortTimeAgo(ootd.createdAt),
      };
    });
  }, [activeTab, appliedShowNearMe, getAllFriendsOOTDs, currentUserForDisplay]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerWrapper}>
        {/* Header — utility icons only, no centered wordmark */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerToolIcon}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Share"
            >
              <Share2 size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerToolIcon}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Add friends"
            >
              <UserPlus size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerToolIcon}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Audio"
            >
              <Music size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => setShowFilterSheet(true)}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Filters"
            >
              <SlidersHorizontal size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Segmented tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('friends')}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'friends' }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'friends' && styles.activeTabText,
                ]}
              >
                My Friends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('forYou')}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'forYou' }}
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
          </View>

          <View style={styles.feedContainer}>
            {feedItems.length === 0 && (
              <View style={styles.emptyFeed}>
                <Text style={styles.emptyFeedTitle}>No posts yet</Text>
                <Text style={styles.emptyFeedSubtitle}>
                  {activeTab === 'forYou'
                    ? 'Recommendations will show here once we connect your style sources.'
                    : 'Share an outfit from Home or check back when friends post.'}
                </Text>
              </View>
            )}
            {feedItems.map((item, index) => (
              <View key={`${activeTab}-${item.id}-${index}`} style={styles.feedCard}>
                <View style={styles.feedHeaderRow}>
                  {item.avatarSource ? (
                    <Image
                      source={item.avatarSource}
                      style={styles.avatarImage}
                      accessibilityIgnoresInvertColors
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <UserIcon size={18} color="#AEAEB2" strokeWidth={1.75} />
                    </View>
                  )}
                  <View style={styles.feedHeaderText}>
                    <Text style={styles.displayNameText}>{item.displayName}</Text>
                    <Text style={styles.metaText}>
                      @{item.username} · {item.timestamp}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.moreButton}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="More"
                  >
                    <SymbolView
                      name="ellipsis"
                      size={18}
                      tintColor="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.photoShell}>
                  {activeTab === 'friends' && item.likeTargetId ? (
                    <TouchableOpacity
                      activeOpacity={0.92}
                      onPress={() =>
                        router.push({
                          pathname: '/style-overlay',
                          params: { ootdId: item.likeTargetId },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel="View post and recreate outfit"
                      style={styles.photoShellTouchable}
                    >
                      <Image
                        source={item.imageSource}
                        style={styles.feedImage}
                        resizeMode="cover"
                      />
                      <View style={styles.photoOverlayActions} pointerEvents="box-none">
                        <TouchableOpacity
                          style={styles.photoOverlayIconHit}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Send"
                        >
                          <Send size={22} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.photoOverlayIconHit}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Comments"
                        >
                          <MessageCircle size={22} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.photoOverlayIconHit}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="React"
                        >
                          <Smile size={22} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <Image
                        source={item.imageSource}
                        style={styles.feedImage}
                        resizeMode="cover"
                      />
                      <View style={styles.photoOverlayActions} pointerEvents="box-none">
                        <TouchableOpacity
                          style={styles.photoOverlayIconHit}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Send"
                        >
                          <Send size={22} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.photoOverlayIconHit}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="Comments"
                        >
                          <MessageCircle size={22} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.photoOverlayIconHit}
                          activeOpacity={0.75}
                          accessibilityRole="button"
                          accessibilityLabel="React"
                        >
                          <Smile size={22} color="#FFFFFF" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.addCommentRow}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Add a comment"
                >
                  <MessageSquare
                    size={17}
                    color="rgba(255,255,255,0.55)"
                    strokeWidth={2}
                  />
                  <Text style={styles.addCommentText}>Add a comment...</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

      {/* Filter Sheet */}
      <FilterSortSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApplyFilters={handleApplyFilters}
        itemCountDefault={feedItems.length}
        itemCountNearMe={Math.min(2, feedItems.length)}
      />
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
    maxWidth: '100%',
    backgroundColor: LAYOUT.navScreenBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: FEED_EDGE_INSET,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 0,
  },
  headerToolIcon: {
    paddingVertical: 4,
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 6,
    gap: 22,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  tab: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  feedContainer: {
    paddingBottom: 120,
    gap: 28,
  },
  emptyFeed: {
    paddingHorizontal: FEED_EDGE_INSET + 8,
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyFeedTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyFeedSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  feedCard: {
    backgroundColor: 'transparent',
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: FEED_EDGE_INSET,
    paddingRight: FEED_EDGE_INSET,
    paddingBottom: 12,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  feedHeaderText: {
    flex: 1,
    paddingLeft: 10,
    minWidth: 0,
    paddingRight: 8,
    justifyContent: 'center',
  },
  displayNameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'System',
    fontWeight: Platform.OS === 'ios' ? '400' : '500',
  },
  moreButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  photoShellTouchable: {
    width: '100%',
  },
  photoShell: {
    marginHorizontal: FEED_EDGE_INSET,
    borderRadius: PHOTO_CORNER_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    position: 'relative',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
        }
      : { elevation: 8 }),
  },
  feedImage: {
    width: '100%',
    height: 440,
  },
  photoOverlayActions: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    alignItems: 'center',
    gap: 20,
  },
  photoOverlayIconHit: {
    padding: 4,
  },
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
    paddingLeft: FEED_EDGE_INSET + 2,
    paddingRight: FEED_EDGE_INSET,
  },
  addCommentText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: Platform.OS === 'ios' ? '400' : '400',
  },
});
