/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyVehicleServices = {
    getVehicles: async (page: number = 1, limit: number = 10, search: string = ""): Promise<any> => {
        const { data } = await axios.get(`/api/company/vehicles?page=${page}&limit=${limit}&search=${search}`);
        return data;
    },

    getVehicleById: async (id: string): Promise<any> => {
        const { data } = await axios.get(`/api/company/vehicles/${id}`);
        return data;
    },

    createVehicle: async (payload: { data: any }): Promise<any> => {
        const { data } = await axios.post("/api/company/vehicles/new", payload.data);
        return data;
    },

    updateVehicle: async (payload: { id: string; updates: any }): Promise<any> => {
        const { data } = await axios.put(`/api/company/vehicles/${payload.id}`, payload.updates);
        return data;
    },

    deleteVehicle: async ({ id }: { id: string }): Promise<any> => {
        const { data } = await axios.delete(`/api/company/vehicles/${id}`);
        return data;
    }
};
