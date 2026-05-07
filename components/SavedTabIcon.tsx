import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

type SavedTabIconProps = {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
};

/**
 * Icon from `assets/Group 46178.svg`.
 */
export default function SavedTabIcon({
  width = 5,
  height = 5,
  color = '#FFFFFF',
  strokeWidth = 2,
}: SavedTabIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 21 26"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <Path
        d="M1 1H20V23.5625H1V1Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M10.5 1V23.5625"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle
        cx="13.4688"
        cy="13.4688"
        r="0.59375"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx="7.53125"
        cy="13.4688"
        r="0.59375"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M17.625 24.75V23.5625M4.5625 24.75V23.5625"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

