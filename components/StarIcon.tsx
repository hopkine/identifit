import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type StarIconProps = {
  width?: number;
  height?: number;
};

/**
 * Star from assets/images/Star.svg (vector).
 */
export default function StarIcon({
  width = 46,
  height = 50,
}: StarIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 46 50" fill="none">
      <Defs>
        <LinearGradient
          id="starIconGradient"
          x1="-0.000244141"
          y1="25.3057"
          x2="45.6644"
          y2="25.3057"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#C0D6FF" />
          <Stop offset="1" stopColor="#EEFFB2" />
        </LinearGradient>
      </Defs>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.3854 0C27.8896 1.8794e-05 29.3548 0.476537 30.57 1.36035C31.7852 2.24424 32.6879 3.48988 33.1471 4.91797L36.067 13.9902H45.6637V29.8447L42.0367 32.4863L45.0114 41.6709C45.1179 41.9998 45.1976 42.335 45.2545 42.6729C44.0338 46.8173 40.2035 49.8438 35.6637 49.8438H34.485C34.3358 49.7506 34.189 49.6524 34.0465 49.5479L26.3854 43.9346L18.7262 49.5547C18.5907 49.6566 18.4511 49.7524 18.3092 49.8438H10.7262C10.6037 49.7649 10.4827 49.6834 10.3649 49.5967C9.13169 48.7321 8.2113 47.4926 7.74183 46.0645C7.27247 44.6364 7.2787 43.0952 7.7594 41.6709L10.734 32.4863L2.901 26.7832H2.90979C1.70164 25.9026 0.803248 24.664 0.343388 23.2441C-0.116455 21.8241 -0.114407 20.2948 0.349247 18.876C0.812932 17.4573 1.71486 16.2211 2.92542 15.3438C4.13603 14.4663 5.59373 13.9924 7.09046 13.9902H16.7037L19.6237 4.91797C20.0828 3.49003 20.9848 2.24422 22.1998 1.36035C23.4151 0.476463 24.8811 0 26.3854 0Z"
        fill="url(#starIconGradient)"
        fillOpacity={0.4}
      />
    </Svg>
  );
}
