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
  createdAt: string;
};

export type UserProfile = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  coverPicture: string;
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
}
