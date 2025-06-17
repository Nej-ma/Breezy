export type Role = "user" | "admin" | "moderator";

export type User = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  coverPicture: string;
  isVerified: boolean;
  isActive: boolean;
  role: Role;
  isSuspended: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
};
