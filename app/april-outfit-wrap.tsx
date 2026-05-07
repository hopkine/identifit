import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import {
  useFonts,
  Caladea_400Regular,
  Caladea_700Bold,
} from '@expo-google-fonts/caladea';
import { LAYOUT, constrainedWidth } from '@/constants/layout';
import { ONBOARDING_HEADER_TOP } from '@/constants/onboardingScreens';

const GLACIER = '#7AA4BC';
/** Demo counts until backed by usage analytics */
const MOST_WORN_OUTFIT_TIMES = 5;
const CHECKERED_ITEM_RANK = 2;
const CHECKERED_ITEM_NAME = 'Checkered Skirt';
const CHECKERED_ITEM_OUTFIT_COUNT = 5;
const TOP_LIKED_LIKES_LABEL = '2K';
const TOP_LIKED_ARC_TEXT = 'you got good taste!';

const APRIL_ASSETS = {
  shirt: require('@/assets/images/april-wrap/shirt.png'),
  whiteSkirt: require('@/assets/images/april-wrap/white-skirt.png'),
  slippers: require('@/assets/images/april-wrap/slippers.png'),
  lookFullbody: require('@/assets/images/april-wrap/look-fullbody.png'),
  mirrorSelfie: require('@/assets/images/april-wrap/mirror-selfie.png'),
  checkeredSkirt: require('@/assets/images/april-wrap/checkered-skirt.png'),
  mostWornA: require('@/assets/images/april-wrap/most-worn-a.png'),
  mostWornB: require('@/assets/images/april-wrap/most-worn-b.png'),
  checkeredItemContextA: require('@/assets/images/april-wrap/checkered-item-context-a.png'),
  checkeredItemContextB: require('@/assets/images/april-wrap/checkered-item-context-b.png'),
  topLikedOutfit: require('@/assets/images/april-wrap/top-liked-outfit.png'),
};

function ArcText({
  text,
  radius,
  center,
  startAngleDeg,
  endAngleDeg,
}: {
  text: string;
  radius: number;
  center: { x: number; y: number };
  startAngleDeg: number;
  endAngleDeg: number;
}) {
  const chars = Array.from(text);
  const start = (startAngleDeg * Math.PI) / 180;
  const end = (endAngleDeg * Math.PI) / 180;
  const steps = Math.max(1, chars.length - 1);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {chars.map((ch, i) => {
        const t = steps === 0 ? 0 : i / steps;
        const a = start + (end - start) * t;
        const x = center.x + Math.cos(a) * radius;
        const y = center.y + Math.sin(a) * radius;
        const rot = (a * 180) / Math.PI + 90;
        return (
          <Text
            key={`${ch}-${i}`}
            style={[
              styles.arcChar,
              {
                left: x,
                top: y,
                transform: [{ translateX: -3 }, { translateY: -7 }, { rotate: `${rot}deg` }],
              },
            ]}
          >
            {ch}
          </Text>
        );
      })}
    </View>
  );
}

export default function AprilOutfitWrapScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowW } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    'Caladea-Regular': Caladea_400Regular,
    'Caladea-Bold': Caladea_700Bold,
  });

  const pad = LAYOUT.paddingHorizontal;
  const cw = Math.min(windowW - pad * 2, constrainedWidth - pad * 2);
  const canvasH = cw * 1.48;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <TouchableOpacity
        style={[styles.backBtn, { top: ONBOARDING_HEADER_TOP, left: pad }]}
        onPress={() => router.back()}
        hitSlop={16}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 32 + insets.bottom, paddingHorizontal: pad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.canvas, { width: cw, height: canvasH }]}>
          <Image
            source={APRIL_ASSETS.shirt}
            style={[
              styles.asset,
              {
                left: cw * 0.02,
                top: cw * 0.02,
                width: cw * 0.44,
                height: cw * 0.5,
                zIndex: 1,
              },
            ]}
            resizeMode="contain"
          />
          <Image
            source={APRIL_ASSETS.whiteSkirt}
            style={[
              styles.asset,
              {
                right: cw * 0.0,
                top: 0,
                width: cw * 0.46,
                height: cw * 0.52,
                zIndex: 2,
              },
            ]}
            resizeMode="contain"
          />

          <Image
            source={APRIL_ASSETS.lookFullbody}
            style={[
              styles.asset,
              {
                left: -cw * 0.06,
                top: cw * 0.22,
                width: cw * 0.62,
                height: cw * 0.95,
                zIndex: 3,
              },
            ]}
            resizeMode="contain"
          />

          <Image
            source={APRIL_ASSETS.checkeredSkirt}
            style={[
              styles.asset,
              {
                right: -cw * 0.02,
                top: cw * 0.36,
                width: cw * 0.5,
                height: cw * 0.55,
                zIndex: 4,
                transform: [{ rotate: '-14deg' }],
              },
            ]}
            resizeMode="contain"
          />

          <Image
            source={APRIL_ASSETS.slippers}
            style={[
              styles.asset,
              {
                right: cw * 0.06,
                top: cw * 0.78,
                width: cw * 0.4,
                height: cw * 0.28,
                zIndex: 5,
              },
            ]}
            resizeMode="contain"
          />

          <Image
            source={APRIL_ASSETS.mirrorSelfie}
            style={[
              styles.asset,
              {
                left: cw * 0.04,
                bottom: cw * 0.02,
                width: cw * 0.44,
                height: cw * 0.58,
                zIndex: 6,
              },
            ]}
            resizeMode="contain"
          />

          <View style={[styles.titleCluster, { right: 0, bottom: cw * 0.06 }]}>
            <Text style={styles.yearArc}>2026</Text>
            <Text style={styles.monthWord}>April</Text>
            <Text style={styles.outfitWord}>Outfit</Text>
            <Text style={styles.wrapWord}>Wrap</Text>
          </View>
        </View>

        {/* Most Worn Outfits — story-style collage */}
        <View style={[styles.mostWornSection, { width: cw }]}>
          <View style={styles.mostWornTitles}>
            <Text style={styles.mostWornLine1}>Most Worn</Text>
            <Text style={styles.mostWornLine2}>Outfits</Text>
          </View>

          <View style={[styles.mostWornCollage, { height: cw * 1.02 }]}>
            <Image
              source={APRIL_ASSETS.mostWornA}
              style={[
                styles.mostWornCutout,
                {
                  left: -cw * 0.02,
                  bottom: 0,
                  width: cw * 0.52,
                  height: cw * 0.88,
                  zIndex: 1,
                },
              ]}
              resizeMode="contain"
            />
            <Image
              source={APRIL_ASSETS.mostWornB}
              style={[
                styles.mostWornCutout,
                {
                  right: -cw * 0.04,
                  top: cw * 0.02,
                  width: cw * 0.54,
                  height: cw * 0.92,
                  zIndex: 2,
                  transform: [{ rotate: '7deg' }],
                },
              ]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.mostWornCaption}>
            <Text style={styles.mostWornCaptionText}>
              You wore this outfit{' '}
              <Text style={styles.mostWornCaptionEm}>
                {MOST_WORN_OUTFIT_TIMES} times
              </Text>{' '}
              this month!
            </Text>
          </View>
        </View>

        {/* Most Worn Item #2 — hero uses same checkered skirt asset as wrap collage */}
        <View style={[styles.mostItemSection, { width: cw }]}>
          <View style={styles.mostItemTitles}>
            <Text style={styles.mostItemLineMost}>Most</Text>
            <View style={styles.mostItemTitleRow}>
              <Text style={styles.mostItemLineWorn}>Worn </Text>
              <Text style={styles.mostItemLineItem}>Item</Text>
            </View>
          </View>

          <Image
            source={APRIL_ASSETS.checkeredSkirt}
            style={[
              styles.mostItemHero,
              {
                width: cw * 0.78,
                height: cw * 0.72,
              },
            ]}
            resizeMode="contain"
          />

          <View style={styles.mostItemRankRow}>
            <Text style={styles.mostItemRankNum}>{CHECKERED_ITEM_RANK}</Text>
            <Text style={styles.mostItemRankLabel}>{CHECKERED_ITEM_NAME}</Text>
          </View>

          <View style={styles.mostItemDivider} />

          <View style={styles.mostItemDetailRow}>
            <View style={styles.mostItemThumbCol}>
              <Image
                source={APRIL_ASSETS.checkeredItemContextA}
                style={[
                  styles.mostItemThumb,
                  { width: cw * 0.26, height: cw * 0.44 },
                ]}
                resizeMode="contain"
              />
              <Image
                source={APRIL_ASSETS.checkeredItemContextB}
                style={[
                  styles.mostItemThumb,
                  { width: cw * 0.26, height: cw * 0.44 },
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.mostItemStatText}>
              This item appeared in{' '}
              <Text style={styles.mostItemStatEm}>
                {CHECKERED_ITEM_OUTFIT_COUNT} outfits
              </Text>{' '}
              this month!
            </Text>
          </View>
        </View>

        {/* Top Liked Outfit */}
        <View style={[styles.topLikedSection, { width: cw }]}>
          <View style={styles.topLikedTitles}>
            <Text style={styles.topLikedLine1}>Top Liked</Text>
            <Text style={styles.topLikedLine2}>Outfit</Text>
          </View>

          <View style={[styles.topLikedBody, { height: cw * 1.08 }]}>
            <View style={styles.topLikedOutfitWrap}>
              <Image
                source={APRIL_ASSETS.topLikedOutfit}
                style={[styles.topLikedOutfit, { width: cw * 0.62, height: cw * 0.98 }]}
                resizeMode="contain"
              />
              <View style={[styles.arcOverlay, { width: cw * 0.62, height: cw * 0.98 }]}>
                <ArcText
                  text={TOP_LIKED_ARC_TEXT}
                  radius={cw * 0.18}
                  center={{ x: cw * 0.28, y: cw * 0.22 }}
                  startAngleDeg={210}
                  endAngleDeg={330}
                />
              </View>
            </View>

            <Image
              source={APRIL_ASSETS.slippers}
              style={[
                styles.topLikedShoes,
                {
                  width: cw * 0.32,
                  height: cw * 0.22,
                  right: -cw * 0.02,
                  bottom: cw * 0.06,
                },
              ]}
              resizeMode="contain"
            />

            <View style={styles.topLikedCaptionWrap}>
              <Text style={styles.topLikedCaptionText}>
                This outfit received{' '}
                <Text style={styles.topLikedCaptionEm}>{TOP_LIKED_LIKES_LABEL} likes</Text> this
                month.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerHint}>Go back to Stats Report.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 44,
  },
  backBtn: {
    position: 'absolute',
    zIndex: 20,
    padding: 8,
  },
  canvas: {
    position: 'relative',
    alignSelf: 'center',
  },
  asset: {
    position: 'absolute',
  },
  titleCluster: {
    position: 'absolute',
    zIndex: 50,
    elevation: 50,
    alignItems: 'flex-end',
    maxWidth: '46%',
  },
  yearArc: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 13,
    fontWeight: '500',
    color: GLACIER,
    letterSpacing: 3,
    marginBottom: 4,
    opacity: 0.95,
  },
  monthWord: {
    fontFamily: 'Caladea-Bold',
    fontSize: 34,
    color: GLACIER,
    letterSpacing: -1,
    lineHeight: 38,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  outfitWord: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 32,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  wrapWord: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  footerHint: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 19,
    maxWidth: 320,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  mostWornSection: {
    marginTop: 36,
    alignSelf: 'center',
  },
  mostWornTitles: {
    marginBottom: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },
  mostWornLine1: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  mostWornLine2: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: GLACIER,
    letterSpacing: -0.6,
    lineHeight: 32,
    marginTop: -2,
  },
  mostWornCollage: {
    width: '100%',
    position: 'relative',
    marginTop: 8,
    marginBottom: 4,
  },
  mostWornCutout: {
    position: 'absolute',
  },
  mostWornCaption: {
    alignSelf: 'flex-end',
    maxWidth: '92%',
    marginTop: 4,
  },
  mostWornCaptionText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 23,
    textAlign: 'right',
  },
  mostWornCaptionEm: {
    fontWeight: '700',
    color: GLACIER,
  },
  mostItemSection: {
    marginTop: 40,
    alignSelf: 'center',
  },
  mostItemTitles: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  mostItemLineMost: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  mostItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: -2,
  },
  mostItemLineWorn: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  mostItemLineItem: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: GLACIER,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  mostItemHero: {
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  mostItemRankRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 14,
    alignSelf: 'flex-start',
    paddingLeft: 2,
    marginBottom: 4,
  },
  mostItemRankNum: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 48,
  },
  mostItemRankLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
    paddingBottom: 4,
  },
  mostItemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.14)',
    width: '100%',
    marginTop: 22,
    marginBottom: 20,
  },
  mostItemDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    width: '100%',
  },
  mostItemThumbCol: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 0,
  },
  mostItemThumb: {
    backgroundColor: 'transparent',
  },
  mostItemStatText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 23,
    paddingTop: 4,
    minWidth: 0,
  },
  mostItemStatEm: {
    fontWeight: '700',
    color: GLACIER,
  },
  topLikedSection: {
    marginTop: 44,
    alignSelf: 'center',
  },
  topLikedTitles: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  topLikedLine1: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: GLACIER,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  topLikedLine2: {
    fontFamily: 'Caladea-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    lineHeight: 32,
    marginTop: -2,
  },
  topLikedBody: {
    width: '100%',
    position: 'relative',
  },
  topLikedOutfitWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  topLikedOutfit: {
    alignSelf: 'flex-start',
  },
  topLikedShoes: {
    position: 'absolute',
    zIndex: 4,
    transform: [{ rotate: '12deg' }],
  },
  arcOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  arcChar: {
    position: 'absolute',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.2,
  },
  topLikedCaptionWrap: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '44%',
    paddingTop: 22,
    paddingLeft: 10,
  },
  topLikedCaptionText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  topLikedCaptionEm: {
    fontWeight: '700',
    color: GLACIER,
  },
});
