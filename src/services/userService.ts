import apiClient from "@/utils/api";

import type { UserProfile } from "@/utils/types/userType";

const searchUser = async (query: string): Promise<UserProfile[]> => {
  const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to search users: ${response.status}`);
  }
  
  const data = await response.json();
  return data.users || [];
};

const getUserProfile = async (username: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/users/${username}`);
  return response.data;
};

export const userService = {
  searchUser,
  getUserProfile,
};
