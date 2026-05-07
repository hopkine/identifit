import type { ImageSourcePropType } from 'react-native';

export type MonthlyWrapListing = {
  id: string;
  yearGroup: string;
  monthAccent: string;
  titleAccent: string;
  thumbnail: ImageSourcePropType;
  /** Route into full-screen story carousel */
  hasStory: boolean;
  /** Custom story page */
  storyPath?: '/april-outfit-wrap';
};

/** Landing grid / carousel rows — expand as you add generated reports */
export const MONTHLY_WRAP_LISTINGS: MonthlyWrapListing[] = [
  {
    id: '2025-04',
    yearGroup: '2025',
    monthAccent: 'April',
    titleAccent: 'Outfit Wrap',
    thumbnail: require('@/assets/images/stats-report/april-wrap-thumb.png'),
    hasStory: true,
    storyPath: '/april-outfit-wrap',
  },
];
