import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Plus, Users, Sparkles } from 'lucide-react-native';
import { useFonts, Caladea_400Regular, Caladea_700Bold } from '@expo-google-fonts/caladea';
import { WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold } from '@expo-google-fonts/work-sans';
import { mockFriends } from '@/data/social';
import { useOOTD } from '@/hooks/useOOTD';
import { currentUser } from '@/data/ootd';
import OOTDCard from '@/components/OOTDCard';
import { LAYOUT, constrainedWidth } from '@/constants/layout';

export default function SocialScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { getAllFriendsOOTDs, toggleOOTDLike } = useOOTD();
  const allOOTDs = getAllFriendsOOTDs();
  
  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
    'WorkSans-Regular': WorkSans_400Regular,
    'WorkSans-Medium': WorkSans_500Medium,
    'WorkSans-SemiBold': WorkSans_600SemiBold,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = (ootdId: string) => {
    toggleOOTDLike(ootdId);
  };

  const handleAddOutfit = () => {
    Alert.alert(
      'Share Your OOTD',
      'Ready to share today\'s outfit with your friends?',
      [
        { text: 'Take Photo', onPress: () => console.log('Take photo') },
        { text: 'Choose from Gallery', onPress: () => console.log('Choose from gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleOOTDPress = (ootd: any) => {
    const user = ootd.userId === currentUser.id ? currentUser : mockFriends.find(f => f.id === ootd.userId);
    if (user) {
      Alert.alert(
        `${user.name}'s OOTD`,
        `Posted ${formatTimeAgo(ootd.createdAt)} ago\n${ootd.occasion ? `For: ${ootd.occasion}` : ''}\n${ootd.weather ? `Weather: ${ootd.weather}` : ''}`,
        [{ text: 'Got it!' }]
      );
    }
  };

  const handleOutfitPress = (outfit: any) => {
    const friend = mockFriends.find(f => f.id === outfit.userId);
    if (friend) {
      Alert.alert(
        `${friend.name}'s OOTD`,
        `Posted ${formatTimeAgo(outfit.createdAt)} ago\n${outfit.occasion ? `For: ${outfit.occasion}` : ''}\n${outfit.weather ? `Weather: ${outfit.weather}` : ''}`,
        [{ text: 'Got it!' }]
      );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours} hours`;
    return `${Math.floor(diffInHours / 24)} days`;
  };

  // Group OOTDs by user
  const ootdsByUser = allOOTDs.reduce((acc, ootd) => {
    if (!acc[ootd.userId]) {
      acc[ootd.userId] = [];
    }
    acc[ootd.userId].push(ootd);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort users by most recent OOTD (including current user)
  const allUsers = [currentUser, ...mockFriends];
  const sortedUsers = allUsers
    .filter(user => ootdsByUser[user.id]?.length > 0)
    .sort((a, b) => {
      const aLatest = Math.max(...ootdsByUser[a.id].map(o => new Date(o.createdAt).getTime()));
      const bLatest = Math.max(...ootdsByUser[b.id].map(o => new Date(o.createdAt).getTime()));
      return bLatest - aLatest;
    });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerWrapper}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Users size={24} color="#A8B3FF" />
            <Text style={styles.headerTitle}>Friends' OOTDs</Text>
          </View>
          <Text style={styles.headerSubtitle}>Get inspired by your friends' style</Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddOutfit}>
          <Image 
            source={require('@/assets/images/Group 32 (1).png')} 
            style={styles.addButtonImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A8B3FF"
          />
        }
      >
        {/* Online Friends Count */}
        <View style={styles.onlineSection}>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>
              {[currentUser, ...mockFriends].filter(f => f.isOnline).length} users online
            </Text>
          </View>
        </View>

        {/* OOTDs Grid */}
        <View style={styles.ootdsGrid}>
          {sortedUsers.map((user) => {
            const userOOTDs = ootdsByUser[user.id] || [];
            const latestOOTD = userOOTDs.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];

            return userOOTDs.slice(0, 3).map((ootd) => (
              <OOTDCard
                key={ootd.id}
                ootd={ootd}
                user={user}
                onLike={handleLike}
                onPress={() => handleOOTDPress(ootd)}
                showUser={true}
              />
            ));
          })}
        </View>

        {/* Inspiration Section */}
        <View style={styles.inspirationSection}>
          <View style={styles.inspirationHeader}>
            <Sparkles size={20} color="#A8B3FF" />
            <Text style={styles.inspirationTitle}>Style Inspiration</Text>
          </View>
          
          <Text style={styles.inspirationText}>
            The community has shared {allOOTDs.length} OOTDs this week! 
            Keep the inspiration flowing by sharing your own looks.
          </Text>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleAddOutfit}>
            <Text style={styles.shareButtonText}>Share Today's Outfit</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State for New Users */}
        {sortedUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={64} color="#4A4A4C" />
            <Text style={styles.emptyTitle}>No OOTDs Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start sharing your daily outfits to inspire others!
            </Text>
            <TouchableOpacity style={styles.inviteButton}>
              <Text style={styles.inviteButtonText}>Share Your First OOTD</Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'WorkSans-Regular',
    color: '#9CA3AF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A8B3FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A8B3FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  onlineSection: {
    marginBottom: 20,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  onlineText: {
    fontSize: 12,
    fontFamily: 'WorkSans-Medium',
    color: '#4ADE80',
  },
  ootdsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  inspirationSection: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inspirationTitle: {
    fontSize: 18,
    fontFamily: 'Caladea-Bold',
    color: '#C0D1FF',
  },
  inspirationText: {
    fontSize: 14,
    fontFamily: 'WorkSans-Regular',
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#A8B3FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    fontFamily: 'WorkSans-SemiBold',
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Caladea-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'WorkSans-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  inviteButton: {
    backgroundColor: '#A8B3FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  inviteButtonText: {
    fontSize: 14,
    fontFamily: 'WorkSans-SemiBold',
    color: '#000000',
  },
});