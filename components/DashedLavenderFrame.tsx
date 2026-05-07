import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

/** Matches profile add-pin / outfit-week + tiles */
export const DASHED_LAVENDER_STROKE = 'rgba(168, 179, 255, 0.75)';
const STROKE_W = 1;
/** Extra canvas padding so stroke isn’t clipped at the bottom/sides (RN Svg view bounds). */
const STROKE_BLEED = 3;
/** Shorter dashes + gaps → more dashes around the perimeter than RN `borderStyle: 'dashed'` */
const STROKE_DASH_ARRAY = '2.5 2';

type Props = {
  width: number;
  height: number;
  borderRadius: number;
  children: React.ReactNode;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Dashed lavender frame with a denser dash pattern than default platform dashed borders.
 */
export default function DashedLavenderFrame({
  width,
  height,
  borderRadius,
  children,
  backgroundColor = '#161618',
  style,
}: Props) {
  const inset = STROKE_W / 2;
  const w = width - STROKE_W;
  const h = height - STROKE_W;
  const pad = STROKE_BLEED;
  const svgW = width + pad * 2;
  const svgH = height + pad * 2;

  return (
    <View style={[{ width, height, overflow: 'visible' }, style]}>
      <Svg
        width={svgW}
        height={svgH}
        style={{
          position: 'absolute',
          left: -pad,
          top: -pad,
          overflow: 'visible',
        }}
        pointerEvents="none"
      >
        <Rect
          x={pad + inset}
          y={pad + inset}
          width={w}
          height={h}
          rx={borderRadius}
          ry={borderRadius}
          fill={backgroundColor}
          stroke={DASHED_LAVENDER_STROKE}
          strokeWidth={STROKE_W}
          strokeDasharray={STROKE_DASH_ARRAY}
        />
      </Svg>
      <View
        style={[StyleSheet.absoluteFillObject, styles.center]}
        pointerEvents="box-none"
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
