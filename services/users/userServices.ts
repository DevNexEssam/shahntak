import { User, UserResponse, UserSingleResponse, UserDeleteResponse } from "@/types/data";
import axios from "axios";

export const usersService = {
    // Get paginated users list
    getUsers: async (page: number = 1, limit: number = 10): Promise<UserResponse> => {
        const { data } = await axios.get(`/api/admin/users?page=${page}&limit=${limit}`);
        return data;
    },

    // Get single user details by ID
    getUserById: async (id: string): Promise<UserSingleResponse> => {
        const { data } = await axios.get(`/api/admin/users/${id}`);
        return data;
    },

    // Create a new user
    createUser: async (payload: { data: Partial<User> }): Promise<UserSingleResponse> => {
        const { data } = await axios.post("/api/admin/users/new", payload.data);
        return data;
    },

    // Update existing user by ID
    updateUser: async (payload: { id: string; updates: Partial<User> }): Promise<UserSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/users/${payload.id}`, payload.updates);
        return data;
    },

    // Delete user by ID
    deleteUser: async ({ id }: { id: string }): Promise<UserDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/users/${id}`);
        return data;
    },
};

