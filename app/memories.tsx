import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Alert,
  type ImageSourcePropType,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Info, Flame, Sparkles } from 'lucide-react-native';
import { useOOTD } from '@/hooks/useOOTD';
import { calculateOOTDStreak } from '@/utils/ootdStreak';
import type { OOTD } from '@/types/ootd';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import { toLocalDateKey } from '@/utils/localDateKey';
import { useFocusEffect } from '@react-navigation/native';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

const SCROLL_ABOVE_MONTH = 16;

const BG = '#000000';
const HEADER_BTN_BG = 'rgba(44, 44, 46, 0.85)';
const DAY_LABEL = 'rgba(235, 235, 245, 0.48)';
const BORDER_HIGHLIGHT = '#FFFFFF';
/** Tab bar / identifit accent — soft fill for selected segment */
const SEGMENT_ACTIVE_BG = 'rgba(192, 209, 255, 0.16)';
const PILL_TRACK_BG = 'rgba(255, 255, 255, 0.06)';
const ACCENT = LAYOUT.accentPurple;
const TAB_INACTIVE = 'rgba(255, 255, 255, 0.42)';

type SubTab = 'memories' | 'calendar' | 'recaps';

/** Reserved height above each day so 🔥 / portrait cells align */
const FIRE_SLOT_HEIGHT = 18;
/** Height multiplier for OOTD thumbnails (portrait, BeReal-like) */
const PHOTO_CELL_HEIGHT_MULT = 1.34;

function ootdImageSource(ootd: OOTD): ImageSourcePropType {
  const raw = ootd.cutoutImageUri ?? ootd.imageUri;
  if (raw == null) return { uri: '' };
  return typeof raw === 'string' ? { uri: raw } : raw;
}

/** Flat cells for one month: null = empty pad, number = day of month */
function monthCells(year: number, monthIndex: number): (number | null)[] {
  const first = new Date(year, monthIndex, 1);
  const pad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function chunkWeeks(cells: (number | null)[]): (number | null)[][] {
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function formatGalleryDateLabel(dateStr: string): string {
  const p = dateStr.split('-').map(Number);
  if (p.length < 3 || p.some(Number.isNaN)) return dateStr;
  const d = new Date(p[0], p[1] - 1, p[2]);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MemoriesScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const monthOffsetY = useRef<Record<string, number>>({});
  const calendarNowRef = useRef(new Date());
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(constrainedWidth, windowWidth);
  const horizontalPad = LAYOUT.paddingHorizontal;
  const gap = 6;
  const colCount = 7;
  const innerW = contentW - horizontalPad * 2;
  const cellSize = (innerW - gap * (colCount - 1)) / colCount;
  const cellContentH = Math.round(cellSize * PHOTO_CELL_HEIGHT_MULT);

  const { userOOTDs } = useOOTD();
  const streak = calculateOOTDStreak(userOOTDs);
  const [subTab, setSubTab] = useState<SubTab>('calendar');

  /** Newest OOTD wins when multiple exist on the same calendar day */
  const ootdByDate = useMemo(() => {
    const m = new Map<string, OOTD>();
    const sorted = [...userOOTDs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    for (const o of sorted) {
      if (!m.has(o.date)) m.set(o.date, o);
    }
    return m;
  }, [userOOTDs]);

  const newestOotdDateKey = useMemo(() => {
    if (userOOTDs.length === 0) return null;
    const [first] = [...userOOTDs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return first?.date ?? null;
  }, [userOOTDs]);

  const sortedGallery = useMemo(
    () =>
      [...userOOTDs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [userOOTDs]
  );

  /** Refreshed on screen focus and when returning so “today” stays correct */
  const [calendarNow, setCalendarNow] = useState(() => new Date());
  calendarNowRef.current = calendarNow;

  const todayKey = useMemo(
    () =>
      toLocalDateKey(
        calendarNow.getFullYear(),
        calendarNow.getMonth(),
        calendarNow.getDate()
      ),
    [calendarNow]
  );

  const thisMonthCount = useMemo(() => {
    const y = calendarNow.getFullYear();
    const m = calendarNow.getMonth();
    return userOOTDs.filter((o) => {
      const p = o.date.split('-').map(Number);
      if (p.length < 2) return false;
      return p[0] === y && p[1] - 1 === m;
    }).length;
  }, [userOOTDs, calendarNow]);

  const scrollToMonth = useCallback((d: Date, animated: boolean) => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const y = monthOffsetY.current[key];
    if (y == null || !scrollRef.current) return;
    scrollRef.current.scrollTo({
      y: Math.max(0, y - SCROLL_ABOVE_MONTH),
      animated,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const d = new Date();
      setCalendarNow(d);
      if (subTab !== 'calendar') return;
      requestAnimationFrame(() => {
        setTimeout(() => scrollToMonth(d, true), 80);
      });
    }, [scrollToMonth, subTab])
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  /** Sliding window around today, expanded to include every month that has an OOTD */
  const months = useMemo(() => {
    let rangeMin = new Date(
      calendarNow.getFullYear(),
      calendarNow.getMonth() - 4,
      1
    );
    // Never show future months on the calendar.
    const currentMonthStart = new Date(
      calendarNow.getFullYear(),
      calendarNow.getMonth(),
      1
    );
    let rangeMax = currentMonthStart;

    for (const o of userOOTDs) {
      const p = o.date.split('-');
      if (p.length < 2) continue;
      const y = parseInt(p[0], 10);
      const mo = parseInt(p[1], 10) - 1;
      if (Number.isNaN(y) || Number.isNaN(mo)) continue;
      const monthStart = new Date(y, mo, 1);
      if (monthStart < rangeMin) rangeMin = monthStart;
      // Ignore OOTDs that would land in the future (and never expand past current month).
      if (monthStart > rangeMax && monthStart <= currentMonthStart) rangeMax = monthStart;
    }

    const list: { year: number; month: number }[] = [];
    const cur = new Date(rangeMin.getFullYear(), rangeMin.getMonth(), 1);
    const end = new Date(rangeMax.getFullYear(), rangeMax.getMonth(), 1);
    while (cur.getTime() <= end.getTime()) {
      list.push({ year: cur.getFullYear(), month: cur.getMonth() });
      cur.setMonth(cur.getMonth() + 1);
    }
    return list;
  }, [calendarNow, userOOTDs]);

  /** Re-anchor after OOTD list or month range changes while this screen is open */
  useEffect(() => {
    if (subTab !== 'calendar') return;
    const t = setTimeout(() => {
      scrollToMonth(calendarNowRef.current, true);
    }, 120);
    return () => clearTimeout(t);
  }, [userOOTDs, months, scrollToMonth, subTab]);

  /** Jump to current month when switching back to Calendar */
  useEffect(() => {
    if (subTab !== 'calendar') return;
    const t = setTimeout(() => {
      scrollToMonth(calendarNowRef.current, true);
    }, 50);
    return () => clearTimeout(t);
  }, [subTab, scrollToMonth]);

  const monthTitle = (year: number, month: number) =>
    new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

  const onInfo = useCallback(() => {
    Alert.alert(
      'Memories',
      'OOTDs show on the calendar when you logged a look. Highlights use your streak and latest post. Memories is your gallery; Recaps sums up this month.'
    );
  }, []);

  const galleryGap = 10;
  const galleryCols = 2;
  const galleryThumbW =
    (innerW - galleryGap * (galleryCols - 1)) / galleryCols;
  const galleryThumbH = Math.round(galleryThumbW * PHOTO_CELL_HEIGHT_MULT);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingHorizontal: horizontalPad }]}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.headerPillWrap} pointerEvents="box-none">
          <View style={styles.pillTrack}>
            {(
              [
                ['memories', 'Memories'],
                ['calendar', 'Calendar'],
                ['recaps', 'Recaps'],
              ] as const
            ).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.pillSegment,
                  subTab === key && styles.pillSegmentActive,
                ]}
                onPress={() => setSubTab(key)}
                activeOpacity={0.85}
                accessibilityRole="tab"
                accessibilityState={{ selected: subTab === key }}
              >
                <Text
                  style={[
                    styles.pillSegmentLabel,
                    subTab === key && styles.pillSegmentLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={onInfo}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Info"
        >
          <Info size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPad, paddingBottom: 28 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {subTab === 'calendar' &&
          months.map(({ year, month }) => {
          const cells = monthCells(year, month);
          const weeks = chunkWeeks(cells);
          const monthKey = `${year}-${month}`;
          return (
            <View
              key={monthKey}
              style={styles.monthBlock}
              onLayout={(e) => {
                const y = e.nativeEvent.layout.y;
                monthOffsetY.current[monthKey] = y;
                const d = calendarNowRef.current;
                if (year === d.getFullYear() && month === d.getMonth()) {
                  requestAnimationFrame(() => {
                    scrollToMonth(d, false);
                  });
                }
              }}
            >
              <Text style={styles.monthTitle}>{monthTitle(year, month)}</Text>
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((label) => (
                  <Text key={label} style={[styles.weekdayLabel, { width: cellSize }]}>
                    {label}
                  </Text>
                ))}
              </View>
              {weeks.map((week, wi) => (
                <View key={wi} style={[styles.weekRow, { gap }]}>
                  {week.map((day, di) => {
                    if (day == null) {
                      return (
                        <View
                          key={`e-${wi}-${di}`}
                          style={{
                            width: cellSize,
                            height: FIRE_SLOT_HEIGHT + cellContentH,
                          }}
                        />
                      );
                    }
                    // Never render future dates (including later days in the current month).
                    if (
                      year === calendarNow.getFullYear() &&
                      month === calendarNow.getMonth() &&
                      day > calendarNow.getDate()
                    ) {
                      return (
                        <View
                          key={`f-${wi}-${di}`}
                          style={{
                            width: cellSize,
                            height: FIRE_SLOT_HEIGHT + cellContentH,
                          }}
                        />
                      );
                    }
                    const dateKey = toLocalDateKey(year, month, day);
                    const ootd = ootdByDate.get(dateKey);
                    const isToday = dateKey === todayKey;
                    const isHighlighted =
                      selectedKey !== null
                        ? selectedKey === dateKey
                        : newestOotdDateKey !== null &&
                          dateKey === newestOotdDateKey;
                    const onPress = () => {
                      if (ootd) setSelectedKey(dateKey);
                    };

                    const showStreakFire = isToday && streak > 0;

                    const fireSlot = (
                      <View style={[styles.fireSlot, { height: FIRE_SLOT_HEIGHT }]}>
                        {showStreakFire && !ootd ? (
                          <Text style={styles.fireEmoji} accessibilityLabel="Streak">
                            🔥
                          </Text>
                        ) : null}
                      </View>
                    );

                    if (ootd) {
                      return (
                        <View key={dateKey} style={[styles.cellColumn, { width: cellSize }]}>
                          {fireSlot}
                          <View
                            style={[
                              styles.photoThumbWrap,
                              { width: cellSize, height: cellContentH },
                            ]}
                          >
                            <TouchableOpacity
                              activeOpacity={0.85}
                              onPress={onPress}
                              style={[
                                styles.photoCell,
                                {
                                  width: '100%',
                                  height: '100%',
                                  borderWidth: isHighlighted ? 2 : 0,
                                  borderColor: BORDER_HIGHLIGHT,
                                },
                              ]}
                            >
                              <Image
                                source={ootdImageSource(ootd)}
                                style={styles.photoFill}
                                resizeMode="cover"
                              />
                              <View style={styles.photoOverlay} pointerEvents="none" />
                              <Text style={styles.dayOnPhoto}>{day}</Text>
                            </TouchableOpacity>
                            {showStreakFire ? (
                              <View style={styles.fireBadgeAbove} pointerEvents="none">
                                <Text style={styles.fireEmojiOnThumb}>🔥</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      );
                    }

                    if (isToday) {
                      const circle = Math.min(cellSize, cellContentH) * 0.78;
                      return (
                        <View key={dateKey} style={[styles.cellColumn, { width: cellSize }]}>
                          {fireSlot}
                          <View
                            style={[
                              styles.todaySlot,
                              { width: cellSize, height: cellContentH },
                            ]}
                          >
                            <View
                              style={[
                                styles.todayCircle,
                                {
                                  width: circle,
                                  height: circle,
                                  borderRadius: circle / 2,
                                },
                              ]}
                            >
                              <Text style={styles.todayText}>{day}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    }

                    return (
                      <View key={dateKey} style={[styles.cellColumn, { width: cellSize }]}>
                        {fireSlot}
                        <View
                          style={[
                            styles.plainDayCell,
                            { width: cellSize, height: cellContentH },
                          ]}
                        >
                          <Text style={styles.plainDay}>{day}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          );
        })}

        {subTab === 'memories' && (
          <View style={styles.subPage}>
            {sortedGallery.length === 0 ? (
              <Text style={styles.subPageEmpty}>
                No OOTDs yet. Log a look from Home and it will show here.
              </Text>
            ) : (
              <View style={[styles.galleryGrid, { gap: galleryGap }]}>
                {sortedGallery.map((ootd) => {
                  const ds = formatGalleryDateLabel(ootd.date);
                  return (
                    <View
                      key={ootd.id}
                      style={[
                        styles.galleryTile,
                        { width: galleryThumbW, height: galleryThumbH },
                      ]}
                    >
                      <Image
                        source={ootdImageSource(ootd)}
                        style={styles.galleryImageFill}
                        resizeMode="cover"
                      />
                      <View style={styles.galleryDateTag} pointerEvents="none">
                        <Text style={styles.galleryDateText}>{ds}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {subTab === 'recaps' && (
          <View style={styles.subPage}>
            <View style={styles.recapsHero}>
              <Sparkles size={22} color={ACCENT} strokeWidth={2} />
              <Text style={styles.recapsTitle}>This month</Text>
              <Text style={styles.recapsSubtitle}>
                A quick snapshot of your identifit streak and activity.
              </Text>
            </View>
            <View style={styles.recapCard}>
              <View style={styles.recapCardRow}>
                <Flame size={20} color={ACCENT} strokeWidth={2} />
                <Text style={styles.recapCardLabel}>Current streak</Text>
              </View>
              <Text style={styles.recapCardValue}>
                {streak} {streak === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <View style={styles.recapCard}>
              <Text style={styles.recapCardLabel}>Looks this month</Text>
              <Text style={styles.recapCardValue}>{thisMonthCount}</Text>
            </View>
            <View style={styles.recapCard}>
              <Text style={styles.recapCardLabel}>Total saved</Text>
              <Text style={styles.recapCardValue}>{userOOTDs.length}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: constrainedWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    gap: 8,
  },
  headerPillWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  pillTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PILL_TRACK_BG,
    borderRadius: 22,
    padding: 4,
    maxWidth: '100%',
  },
  pillSegment: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 18,
    minWidth: 0,
  },
  pillSegmentActive: {
    backgroundColor: SEGMENT_ACTIVE_BG,
  },
  pillSegmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TAB_INACTIVE,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  pillSegmentLabelActive: {
    color: '#FFFFFF',
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HEADER_BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    width: '100%',
    maxWidth: constrainedWidth,
  },
  scrollContent: {
    paddingTop: 8,
  },
  monthBlock: {
    marginBottom: 32,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 18,
    letterSpacing: -0.4,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  weekdayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: DAY_LABEL,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cellColumn: {
    alignItems: 'center',
  },
  fireSlot: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  plainDayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainDay: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  fireEmoji: {
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
  },
  todaySlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B0B0C',
  },
  photoCell: {
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: '#141416',
  },
  photoFill: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  photoThumbWrap: {
    position: 'relative',
    overflow: 'visible',
  },
  fireBadgeAbove: {
    position: 'absolute',
    left: -2,
    top: -12,
    zIndex: 5,
  },
  fireEmojiOnThumb: {
    fontSize: 11,
    lineHeight: 13,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dayOnPhoto: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subPage: {
    paddingTop: 8,
    width: '100%',
  },
  subPageEmpty: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  galleryTile: {
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: '#141416',
  },
  galleryImageFill: {
    width: '100%',
    height: '100%',
  },
  galleryDateTag: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  galleryDateText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  recapsHero: {
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  recapsTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  recapsSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  recapCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(168,179,255,0.22)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  recapCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  recapCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },
  recapCardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
});
