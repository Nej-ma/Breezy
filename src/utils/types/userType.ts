export type Role = "user" | "admin" | "moderator";

export type User = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  role: Role;
  isSuspended: boolean;
  suspendedUntil?: string | null;
  createdAt: string;
};

export type UserProfile = {
  _id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  coverPicture: string;
  location: string;
  website: string;
  isVerified?: boolean;
  role?: Role;
  isSuspended?: boolean;
  suspendedUntil?: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
};

export type LocalUser = {
    id: string
    displayName: string;
    username: string;
    email: string;
    isVerified: boolean;
    role: Role;
    isSuspended?: boolean;
    suspendedUntil?: string | null;
}
