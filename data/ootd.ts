import { OOTD, User } from '@/types/ootd';

/** Stable id for the local / mock “you” account (Beta). */
export const BETA_USER_ID = 'beta';

// Current user data
export const currentUser: User = {
  id: BETA_USER_ID,
  name: 'Beta',
  username: 'beta',
  isOnline: true,
};

// Mock user's personal OOTDs
export const mockUserOOTDs: OOTD[] = [
  {
  id: 'ootd-1',
  userId: BETA_USER_ID,
  imageUri: require('@/assets/images/pics/Rectangle 1.png'),
  cutoutImageUri: require('@/assets/images/pics/Rectangle 1.png'),
  date: '2026-04-01',
  createdAt: '2026-04-01T08:30:00Z',
  tags: ['experimental', 'simple', 'casual'],
  isPrivate: false,
  likes: 12,
  isLiked: false,
},

  {
    id: 'ootd-2',
    userId: BETA_USER_ID,
    imageUri: require('@/assets/images/pics/Rectangle 2.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 2.png'),
    date: '2026-04-02',
    createdAt: '2026-04-02T14:20:00Z',
    tags: ['minimal', 'simple', 'elegant'],
    isPrivate: false,
    likes: 8,
    isLiked: true,
  },
  {
    id: 'ootd-3',
    userId: BETA_USER_ID,
    imageUri: require('@/assets/images/pics/Rectangle 3.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 3.png'),
    date: '2026-04-10',
    createdAt: '2026-04-10T10:15:00Z',
    tags: ['experimental', 'minimal', 'chic'],
    isPrivate: true,
    likes: 15,
    isLiked: false,
  },
  {
    id: 'ootd-4',
    userId: BETA_USER_ID,
    imageUri: require('@/assets/images/pics/Rectangle 4.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 4.png'),
    date: '2026-04-14',
    createdAt: '2026-04-14T10:15:00Z',
    tags: ['experimental', 'minimal', 'chic'],
    isPrivate: true,
    likes: 15,
    isLiked: false,
  },
];

// Friends' OOTDs (converted from existing data)
export const mockFriendsOOTDs: OOTD[] = [
  {
    id: 'friend-ootd-1',
    userId: '1',
    imageUri: require('@/assets/images/pics/Rectangle 1.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 1.png'),
    date: '2026-04-05',
    createdAt: '2026-04-05T16:45:00Z',
    isPrivate: false,
    likes: 23,
    isLiked: true,
  },
  {
    id: 'friend-ootd-2',
    userId: '2',
    imageUri: require('@/assets/images/pics/Rectangle 2.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 2.png'),
    date: '2026-04-06',
    createdAt: '2026-04-06T12:00:00Z',
    isPrivate: false,
    likes: 19,
    isLiked: false,
  },
  {
    id: 'friend-ootd-3',
    userId: '3',
    imageUri: require('@/assets/images/pics/Rectangle 3.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 3.png'),
    date: '2026-04-07',
    createdAt: '2026-04-07T09:30:00Z',
    isPrivate: false,
    likes: 7,
    isLiked: false,
  },
];