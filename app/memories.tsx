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
import { ChevronLeft, Info } from 'lucide-react-native';
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
/** Future dates only — muted; past empty days stay white */
const DAY_INACTIVE = 'rgba(235, 235, 245, 0.38)';
const BORDER_HIGHLIGHT = '#FFFFFF';
const ACCENT = LAYOUT.accentPurple;

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
      requestAnimationFrame(() => {
        setTimeout(() => scrollToMonth(d, true), 80);
      });
    }, [scrollToMonth])
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
    const t = setTimeout(() => {
      scrollToMonth(calendarNowRef.current, true);
    }, 120);
    return () => clearTimeout(t);
  }, [userOOTDs, months, scrollToMonth]);

  const monthTitle = (year: number, month: number) =>
    new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

  const onInfo = useCallback(() => {
    Alert.alert(
      'Calendar',
      'OOTDs appear on days when you logged a look. The ring highlights your latest post when nothing is selected.'
    );
  }, []);

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

        <View style={styles.headerTitleWrap} pointerEvents="none">
          <Text style={styles.headerTitle}>Calendar</Text>
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
        {months.map(({ year, month }) => {
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
                    // Future dates: show day number greyed out; not selectable.
                    if (
                      year === calendarNow.getFullYear() &&
                      month === calendarNow.getMonth() &&
                      day > calendarNow.getDate()
                    ) {
                      return (
                        <View
                          key={`f-${wi}-${di}`}
                          style={[styles.cellColumn, { width: cellSize }]}
                          accessibilityLabel={`${monthTitle(year, month)} ${day}, future date`}
                          accessibilityState={{ disabled: true }}
                        >
                          <View style={[styles.fireSlot, { height: FIRE_SLOT_HEIGHT }]} />
                          <View
                            style={[
                              styles.plainDayCell,
                              { width: cellSize, height: cellContentH },
                            ]}
                          >
                            <Text style={styles.inactiveDay}>{day}</Text>
                          </View>
                        </View>
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
                      <View
                        key={dateKey}
                        style={[styles.cellColumn, { width: cellSize }]}
                      >
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
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
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
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  inactiveDay: {
    fontSize: 17,
    fontWeight: '500',
    color: DAY_INACTIVE,
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
    fontSize: 17,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
