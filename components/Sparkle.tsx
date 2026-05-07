import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type SparkleProps = {
  width?: number;
  height?: number;
  color?: string;
};

function Sparkle({
  width = 34,
  height = 50,
  color = '#FFE69C',
}: SparkleProps) {
  return (
    <View
      style={{ width, height }}
      pointerEvents="none"
      collapsable={false}
    >
      <Svg
        width={width}
        height={height}
        viewBox="0 0 34 50"
        fill="none"
        pointerEvents="none"
      >
        <Path
          d="M16.0378 11.1039C15.6054 17.6905 12.0559 22.9023 7.57172 23.5362L0 24.6058L7.57172 25.6753C12.0566 26.3092 15.6062 31.521 16.0378 38.1076L16.7661 49.2119L17.4944 38.1076C17.9268 31.521 21.4764 26.3092 25.9605 25.6753L33.5322 24.6058L25.9605 23.5362C21.4756 22.9023 17.926 17.6905 17.4944 11.1039L16.7661 -0.000339508L16.0378 11.1039Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

export default React.memo(Sparkle);
