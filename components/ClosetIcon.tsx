import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type ClosetIconProps = {
  width?: number;
  height?: number;
};

/**
 * Closet from assets/images/closet.svg (vector) — pairs with streak/star stat decorations.
 */
export default function ClosetIcon({
  width = 52,
  height = 62,
}: ClosetIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 52 62" fill="none">
      <Defs>
        <LinearGradient
          id="closetIconGrad0"
          x1="0"
          y1="14.2083"
          x2="51.6667"
          y2="14.2083"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#C0D6FF" />
          <Stop offset="1" stopColor="#A5C5FF" />
        </LinearGradient>
        <LinearGradient
          id="closetIconGrad1"
          x1="0"
          y1="47.7923"
          x2="51.6667"
          y2="47.7923"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#C0D6FF" />
          <Stop offset="1" stopColor="#A5C5FF" />
        </LinearGradient>
      </Defs>
      <Path
        d="M38.75 0H12.9167C9.49095 0 6.20555 1.36086 3.7832 3.78321C1.36086 6.20555 0 9.49096 0 12.9167V28.4167H51.6667V12.9167C51.6667 9.49096 50.3058 6.20555 47.8835 3.78321C45.4611 1.36086 42.1757 0 38.75 0V0ZM28.4167 18.0833H23.25C22.5649 18.0833 21.9078 17.8112 21.4233 17.3267C20.9388 16.8422 20.6667 16.1852 20.6667 15.5C20.6667 14.8149 20.9388 14.1578 21.4233 13.6733C21.9078 13.1888 22.5649 12.9167 23.25 12.9167H28.4167C29.1018 12.9167 29.7589 13.1888 30.2434 13.6733C30.7278 14.1578 31 14.8149 31 15.5C31 16.1852 30.7278 16.8422 30.2434 17.3267C29.7589 17.8112 29.1018 18.0833 28.4167 18.0833Z"
        fill="url(#closetIconGrad0)"
        fillOpacity={0.4}
      />
      <Path
        d="M0 49.084C0 50.7802 0.3341 52.4599 0.983223 54.027C1.63235 55.5941 2.58378 57.0181 3.7832 58.2175C6.20555 60.6398 9.49095 62.0007 12.9167 62.0007H38.75C40.4462 62.0007 42.1259 61.6666 43.693 61.0175C45.2601 60.3683 46.684 59.4169 47.8835 58.2175C49.0829 57.0181 50.0343 55.5941 50.6834 54.027C51.3326 52.4599 51.6667 50.7802 51.6667 49.084V33.584H0V49.084ZM23.25 43.9173H28.4167C29.1018 43.9173 29.7589 44.1895 30.2434 44.674C30.7278 45.1584 31 45.8155 31 46.5007C31 47.1858 30.7278 47.8429 30.2434 48.3274C29.7589 48.8118 29.1018 49.084 28.4167 49.084H23.25C22.5649 49.084 21.9078 48.8118 21.4233 48.3274C20.9388 47.8429 20.6667 47.1858 20.6667 46.5007C20.6667 45.8155 20.9388 45.1584 21.4233 44.674C21.9078 44.1895 22.5649 43.9173 23.25 43.9173Z"
        fill="url(#closetIconGrad1)"
        fillOpacity={0.4}
      />
    </Svg>
  );
}
