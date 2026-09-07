/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyRouteServices = {
    getRoutes: async (
        page: number = 1,
        limit: number = 10,
        search: string = "",
        startDate: string = "",
        endDate: string = ""
    ): Promise<any> => {
        let url = `/api/company/routes?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
        if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
        if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
        const { data } = await axios.get(url);
        return data;
    },

    getRouteById: async (id: string): Promise<any> => {
        const { data } = await axios.get(`/api/company/routes/${id}`);
        return data;
    },

    createRoute: async (payload: { data: any }): Promise<any> => {
        const { data } = await axios.post("/api/company/routes/new", payload.data);
        return data;
    },

    updateRoute: async (payload: { id: string; updates: any }): Promise<any> => {
        const { data } = await axios.put(`/api/company/routes/${payload.id}`, payload.updates);
        return data;
    },

    getAllRoutes: async (): Promise<any> => {
        const { data } = await axios.get("/api/company/routes?nopagination=true");
        return data;
    },

    deleteRoute: async ({ id, hard }: { id: string; hard?: boolean }): Promise<any> => {
        const { data } = await axios.delete(`/api/company/routes/${id}${hard ? "?hard=true" : ""}`);
        return data;
    }
};
