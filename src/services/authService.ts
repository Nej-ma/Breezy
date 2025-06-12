import apiClient from "@/utils/api";

export type LoginModel = {
    email: string;
    password: string;
}

export type RegisterModel = {
    displayName: string;
    username: string;
    email: string;
    password: string;
};

// Method POST
const createUser = async (userData: RegisterModel) => {
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

export const userService = {
    createUser,
    validateEmail,
};


