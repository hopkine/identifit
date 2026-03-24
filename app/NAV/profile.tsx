import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  ChartBar as BarChart3,
  UserPlus,
  Settings,
  Users,
  Lock,
} from 'lucide-react-native';
import { useOOTD } from '@/hooks/useOOTD';
import { currentUser } from '@/data/ootd';
import OOTDCard from '@/components/OOTDCard';
import { LAYOUT, constrainedWidth } from '@/constants/layout';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const { userOOTDs, toggleOOTDLike } = useOOTD();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerWrapper}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation */}
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

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <Image
              source={require('@/assets/images/image.png')}
              style={styles.profilePicture}
            />
          </View>

          {/* Name */}
          <Text style={styles.name}>{currentUser.name}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.username}>@jacqfly</Text>
            <Text style={styles.separator}>.</Text>
            <View style={styles.statItem}>
              <Text style={styles.statText}>13 friends</Text>
            </View>
            <Text style={styles.separator}>.</Text>
            <View style={styles.statItem}>
              <Image
                source={require('@/assets/images/Group 46129.png')}
                style={styles.streakIcon}
              />
              <Text style={styles.streakNumber}>23</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
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
                color={activeTab === 'saved' ? '#ffffff' : '#757575'}
              />
            </View>
            {activeTab === 'saved' && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
        </View>

        {/* Content Grid */}
        <View style={styles.contentContainer}>
          {activeTab === 'posts' && (
            <View style={styles.ootdsGrid}>
              {userOOTDs.map((ootd) => (
                <OOTDCard
                  key={ootd.id}
                  ootd={ootd}
                  user={currentUser}
                  onLike={toggleOOTDLike}
                  showUser={false}
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
    paddingTop: 16,
    paddingBottom: 16,
    gap: 23,
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
    paddingBottom: 30,
  },
  profilePictureContainer: {
    width: 89,
    height: 89,
    borderRadius: 64,
    overflow: 'hidden',
    marginBottom: 23,
    backgroundColor: '#ffffff',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    color: '#ffffff',
    fontSize: 20,
    marginBottom: 16,
    fontFamily: 'Caladea-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5.5,
  },
  username: {
    color: '#ffffff',
    fontSize: 15,
  },
  separator: {
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#ffffff',
    fontSize: 15,
  },
  streakIcon: {
    width: 16,
    height: 22,
    resizeMode: 'contain',
  },
  streakNumber: {
    color: '#757EFA',
    fontSize: 15,
    fontWeight: 'bold',
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // Additional styling for active tab if needed
  },
  tabText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#757575',
    fontFamily: 'Helvetica Neue',
  },
  activeTabText: {
    color: '#C0D1FF',
    fontWeight: '500',
  },
  savedTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    paddingTop: 16,
  },
  ootdsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
