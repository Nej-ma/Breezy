import apiClient from "@/utils/api";

import type { UserProfile } from "@/utils/types/userType";

const getUserProfile = async (username: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/users/${username}`);
  return response.data;
};

export const userService = {
  getUserProfile,
};
