import type { ImageSourcePropType } from 'react-native';

/** Clothing cutouts from the April stats / outfit wrap — shared across stats UI and recreate. */
export const STATS_CLOSET_ASSETS = {
  shirt: require('@/assets/images/april-wrap/shirt.png'),
  whiteSkirt: require('@/assets/images/april-wrap/white-skirt.png'),
  checkeredSkirt: require('@/assets/images/april-wrap/checkered-skirt.png'),
  slippers: require('@/assets/images/april-wrap/slippers.png'),
  lookFullbody: require('@/assets/images/april-wrap/look-fullbody.png'),
  mirrorSelfie: require('@/assets/images/april-wrap/mirror-selfie.png'),
  mostWornA: require('@/assets/images/april-wrap/most-worn-a.png'),
  mostWornB: require('@/assets/images/april-wrap/most-worn-b.png'),
  checkeredItemContextA: require('@/assets/images/april-wrap/checkered-item-context-a.png'),
  checkeredItemContextB: require('@/assets/images/april-wrap/checkered-item-context-b.png'),
  topLikedOutfit: require('@/assets/images/april-wrap/top-liked-outfit.png'),
} as const;

export type ClosetCategory = 'Tops' | 'Bottoms' | 'Shoes' | 'Accessories';

export type StatsClosetItem = {
  id: string;
  category: ClosetCategory;
  image: ImageSourcePropType;
  label?: string;
};

/** Placeholder closet inventory for recreate — matches stats wrap garments. */
export const STATS_CLOSET_PLACEHOLDERS: StatsClosetItem[] = [
  {
    id: 'stats-shirt',
    category: 'Tops',
    image: STATS_CLOSET_ASSETS.shirt,
    label: 'Shirt',
  },
  {
    id: 'stats-look-fullbody',
    category: 'Tops',
    image: STATS_CLOSET_ASSETS.lookFullbody,
    label: 'Full look',
  },
  {
    id: 'stats-top-liked',
    category: 'Tops',
    image: STATS_CLOSET_ASSETS.topLikedOutfit,
    label: 'Top liked outfit',
  },
  {
    id: 'stats-white-skirt',
    category: 'Bottoms',
    image: STATS_CLOSET_ASSETS.whiteSkirt,
    label: 'White skirt',
  },
  {
    id: 'stats-checkered-skirt',
    category: 'Bottoms',
    image: STATS_CLOSET_ASSETS.checkeredSkirt,
    label: 'Checkered skirt',
  },
  {
    id: 'stats-checkered-context-a',
    category: 'Bottoms',
    image: STATS_CLOSET_ASSETS.checkeredItemContextA,
    label: 'Checkered skirt',
  },
  {
    id: 'stats-slippers',
    category: 'Shoes',
    image: STATS_CLOSET_ASSETS.slippers,
    label: 'Slippers',
  },
  {
    id: 'stats-mirror-selfie',
    category: 'Accessories',
    image: STATS_CLOSET_ASSETS.mirrorSelfie,
    label: 'Mirror selfie',
  },
  {
    id: 'stats-checkered-context-b',
    category: 'Accessories',
    image: STATS_CLOSET_ASSETS.checkeredItemContextB,
    label: 'Outfit context',
  },
  {
    id: 'stats-most-worn-a',
    category: 'Accessories',
    image: STATS_CLOSET_ASSETS.mostWornA,
    label: 'Most worn',
  },
  {
    id: 'stats-most-worn-b',
    category: 'Accessories',
    image: STATS_CLOSET_ASSETS.mostWornB,
    label: 'Most worn',
  },
];
