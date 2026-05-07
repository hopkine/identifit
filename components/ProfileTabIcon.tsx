import React from 'react';
import Svg, { Path } from 'react-native-svg';

type ProfileTabIconProps = {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
};

/**
 * `fi-rr-user`-style user icon (FontIcons / Flaticon UIcons).
 * Implemented as inline SVG so it works in Expo without extra font setup.
 */
export default function ProfileTabIcon({
  width = 24,
  height = 24,
  color = '#FFFFFF',
  strokeWidth = 2,
}: ProfileTabIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12a4.25 4.25 0 1 0 0-8.5A4.25 4.25 0 0 0 12 12Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.5 20.5c.8-3.6 4.1-6 7.5-6s6.7 2.4 7.5 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

