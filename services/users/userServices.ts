/* eslint-disable @typescript-eslint/no-explicit-any */
import { Admin, AdminResponse } from "@/types/data";
import axios from "axios";

export const adminsService = {
    // Get all admins
    getAdmins: async (page: number = 1, limit: number = 10): Promise<AdminResponse> => {
        const { data } = await axios.get(`/api/admin?page=${page}&limit=${limit}`);
        return data;
    },

    // Get all admins (no pagination)
    getAlladmins: async (): Promise<AdminResponse> => {
        const { data } = await axios.get(`/api/admin?nopagination=true`);
        return data;
    },

    // Get admin by id
    getAdminById: async (id: string): Promise<Admin> => {
        const { data } = await axios.get(`/api/admin/${id}`);
        return data;
    },

    // Create admin
    createAdmin: async (payload: { data: Admin, avatarFile?: File | null }): Promise<AdminResponse> => {
        let requestData: any = payload.data;
        let headers = {};

        if (payload.avatarFile) {
            const formData = new FormData();
            formData.append("data", JSON.stringify(payload.data));
            formData.append("avatarFile", payload.avatarFile);
            requestData = formData;
            headers = { "Content-Type": "multipart/form-data" };
        }

        const { data } = await axios.post("/api/admin/new", requestData, { headers });
        return data;
    },

    // Update admin
    updateAdmin: async (payload: { id: string, updates: Partial<Admin>, avatarFile?: File | null }): Promise<AdminResponse> => {
        let requestData: any = payload.updates;
        let headers = {};

        if (payload.avatarFile) {
            const formData = new FormData();
            formData.append("data", JSON.stringify(payload.updates));
            formData.append("avatarFile", payload.avatarFile);
            requestData = formData;
            headers = { "Content-Type": "multipart/form-data" };
        }

        const { data } = await axios.patch(`/api/admin/${payload.id}`, requestData, { headers });
        return data;
    },

    // Delete admin
    deleteAdmin: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<AdminResponse> => {
        const { data } = await axios.delete(`/api/admin/${id}`, {
            params: { hard }
        });
        return data;
    }
};