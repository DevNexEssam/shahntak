import { CompanyUser, CompanyUserResponse, CompanyUserSingleResponse, CompanyUserDeleteResponse, CompanyUserFullDetailsResponse } from "@/types/data";
import axios from "axios";

export const companyUserServices = {
    // Get paginated company users list
    getCompanyUsers: async (page: number = 1, limit: number = 10): Promise<CompanyUserResponse> => {
        const { data } = await axios.get(`/api/admin/company-users?page=${page}&limit=${limit}`);
        return data;
    },

    // Get all company users without pagination
    getAllCompanyUsers: async (): Promise<CompanyUserResponse> => {
        const { data } = await axios.get("/api/admin/company-users?nopagination=true");
        return data;
    },

    // Get single company user by ID
    getCompanyUserById: async (id: string): Promise<CompanyUserSingleResponse> => {
        const { data } = await axios.get(`/api/admin/company-users/${id}`);
        return data;
    },

    // Get full company user details (stats, recent orders, creator info) by ID
    getCompanyUserFullDetails: async (id: string): Promise<CompanyUserFullDetailsResponse> => {
        const { data } = await axios.get(`/api/admin/company-users/${id}/details`);
        return data;
    },

    // Create a new company user
    createCompanyUser: async (payload: { data: Partial<CompanyUser> }): Promise<CompanyUserSingleResponse> => {
        const { data } = await axios.post("/api/admin/company-users/new", payload.data);
        return data;
    },

    // Update company user details by ID
    updateCompanyUser: async (payload: { id: string; updates: Partial<CompanyUser> }): Promise<CompanyUserSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/company-users/${payload.id}`, payload.updates);
        return data;
    },

    // Toggle company user active status
    toggleCompanyUserStatus: async (payload: { id: string; userIsActive: boolean }): Promise<CompanyUserSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/company-users/${payload.id}`, {
            userIsActive: payload.userIsActive,
        });
        return data;
    },

    // Custom Business Logic: Update user role & permissions (owner, manager, staff)
    updateUserRoleAndPermissions: async (payload: { id: string; userRole: CompanyUser["userRole"]; permissions: string[] }): Promise<CompanyUserSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/company-users/${payload.id}`, {
            userRole: payload.userRole,
            permissions: payload.permissions,
        });
        return data;
    },

    // Delete company user by ID
    deleteCompanyUser: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<CompanyUserDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/company-users/${id}`, {
            params: { hard }
        });
        return data;
    },
};
