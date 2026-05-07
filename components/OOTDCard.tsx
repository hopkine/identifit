import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Heart, Clock, Lock, User as UserIcon } from 'lucide-react-native';
import { OOTD, User } from '@/types/ootd';
import { LAYOUT, getConstrainedWidth } from '@/constants/layout';
import { resolveUserAvatarSource } from '@/utils/userAvatar';

/** Gap between the two columns in profile/social grids (parent uses space-between). */
const GRID_COLUMN_GAP = 10;

interface OOTDCardProps {
  ootd: OOTD;
  user: User;
  onLike: (ootdId: string) => void;
  onPress?: () => void;
  showUser?: boolean;
}

export default function OOTDCard({
  ootd,
  user,
  onLike,
  onPress,
  showUser = true,
}: OOTDCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = useMemo(() => {
    const contentW = getConstrainedWidth(windowWidth);
    const inner =
      contentW - LAYOUT.paddingHorizontal * 2 - GRID_COLUMN_GAP;
    return Math.max(130, inner / 2);
  }, [windowWidth]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const avatarSource = resolveUserAvatarSource(user);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeatherIcon = (weather?: string) => {
    const icons: Record<string, string> = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      snowy: '❄️',
      windy: '💨',
      hot: '🔥',
    };
    return weather ? icons[weather] : '';
  };

  const getOccasionIcon = (occasion?: string) => {
    const icons: Record<string, string> = {
      work: '💼',
      school: '🎓',
      date: '💕',
      party: '🎉',
      casual: '☕',
      workout: '💪',
      travel: '✈️',
      formal: '🎭',
      outdoor: '🌲',
      shopping: '🛍️',
    };
    return occasion ? icons[occasion] : '';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* User Header */}
      {showUser && (
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <UserIcon size={18} color="#AEAEB2" strokeWidth={1.75} />
                </View>
              )}
              {user.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Clock size={12} color="#6B7280" />
            <Text style={styles.timeText}>{formatTimeAgo(ootd.createdAt)}</Text>
          </View>
        </View>
      )}

      {/* OOTD Image */}
      <View style={styles.ootdContainer}>
        <Image 
          source={typeof ootd.imageUri === 'string' ? { uri: ootd.imageUri } : ootd.imageUri}
          style={styles.ootdImage}
          resizeMode="cover"
        />
        
        {/* Overlay Info */}
        <View style={styles.overlayInfo}>
          {ootd.isPrivate && (
            <View style={styles.privateBadge}>
              <Lock size={12} color="#ffffff" />
            </View>
          )}
          {ootd.weather && (
            <View style={styles.weatherBadge}>
              <Text style={styles.weatherIcon}>{getWeatherIcon(ootd.weather)}</Text>
            </View>
          )}
          {ootd.occasion && (
            <View style={styles.occasionBadge}>
              <Text style={styles.occasionIcon}>{getOccasionIcon(ootd.occasion)}</Text>
            </View>
          )}
        </View>

        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{formatDate(ootd.date)}</Text>
        </View>
      </View>

      {/* Like Section */}
      <View style={styles.likeSection}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => onLike(ootd.id)}
          activeOpacity={0.7}
        >
          <Heart 
            size={20} 
            color={ootd.isLiked ? "#EF4444" : "#9CA3AF"} 
            fill={ootd.isLiked ? "#EF4444" : "transparent"}
          />
        </TouchableOpacity>
        
        <Text style={styles.likesCount}>
          {ootd.likes > 0 ? ootd.likes : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Default',
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Default',
    color: '#6B7280',
  },
  ootdContainer: {
    position: 'relative',
    aspectRatio: 3/4,
  },
  ootdImage: {
    width: '100%',
    height: '100%',
  },
  overlayInfo: {
    position: 'absolute',
    top: 8,
    right: 8,
    gap: 4,
  },
  privateBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 12,
  },
  occasionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 179, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  occasionIcon: {
    fontSize: 12,
  },
  dateBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#FFFFFF',
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  likeButton: {
    padding: 4,
  },
  likesCount: {
    fontSize: 13,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#9CA3AF',
    minWidth: 20,
    textAlign: 'right',
  },
});