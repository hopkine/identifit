import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Heart, Clock } from 'lucide-react-native';
import { Friend, FriendOutfit } from '@/types/social';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

interface FriendOutfitCardProps {
  friend: Friend;
  outfit: FriendOutfit;
  onLike: (outfitId: string) => void;
  onPress?: () => void;
}

export default function FriendOutfitCard({
  friend,
  outfit,
  onLike,
  onPress,
}: FriendOutfitCardProps) {
  const [isLiked, setIsLiked] = useState(outfit.isLiked);
  const [likesCount, setLikesCount] = useState(outfit.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(outfit.id);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
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
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Friend Header */}
      <View style={styles.friendHeader}>
        <View style={styles.friendInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: friend.avatar }} style={styles.avatar} />
            {friend.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <Text style={styles.friendName}>{friend.name}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Clock size={12} color="#6B7280" />
          <Text style={styles.timeText}>{formatTimeAgo(outfit.postedAt)}</Text>
        </View>
      </View>

      {/* Outfit Image */}
      <View style={styles.outfitContainer}>
        <Image 
          source={{ uri: outfit.cutoutImage || outfit.image }} 
          style={styles.outfitImage}
          resizeMode="cover"
        />
        
        {/* Overlay Info */}
        <View style={styles.overlayInfo}>
          {outfit.weather && (
            <View style={styles.weatherBadge}>
              <Text style={styles.weatherIcon}>{getWeatherIcon(outfit.weather)}</Text>
            </View>
          )}
          {outfit.occasion && (
            <View style={styles.occasionBadge}>
              <Text style={styles.occasionIcon}>{getOccasionIcon(outfit.occasion)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Like Section */}
      <View style={styles.likeSection}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Heart 
            size={20} 
            color={isLiked ? "#EF4444" : "#9CA3AF"} 
            fill={isLiked ? "#EF4444" : "transparent"}
          />
        </TouchableOpacity>
        
        <Text style={styles.likesCount}>
          {likesCount > 0 ? likesCount : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  friendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  friendInfo: {
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
  friendName: {
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
  outfitContainer: {
    position: 'relative',
    aspectRatio: 3/4,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  overlayInfo: {
    position: 'absolute',
    top: 8,
    right: 8,
    gap: 4,
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