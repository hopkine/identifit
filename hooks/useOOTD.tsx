import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { OOTD } from '@/types/ootd';
import { mockUserOOTDs, mockFriendsOOTDs, currentUser } from '@/data/ootd';

type OOTDContextValue = {
  userOOTDs: OOTD[];
  friendsOOTDs: OOTD[];
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
  getTopStyles: (limit?: number) => string[];
};

const OOTDContext = createContext<OOTDContextValue | null>(null);

export function OOTDProvider({ children }: { children: React.ReactNode }) {
  const [userOOTDs, setUserOOTDs] = useState<OOTD[]>(mockUserOOTDs);
  const [friendsOOTDs, setFriendsOOTDs] = useState<OOTD[]>(mockFriendsOOTDs);

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
      const dateString = options.date || today.toISOString().split('T')[0];

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

      if (!newOOTD.isPrivate) {
        setFriendsOOTDs((prev) => [newOOTD, ...prev]);
      }

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
      saveOOTD,
      toggleOOTDLike,
      deleteOOTD,
      getOOTDForDate,
      getRecentOOTDs,
      getAllFriendsOOTDs,
      getTopStyles,
    }),
    [
      userOOTDs,
      friendsOOTDs,
      saveOOTD,
      toggleOOTDLike,
      deleteOOTD,
      getOOTDForDate,
      getRecentOOTDs,
      getAllFriendsOOTDs,
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
