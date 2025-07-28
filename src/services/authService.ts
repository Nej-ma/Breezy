// ===== src/services/authService.ts =====
import apiClient from "@/utils/api";
import type { User } from "@/utils/types/userType";

export type Register = {
  displayName: string;
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  user: User;
};

const createUser = async (userData: Register): Promise<boolean> => {
  try {
    const response = await apiClient.post("auth/register", userData);
   
    return response.status === 201;
  } catch (error) {
    console.error("Registration failed:", error);
    return false;
  }
};

const validateEmail = async (token: string): Promise<boolean> => {
  try {
    const response = await apiClient.post(`auth/activate/${token}`);
   
    return response.status === 200;
  } catch (error) {
    console.error("Email validation failed:", error);
    return false;
  }
};

const requestNewPassword = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.post("auth/forgot-password", { email });
   
    return response.status === 200;
  } catch (error) {
    console.error("Password reset request failed:", error);
    return false;
  }
};

const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  try {
    const response = await apiClient.post("auth/reset-password", {
      newPassword,
      token,
    });
   
    return response.status === 200;
  } catch (error) {
    console.error("Password reset failed:", error);
    return false;
  }
};

export const authService = {
  createUser,
  validateEmail,
  requestNewPassword,
  resetPassword,
};
