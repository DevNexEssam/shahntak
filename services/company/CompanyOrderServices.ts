/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyOrderServices = {
    getOrders: async (page: number = 1, limit: number = 10, search: string = ""): Promise<any> => {
        const { data } = await axios.get(`/api/company/orders?page=${page}&limit=${limit}&search=${search}`);
        return data;
    },

    getOrderById: async (id: string): Promise<any> => {
        const { data } = await axios.get(`/api/company/orders/${id}`);
        return data;
    },

    createOrder: async (payload: { data: any }): Promise<any> => {
        const { data } = await axios.post("/api/company/orders/new", payload.data);
        return data;
    },

    updateOrder: async (payload: { id: string; updates: any }): Promise<any> => {
        const { data } = await axios.put(`/api/company/orders/${payload.id}`, payload.updates);
        return data;
    },

    deleteOrder: async ({ id }: { id: string }): Promise<any> => {
        const { data } = await axios.delete(`/api/company/orders/${id}`);
        return data;
    }
};
