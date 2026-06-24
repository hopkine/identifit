import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StreakIcon from '@/components/StreakIcon';
import StarIcon from '@/components/StarIcon';
import ClosetIcon from '@/components/ClosetIcon';
import { calculateOOTDStreak } from '@/utils/ootdStreak';
import type { OOTD } from '@/types/ootd';

const STAT_CARD_DECOR_ICON_WIDTH = 46;
const STAT_CARD_DECOR_ICON_HEIGHT = 70;
const CLOSET_SIZE_ESTIMATE = 30;

type HomeStatsWidgetsProps = {
  userOOTDs: OOTD[];
  topStyles: string[];
};

export default function HomeStatsWidgets({
  userOOTDs,
  topStyles,
}: HomeStatsWidgetsProps) {
  const currentStreak = calculateOOTDStreak(userOOTDs);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const itemsWornThisMonth = userOOTDs.filter((ootd) => {
    const ootdDate = new Date(ootd.date);
    return (
      ootdDate.getMonth() === currentMonth &&
      ootdDate.getFullYear() === currentYear
    );
  }).length;

  const closetWornPercent = Math.min(
    100,
    Math.round((itemsWornThisMonth / CLOSET_SIZE_ESTIMATE) * 100)
  );

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.dayStreakCardFlat}>
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
        </View>

        <View style={styles.topStylesCardFlat}>
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

      <View style={styles.progressCardFlat}>
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
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
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
});
