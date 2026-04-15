import { OOTD, User } from '@/types/ootd';

// Current user data
export const currentUser: User = {
  id: 'current-user',
  name: 'Jacqueline Flynn',
  username: 'jacqfly',
  isOnline: true,
};

// Mock user's personal OOTDs
export const mockUserOOTDs: OOTD[] = [
  {
  id: 'ootd-1',
  userId: 'current-user',
  imageUri: require('@/assets/images/pics/Rectangle 1.png'),
  cutoutImageUri: require('@/assets/images/pics/Rectangle 1.png'),
  date: '2025-01-10',
  createdAt: '2025-01-10T08:30:00Z',
  tags: ['experimental', 'simple', 'casual'],
  isPrivate: false,
  likes: 12,
  isLiked: false,
},

  {
    id: 'ootd-2',
    userId: 'current-user',
    imageUri: require('@/assets/images/pics/Rectangle 2.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 2.png'),
    date: '2025-01-09',
    createdAt: '2025-01-09T14:20:00Z',
    tags: ['minimal', 'simple', 'elegant'],
    isPrivate: false,
    likes: 8,
    isLiked: true,
  },
  {
    id: 'ootd-3',
    userId: 'current-user',
    imageUri: require('@/assets/images/pics/Rectangle 3.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 3.png'),
    date: '2025-01-08',
    createdAt: '2025-01-08T10:15:00Z',
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
    date: '2025-01-10',
    createdAt: '2025-01-10T16:45:00Z',
    isPrivate: false,
    likes: 23,
    isLiked: true,
  },
  {
    id: 'friend-ootd-2',
    userId: '2',
    imageUri: require('@/assets/images/pics/Rectangle 2.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 2.png'),
    date: '2025-01-09',
    createdAt: '2025-01-09T12:00:00Z',
    isPrivate: false,
    likes: 19,
    isLiked: false,
  },
  {
    id: 'friend-ootd-3',
    userId: '3',
    imageUri: require('@/assets/images/pics/Rectangle 3.png'),
    cutoutImageUri: require('@/assets/images/pics/Rectangle 3.png'),
    date: '2025-01-07',
    createdAt: '2025-01-07T09:30:00Z',
    isPrivate: false,
    likes: 7,
    isLiked: false,
  },
];