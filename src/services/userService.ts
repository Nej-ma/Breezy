import apiClient from "@/utils/api";

import type { UserProfile } from "@/utils/types/userType";

const searchUser = async (query: string): Promise<UserProfile[]> => {
  const response = await apiClient.get(`/users/search`, {
    params: { q: query },
  });
  return response.data.users || [];
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
    return response.data.user as UserProfile;
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
    return response.data.user as UserProfile;
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

export const userService = {
  searchUser,
  getUserProfile,
  getCurrentUser,
  updateUser
};
