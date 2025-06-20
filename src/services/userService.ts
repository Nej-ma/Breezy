import apiClient from "@/utils/api";

import type { UserProfile } from "@/utils/types/userType";

const searchUser = async (query: string): Promise<UserProfile[]> => {
  const response = await apiClient.get(`/users/search`, {
    params: { q: query },
  });
  return response.data.users || [];
};

const getUserProfile = async (username: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/users/${username}`);
  return response.data;
};

export const userService = {
  searchUser,
  getUserProfile,
};
