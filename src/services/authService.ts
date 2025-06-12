import apiClient from "@/utils/api";

export type Login = {
    email: string;
    password: string;
}

export type Register = {
    displayName: string;
    username: string;
    email: string;
    password: string;
};

export type UserRole = "user" | "admin" | "moderator";

export type User = {
    id: string;
    username: string;
    email: string;
    displayName: string;
    bio: string;
    profilePicture: string;
    coverPicture: string;
    isVerified: boolean;
    role: UserRole;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    createdAt: string;
};

export type AuthResponse = {
    message: string;
    token: string;
    user: User;
};

// Method POST
const createUser = async (userData: Register) => {
    console.log('Creating user with data:', userData, JSON.stringify(userData));
    try {
        const response = await apiClient.post('auth/register', userData);

        return response.status === 201; // Return true if user creation was successful

    } catch (error) {
        console.error('Error creating user:', error);
        return false; // Return false if there was an error
    }
}

const validateEmail = async (token: string) => {
    try {
        const response = await apiClient.post(`auth/activate/${token}`);
        return response.status === 200; // Return true if email validation was successful
    } catch (error) {
        console.error('Error validating email:', error);
        return false; // Return false if there was an error
    }
}

const login = async (userData: Login) => {
    try {
        const response = await apiClient.post('auth/login', userData);
        if (response.status === 200) {
            // Assuming the response contains user data and a token
            const { user, token } = response.data;
            // Store user data and token in local storage or context
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            return { user, token }; // Return user data and token
        } else {
            console.error('Login failed:', response.statusText);
            return null; // Return null if login failed
        }
    } catch (error) {
        console.error('Error during login:', error);
        return null; // Return null if there was an error
    }
}

export const userService = {
    createUser,
    validateEmail,
    login,
};


