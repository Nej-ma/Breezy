import apiClient from "@/utils/api";

import type { UserProfile } from "@/utils/types/userType";

export interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

const searchUser = async (query: string): Promise<UserProfile[]> => {
  try {
    const response = await apiClient.get(
      `users/search?q=${encodeURIComponent(query)}`
    );

    if (response.status !== 200) {
      throw new Error(`Failed to search users: ${response.statusText}`);
    }

    return response.data.users || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export type UserUpdate = {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPicture?: string;
  location?: string;
  website?: string;
};

const getUserProfile = async (username: string): Promise<UserProfile> => {
  try {
    const response = await apiClient.get(`users/username/${username}`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.data as UserProfile;
  } catch (error) { 
    console.error("getUserProfile error:", error);
    throw error;
  }
};

const getUserProfileById = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await apiClient.get(`users/id/${userId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }
    return response.data as UserProfile;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get("users/profile");

    if (response.status !== 200) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }
    return response.data as UserProfile;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateUser = async (userData: UserUpdate): Promise<UserProfile> => {
  try {
    const response = await apiClient.put(`users/profile`, userData);

    if (response.status !== 200) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }
    return response.data.user as UserProfile;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const followUser = async (userId: string): Promise<void> => {
  try {
    const response = await apiClient.post(`users/${userId}/follow`);
    if (response.status !== 200) {
      throw new Error(`Failed to follow user: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Follow API error:", error);
    throw error;
  }
};

const unfollowUser = async (userId: string): Promise<void> => {
  try {
    const response = await apiClient.delete(`users/${userId}/unfollow`);
    if (response.status !== 200) {
      throw new Error(`Failed to unfollow user: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Unfollow API error:", error);
    throw error;
  }
};

const isFollowing = async (userId: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`users/${userId}/is-following`);
    if (response.status !== 200) {
      throw new Error(`Failed to check following status: ${response.statusText}`);
    }
    return response.data.isFollowing;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getFollowers = async (
  userId: string, 
  page: number = 1, 
  limit: number = 5
): Promise<PaginatedResponse<UserProfile>> => {
  try {
    const response = await apiClient.get(`users/${userId}/followers?page=${page}&limit=${limit}`);
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch followers: ${response.statusText}`);
    }
    return response.data;
  } catch (error) {
    console.error("getFollowers error:", error);
    throw error;
  }
};

const getFollowing = async (
  userId: string, 
  page: number = 1, 
  limit: number = 5
): Promise<PaginatedResponse<UserProfile>> => {
  try {
    const response = await apiClient.get(`users/${userId}/following?page=${page}&limit=${limit}`);
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch following: ${response.statusText}`);
    }
    return response.data;
  } catch (error) {
    console.error("getFollowing error:", error);
    throw error;
  }
};

const syncCounts = async (): Promise<{ message: string; syncedUsers: number }> => {
  try {
    const response = await apiClient.post(`users/sync-counts`);
    if (response.status !== 200) {
      throw new Error(`Failed to sync counts: ${response.statusText}`);
    }
    return response.data;
  } catch (error) {
    console.error("Sync counts error:", error);
    throw error;
  }
};

export const userService = {
  searchUser,
  getUserProfileById,
  getUserProfile,
  getCurrentUser,
  updateUser,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  syncCounts
};