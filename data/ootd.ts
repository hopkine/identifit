import { User } from '@/types/ootd';

/** Stable id for the local “you” account before cloud profile is linked. */
export const BETA_USER_ID = 'beta';

export const currentUser: User = {
  id: BETA_USER_ID,
  name: 'Beta',
  username: 'beta',
  isOnline: true,
};
