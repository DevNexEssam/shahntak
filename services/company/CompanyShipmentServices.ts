/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyShipmentServices = {
    getShipments: async (page: number = 1, limit: number = 10, search: string = ""): Promise<any> => {
        const { data } = await axios.get(`/api/company/shipments?page=${page}&limit=${limit}&search=${search}`);
        return data;
    },

    getShipmentById: async (id: string): Promise<any> => {
        const { data } = await axios.get(`/api/company/shipments/${id}`);
        return data;
    },

    createShipment: async (payload: { data: any }): Promise<any> => {
        const { data } = await axios.post("/api/company/shipments/new", payload.data);
        return data;
    },

    updateShipment: async (payload: { id: string; updates: any }): Promise<any> => {
        const { data } = await axios.put(`/api/company/shipments/${payload.id}`, payload.updates);
        return data;
    },

    deleteShipment: async ({ id }: { id: string }): Promise<any> => {
        const { data } = await axios.delete(`/api/company/shipments/${id}`);
        return data;
    }
};
