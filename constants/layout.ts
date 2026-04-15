import { Dimensions } from 'react-native';

/** Breakpoint for desktop vs mobile layout */
const DESKTOP_BREAKPOINT = 768;
/** Max content width on mobile (phone-like) */
const MOBILE_MAX_WIDTH = 393;
/** Max content width on desktop - use more screen space */
const DESKTOP_MAX_WIDTH = 560;

const { width: rawW, height: rawH } = Dimensions.get('window');
// Static export / first paint can report 0×0 on web; avoid collapsing layouts in the demo build.
const SCREEN_WIDTH = rawW > 0 ? rawW : MOBILE_MAX_WIDTH;
const SCREEN_HEIGHT = rawH > 0 ? rawH : 844;

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

/** Constrained column width for a given window width (use with useWindowDimensions). */
export function getConstrainedWidth(windowWidth: number): number {
  const safeW = windowWidth > 0 ? windowWidth : MOBILE_MAX_WIDTH;
  const maxContent =
    safeW >= DESKTOP_BREAKPOINT
      ? LAYOUT.contentMaxWidthDesktop
      : LAYOUT.contentMaxWidthMobile;
  return Math.min(maxContent, safeW);
}

/** Full dimensions for inner container */
export const getInnerContainerDimensions = () => {
  const { width: w, height: h } = Dimensions.get('window');
  const safeW = w > 0 ? w : MOBILE_MAX_WIDTH;
  const safeH = h > 0 ? h : 844;
  const maxW = safeW >= DESKTOP_BREAKPOINT ? DESKTOP_MAX_WIDTH : MOBILE_MAX_WIDTH;
  return {
    width: Math.min(maxW, safeW),
    height: safeH,
  };
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };
