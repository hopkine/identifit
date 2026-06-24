import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { appStorage } from '@/lib/appStorage';
import { OOTD, User } from '@/types/ootd';
import { currentUser } from '@/data/ootd';
import { formatLocalDateKey } from '@/utils/localDateKey';
import { getUser, updateUserProfile } from '@/lib/username';
import {
  CLOUD_USER_ID_STORAGE_KEY,
  removeAvatarObjectsFromStorage,
  uploadAvatarToStorage,
} from '@/lib/userCloudSync';
import { supabase } from '@/lib/supabase';

const PROFILE_AVATAR_STORAGE_KEY = '@identifit/profile_avatar_uri';
const PROFILE_DISPLAY_NAME_STORAGE_KEY = '@identifit/profile_display_name';

type RemoteUserProfile = {
  username: string;
  name: string | null;
  avatar_url: string | null;
};

type OOTDContextValue = {
  userOOTDs: OOTD[];
  friendsOOTDs: OOTD[];
  /** Current user with persisted profile photo URI applied */
  currentUserForDisplay: User;
  setProfileAvatar: (uri: string | null) => Promise<void>;
  /** Persist display name locally and sync to Supabase when cloud user exists. */
  setProfileDisplayName: (name: string) => Promise<void>;
  /** Reload cloud user id + profile from Supabase (e.g. after onboarding saves username). */
  refreshCloudProfile: () => Promise<void>;
  saveOOTD: (
    imageUri: string,
    options?: {
      occasion?: string;
      weather?: string;
      tags?: string[];
      isPrivate?: boolean;
      date?: string;
    }
  ) => OOTD;
  toggleOOTDLike: (ootdId: string) => void;
  deleteOOTD: (ootdId: string) => void;
  getOOTDForDate: (date: string) => OOTD | undefined;
  getRecentOOTDs: (limit?: number) => OOTD[];
  getAllFriendsOOTDs: () => OOTD[];
  /** Any saved or friends-feed OOTD by id (for deep links / detail screens). */
  getOOTDById: (ootdId: string) => OOTD | undefined;
  getTopStyles: (limit?: number) => string[];
};

const OOTDContext = createContext<OOTDContextValue | null>(null);

export function OOTDProvider({ children }: { children: React.ReactNode }) {
  const [userOOTDs, setUserOOTDs] = useState<OOTD[]>([]);
  const [friendsOOTDs, setFriendsOOTDs] = useState<OOTD[]>([]);
  const [profileAvatarUri, setProfileAvatarUri] = useState<string | null>(null);
  const [cloudUserId, setCloudUserId] = useState<string | null>(null);
  const [remoteProfile, setRemoteProfile] = useState<RemoteUserProfile | null>(
    null
  );
  const [localDisplayName, setLocalDisplayName] = useState<string | null>(null);

  const refreshCloudProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      let cloudId = await appStorage.getItem(CLOUD_USER_ID_STORAGE_KEY);
      if (session?.user?.id) {
        cloudId = session.user.id;
        await appStorage.setItem(CLOUD_USER_ID_STORAGE_KEY, session.user.id);
        setCloudUserId(session.user.id);
      } else {
        setCloudUserId(cloudId);
      }

      const storedName = await appStorage.getItem(
        PROFILE_DISPLAY_NAME_STORAGE_KEY
      );
      if (storedName != null && storedName !== '') {
        setLocalDisplayName(storedName);
      }
      const storedAvatar = await appStorage.getItem(
        PROFILE_AVATAR_STORAGE_KEY
      );
      if (storedAvatar) {
        setProfileAvatarUri(storedAvatar);
      }
      if (!cloudId) {
        setRemoteProfile(null);
        return;
      }
      const { user } = await getUser(cloudId);
      if (!user) {
        setRemoteProfile(null);
        return;
      }
      setRemoteProfile({
        username: user.username,
        name: user.name ?? null,
        avatar_url: user.avatar_url ?? null,
      });
      if (user.name != null && String(user.name).trim() !== '') {
        const n = String(user.name).trim();
        setLocalDisplayName(n);
        await appStorage.setItem(PROFILE_DISPLAY_NAME_STORAGE_KEY, n);
      }
      if (user.avatar_url && !storedAvatar) {
        setProfileAvatarUri(user.avatar_url);
        await appStorage.setItem(PROFILE_AVATAR_STORAGE_KEY, user.avatar_url);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshCloudProfile();
  }, [refreshCloudProfile]);

  const setProfileAvatar = useCallback(
    async (uri: string | null) => {
      const next = uri != null && uri !== '' ? uri : null;
      setProfileAvatarUri(next);

      try {
        if (next == null) {
          await appStorage.removeItem(PROFILE_AVATAR_STORAGE_KEY);
          const id =
            cloudUserId ??
            (await appStorage.getItem(CLOUD_USER_ID_STORAGE_KEY));
          if (id) {
            await removeAvatarObjectsFromStorage(id);
            await updateUserProfile(id, { avatar_url: null });
          }
          setRemoteProfile((prev) =>
            prev ? { ...prev, avatar_url: null } : prev
          );
          return;
        }

        await appStorage.setItem(PROFILE_AVATAR_STORAGE_KEY, next);

        const id =
          cloudUserId ??
          (await appStorage.getItem(CLOUD_USER_ID_STORAGE_KEY));
        if (!id) {
          return;
        }

        const { publicUrl } = await uploadAvatarToStorage(id, next);
        if (!publicUrl) {
          return;
        }

        const { success } = await updateUserProfile(id, {
          avatar_url: publicUrl,
        });
        if (!success) {
          return;
        }

        setProfileAvatarUri(publicUrl);
        await appStorage.setItem(PROFILE_AVATAR_STORAGE_KEY, publicUrl);
        setRemoteProfile((prev) =>
          prev
            ? { ...prev, avatar_url: publicUrl }
            : {
                username: currentUser.username,
                name: currentUser.name,
                avatar_url: publicUrl,
              }
        );
      } catch {
        /* ignore */
      }
    },
    [cloudUserId]
  );

  const setProfileDisplayName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setLocalDisplayName(trimmed);
    try {
      await appStorage.setItem(PROFILE_DISPLAY_NAME_STORAGE_KEY, trimmed);
      const id =
        cloudUserId ??
        (await appStorage.getItem(CLOUD_USER_ID_STORAGE_KEY));
      if (id) {
        const { success } = await updateUserProfile(id, { name: trimmed });
        if (success) {
          setRemoteProfile((prev) =>
            prev
              ? { ...prev, name: trimmed }
              : {
                  username: currentUser.username,
                  name: trimmed,
                  avatar_url: null,
                }
          );
        }
      }
    } catch {
      /* ignore */
    }
  }, [cloudUserId]);

  const currentUserForDisplay = useMemo((): User => {
    const remoteName = remoteProfile?.name;
    const hasRemoteName =
      remoteName != null && String(remoteName).trim() !== '';
    const resolvedName = hasRemoteName
      ? String(remoteName).trim()
      : localDisplayName != null && localDisplayName.trim() !== ''
        ? localDisplayName.trim()
        : currentUser.name;
    return {
      ...currentUser,
      name: resolvedName,
      username: remoteProfile?.username ?? currentUser.username,
      avatar:
        profileAvatarUri ??
        remoteProfile?.avatar_url ??
        currentUser.avatar,
    };
  }, [profileAvatarUri, remoteProfile, localDisplayName]);

  const saveOOTD = useCallback(
    (
      imageUri: string,
      options: {
        occasion?: string;
        weather?: string;
        tags?: string[];
        isPrivate?: boolean;
        date?: string;
      } = {}
    ): OOTD => {
      const today = new Date();
      const dateString = options.date ?? formatLocalDateKey(today);

      const newOOTD: OOTD = {
        id: `ootd-${Date.now()}`,
        userId: currentUser.id,
        imageUri,
        cutoutImageUri: imageUri,
        date: dateString,
        createdAt: today.toISOString(),
        occasion: options.occasion,
        weather: options.weather,
        tags: options.tags,
        isPrivate: options.isPrivate || false,
        likes: 0,
        isLiked: false,
      };

      setUserOOTDs((prev) => [newOOTD, ...prev]);
      // Public posts appear in feeds via getAllFriendsOOTDs (userOOTDs), not friendsOOTDs.

      return newOOTD;
    },
    []
  );

  const toggleOOTDLike = useCallback((ootdId: string) => {
    setUserOOTDs((prev) =>
      prev.map((ootd) =>
        ootd.id === ootdId
          ? {
              ...ootd,
              isLiked: !ootd.isLiked,
              likes: ootd.isLiked ? ootd.likes - 1 : ootd.likes + 1,
            }
          : ootd
      )
    );

    setFriendsOOTDs((prev) =>
      prev.map((ootd) =>
        ootd.id === ootdId
          ? {
              ...ootd,
              isLiked: !ootd.isLiked,
              likes: ootd.isLiked ? ootd.likes - 1 : ootd.likes + 1,
            }
          : ootd
      )
    );
  }, []);

  const deleteOOTD = useCallback((ootdId: string) => {
    setUserOOTDs((prev) => prev.filter((ootd) => ootd.id !== ootdId));
    setFriendsOOTDs((prev) => prev.filter((ootd) => ootd.id !== ootdId));
  }, []);

  const getOOTDForDate = useCallback(
    (date: string): OOTD | undefined => {
      return userOOTDs.find((ootd) => ootd.date === date);
    },
    [userOOTDs]
  );

  const getRecentOOTDs = useCallback(
    (limit: number = 5): OOTD[] => {
      return userOOTDs
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);
    },
    [userOOTDs]
  );

  const getAllFriendsOOTDs = useCallback((): OOTD[] => {
    return [...friendsOOTDs, ...userOOTDs.filter((ootd) => !ootd.isPrivate)]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [friendsOOTDs, userOOTDs]);

  const getOOTDById = useCallback(
    (ootdId: string): OOTD | undefined => {
      const fromUser = userOOTDs.find((o) => o.id === ootdId);
      if (fromUser) return fromUser;
      return friendsOOTDs.find((o) => o.id === ootdId);
    },
    [userOOTDs, friendsOOTDs]
  );

  const getTopStyles = useCallback(
    (limit: number = 3): string[] => {
      const tagCounts: Record<string, number> = {};

      userOOTDs.forEach((ootd) => {
        if (ootd.tags) {
          ootd.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag]) => tag);
    },
    [userOOTDs]
  );

  const value = useMemo(
    () => ({
      userOOTDs,
      friendsOOTDs,
      currentUserForDisplay,
      setProfileAvatar,
      setProfileDisplayName,
      refreshCloudProfile,
      saveOOTD,
      toggleOOTDLike,
      deleteOOTD,
      getOOTDForDate,
      getRecentOOTDs,
      getAllFriendsOOTDs,
      getOOTDById,
      getTopStyles,
    }),
    [
      userOOTDs,
      friendsOOTDs,
      currentUserForDisplay,
      setProfileAvatar,
      setProfileDisplayName,
      refreshCloudProfile,
      saveOOTD,
      toggleOOTDLike,
      deleteOOTD,
      getOOTDForDate,
      getRecentOOTDs,
      getAllFriendsOOTDs,
      getOOTDById,
      getTopStyles,
    ]
  );

  return (
    <OOTDContext.Provider value={value}>{children}</OOTDContext.Provider>
  );
}

export function useOOTD(): OOTDContextValue {
  const ctx = useContext(OOTDContext);
  if (!ctx) {
    throw new Error('useOOTD must be used within an OOTDProvider');
  }
  return ctx;
}
