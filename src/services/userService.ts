import apiClient from "@/utils/api";

type Role = "user" | "admin" | "moderator";

type User = {
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

type UserRequest = {
    displayName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Method POST
export const createUser = async (userData: UserRequest) => {
    console.log('Creating user with data:', userData, JSON.stringify(userData));
    try {
        const response = await apiClient.post('users', userData);

        return response.status === 201; // Return true if user creation was successful

    } catch (error) {
        console.error('Error creating user:', error);
        return false; // Return false if there was an error
    }
}

export const validateEmail = async (token: string) => {
    try {
        const response = await apiClient.post(`users/activate/${token}`);
        return response.status === 200; // Return true if email validation was successful
    } catch (error) {
        console.error('Error validating email:', error);
        return false; // Return false if there was an error
    }
}

export type { User, UserRequest, Role };

export const userService = {
    createUser,
};