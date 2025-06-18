import apiClient from "@/utils/api";
import type { User } from "@/utils/types/userType";

// only used here
export type Login = {
  email: string;
  password: string;
};

export type Register = {
  displayName: string;
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

// Method POST
const createUser = async (userData: Register) => {
  console.log("Creating user with data:", userData, JSON.stringify(userData));
  try {
    const response = await apiClient.post("auth/register", userData);

    return response.status === 201; // Return true if user creation was successful
  } catch (error) {
    console.error("Error creating user:", error);
    return false; // Return false if there was an error
  }
};

const validateEmail = async (token: string) => {
  try {
    const response = await apiClient.post(`auth/activate/${token}`);
    return response.status === 200; // Return true if email validation was successful
  } catch (error) {
    console.error("Error validating email:", error);
    return false; // Return false if there was an error
  }
};

const login = async (userData: Login): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post("auth/login", userData);
    if (response.status === 200 && response.data) {
      // Store token in localStorage (the interceptor will use it for future requests)
      if (response.data.token) {
        localStorage.setItem("access_token", response.data.token);
      }

      // Optionally store user data in localStorage or state management
      localStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } else {
      throw new Error(response.data?.message || "auth.signin.errorText");
    }
  } catch (error: any) {
    console.error("Error during login:", error);
    throw error; // Re-throw to be caught by the component
  }
};

const requestNewPassword = async (email: string) => {
  try {
    const response = await apiClient.post("auth/forgot-password", { email });
    return response.status === 200; // Return true if request was successful
  } catch (error) {
    console.error("Error requesting new password:", error);
    return false; // Return false if there was an error
  }
};

const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await apiClient.post(`auth/reset-password`, {
      newPassword: newPassword,
      token: token,
    });
    return response.status === 200; // Return true if password reset was successful
  } catch (error) {
    console.error("Error resetting password:", error);
    return false; // Return false if there was an error
  }
};

export const authService = {
  createUser,
  validateEmail,
  login,
  requestNewPassword,
  resetPassword,
};
