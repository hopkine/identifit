export interface OOTD {
  id: string;
  userId: string;
  imageUri: string | any;
  cutoutImageUri?: string | any;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO datetime string
  occasion?: string;
  weather?: string;
  tags?: string[];
  isPrivate: boolean;
  likes: number;
  isLiked?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  /** Remote URL, `require(...)`, or omit for default placeholder */
  avatar?: string | any;
  isOnline?: boolean;
}