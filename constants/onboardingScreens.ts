import { StyleSheet } from 'react-native';
import { LAYOUT } from '@/constants/layout';

/** Y-offset from top of content for the header row (matches feature-overview Skip). */
export const ONBOARDING_HEADER_TOP = 60;

/**
 * Padding under the absolute header bar so ScrollView content starts below back/skip.
 * headerTop (~60) + row (~44) + small gap.
 */
export const ONBOARDING_SCROLL_TOP_INSET = 100;

/** Scroll top pad + header margins for in-flow back/skip rows (keep aligned across onboarding). */
export const ONBOARDING_IN_FLOW_TOP = {
  scrollPaddingTop: 6,
  headerShiftMarginTop: 6,
  headerShiftMarginBottom: 10,
} as const;

/**
 * Shared layout for onboarding steps with back/skip + title + scroll + Continue.
 * Keeps title position and header rhythm identical across screens.
 */
export const onboardingScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LAYOUT.backgroundColor,
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  /**
   * Single top row: back (left) + Skip (right), or Skip-only with headerBarSkipOnly.
   * Same vertical line as feature-overview.
   */
  headerBar: {
    position: 'absolute',
    top: ONBOARDING_HEADER_TOP,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.paddingHorizontal,
    zIndex: 10,
  },
  /**
   * In-flow variant for steps where header should scroll away with content.
   * Use alongside a reduced ScrollView paddingTop.
   */
  headerBarInFlow: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 12,
    marginBottom: 20,
  },
  headerBarSkipOnly: {
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.paddingHorizontal,
  },
  scrollContent: {
    paddingTop: ONBOARDING_SCROLL_TOP_INSET,
    paddingBottom: 32,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Caladea-Regular',
    color: '#C0D1FF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    color: '#B5AFA9',
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: LAYOUT.paddingHorizontal,
    paddingTop: 8,
  },
});
