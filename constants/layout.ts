import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Breakpoint for desktop vs mobile layout */
const DESKTOP_BREAKPOINT = 768;
/** Max content width on mobile (phone-like) */
const MOBILE_MAX_WIDTH = 393;
/** Max content width on desktop - use more screen space */
const DESKTOP_MAX_WIDTH = 560;

/** Conform to first page (onboarding) dimensions for consistent web layout */
export const LAYOUT = {
  /** Max content width - phone-like on mobile, larger on desktop */
  contentMaxWidth: SCREEN_WIDTH >= DESKTOP_BREAKPOINT ? DESKTOP_MAX_WIDTH : MOBILE_MAX_WIDTH,
  /** Mobile max width for reference */
  contentMaxWidthMobile: MOBILE_MAX_WIDTH,
  /** Desktop max width for reference */
  contentMaxWidthDesktop: DESKTOP_MAX_WIDTH,
  /** Horizontal padding for content */
  paddingHorizontal: 24,
  /** Standard background color */
  backgroundColor: '#1a1a1a',
} as const;

/** Width for constrained content - responsive: 560px on desktop, 393px on mobile */
export const constrainedWidth = Math.min(
  LAYOUT.contentMaxWidth,
  SCREEN_WIDTH
);

/** Full dimensions for inner container */
export const getInnerContainerDimensions = () => {
  const { width: w } = Dimensions.get('window');
  const maxW = w >= DESKTOP_BREAKPOINT ? DESKTOP_MAX_WIDTH : MOBILE_MAX_WIDTH;
  return {
    width: Math.min(maxW, w),
    height: Dimensions.get('window').height,
  };
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };
