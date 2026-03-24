import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Conform to first page (onboarding) dimensions for consistent web layout */
export const LAYOUT = {
  /** Max content width - phone-like viewport on web */
  contentMaxWidth: 393,
  /** Horizontal padding for content */
  paddingHorizontal: 24,
  /** Standard background color */
  backgroundColor: '#1a1a1a',
} as const;

/** Width for constrained content - use in styles */
export const constrainedWidth = Math.min(LAYOUT.contentMaxWidth, SCREEN_WIDTH);

/** Full dimensions for inner container */
export const getInnerContainerDimensions = () => ({
  width: Math.min(LAYOUT.contentMaxWidth, Dimensions.get('window').width),
  height: Dimensions.get('window').height,
});

export { SCREEN_WIDTH, SCREEN_HEIGHT };
