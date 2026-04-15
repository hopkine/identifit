import type { ImageSourcePropType } from 'react-native';
import type { User } from '@/types/ootd';

/** Remote URL, local require(), or null when the UI should show a default placeholder. */
export function resolveUserAvatarSource(user: User): ImageSourcePropType | null {
  const { avatar } = user;
  if (avatar == null || avatar === '') return null;
  if (typeof avatar === 'string') return { uri: avatar };
  return avatar as ImageSourcePropType;
}
