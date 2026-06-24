import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import type { StatsClosetItem } from '@/constants/statsClosetItems';

const DEFAULT_COLUMNS = 2;
const DEFAULT_GAP = 10;
const TILE_RADIUS = 14;

type MasonryCell = {
  item: StatsClosetItem;
  height: number;
};

/** Stable varied heights per item for a masonry look. */
function masonryHeightRatio(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 997;
  }
  return 0.82 + (hash % 48) / 100;
}

function buildMasonryColumns(
  items: StatsClosetItem[],
  columnCount: number,
  columnWidth: number,
  gap: number
): MasonryCell[][] {
  const columns: MasonryCell[][] = Array.from({ length: columnCount }, () => []);
  const colHeights = Array(columnCount).fill(0);

  for (const item of items) {
    const tileHeight = Math.round(columnWidth * masonryHeightRatio(item.id));
    const col = colHeights.indexOf(Math.min(...colHeights));
    columns[col].push({ item, height: tileHeight });
    colHeights[col] += tileHeight + gap;
  }

  return columns;
}

type ClosetMasonryGridProps = {
  items: StatsClosetItem[];
  horizontalPadding?: number;
  gap?: number;
  columnCount?: number;
  maxContentWidth?: number;
  onItemPress?: (item: StatsClosetItem) => void;
};

export default function ClosetMasonryGrid({
  items,
  horizontalPadding = 16,
  gap = DEFAULT_GAP,
  columnCount = DEFAULT_COLUMNS,
  maxContentWidth,
  onItemPress,
}: ClosetMasonryGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = maxContentWidth ?? windowWidth;

  const columnWidth = useMemo(() => {
    const inner = contentWidth - horizontalPadding * 2;
    return (inner - gap * (columnCount - 1)) / columnCount;
  }, [contentWidth, horizontalPadding, gap, columnCount]);

  const columns = useMemo(
    () => buildMasonryColumns(items, columnCount, columnWidth, gap),
    [items, columnCount, columnWidth, gap]
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>No items yet</Text>
        <Text style={styles.emptySubtitle}>
          Clothing from your stats wrap will show up here.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.row,
        { paddingHorizontal: horizontalPadding, gap },
      ]}
    >
      {columns.map((column, colIndex) => (
        <View key={`col-${colIndex}`} style={{ width: columnWidth }}>
          {column.map(({ item, height }) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tile,
                {
                  height,
                  marginBottom: gap,
                  borderRadius: TILE_RADIUS,
                },
              ]}
              activeOpacity={0.88}
              onPress={() => onItemPress?.(item)}
              accessibilityRole="button"
              accessibilityLabel={item.label ?? item.category}
            >
              <Image
                source={item.image}
                style={styles.tileImage}
                resizeMode="contain"
              />
              {item.label ? (
                <View style={styles.labelChip}>
                  <Text style={styles.labelText} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tile: {
    width: '100%',
    backgroundColor: '#1c1c1e',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  labelChip: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  labelText: {
    fontSize: 11,
    fontFamily: 'System',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  emptyWrap: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'System',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
