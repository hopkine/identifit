import React, { useId } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Mask, Rect, Image as SvgImage } from 'react-native-svg';
import type { ImageSourcePropType } from 'react-native';

const DEFAULT_W = 56;
const DEFAULT_H = 208;
/**
 * Corner radius matches `outfitWeekAddFrame` in app/NAV/home.tsx so filled slots
 * share the same silhouette as the empty “+” column.
 */
const SLOT_RX = 10;
const SLOT_STROKE = 'rgba(255, 255, 255, 0.22)';

function sourceToSvgHref(source: ImageSourcePropType): string | number | null {
  if (typeof source === 'number') return source;
  if (typeof source === 'object' && source !== null && 'uri' in source) {
    const u = (source as { uri?: string }).uri;
    if (typeof u === 'string' && u.length > 0) return u;
  }
  return null;
}

type OutfitWeekSlotCutoutProps = {
  source: ImageSourcePropType;
  width?: number;
  height?: number;
};

export default function OutfitWeekSlotCutout({
  source,
  width = DEFAULT_W,
  height = DEFAULT_H,
}: OutfitWeekSlotCutoutProps) {
  const maskId = useId().replace(/:/g, '');
  const href = sourceToSvgHref(source);

  if (href == null) {
    return (
      <View
        style={[styles.fallback, { width, height, borderRadius: SLOT_RX }]}
      />
    );
  }

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${DEFAULT_W} ${DEFAULT_H}`}>
        <Defs>
          <Mask id={maskId}>
            <Rect
              x={0}
              y={0}
              width={DEFAULT_W}
              height={DEFAULT_H}
              rx={SLOT_RX}
              ry={SLOT_RX}
              fill="#FFFFFF"
            />
          </Mask>
        </Defs>
        <SvgImage
          width={DEFAULT_W}
          height={DEFAULT_H}
          href={href}
          preserveAspectRatio="xMidYMid slice"
          mask={`url(#${maskId})`}
        />
        <Rect
          x={0.5}
          y={0.5}
          width={DEFAULT_W - 1}
          height={DEFAULT_H - 1}
          rx={SLOT_RX}
          ry={SLOT_RX}
          fill="none"
          stroke={SLOT_STROKE}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: 'rgba(40, 40, 40, 0.6)',
    overflow: 'hidden',
  },
});
