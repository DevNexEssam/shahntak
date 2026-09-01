/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyEmployeeServices = {
    getEmployees: async (page: number = 1, limit: number = 10, search: string = ""): Promise<any> => {
        const { data } = await axios.get(`/api/company/employees?page=${page}&limit=${limit}&search=${search}`);
        return data;
    },

    getEmployeeById: async (id: string): Promise<any> => {
        const { data } = await axios.get(`/api/company/employees/${id}`);
        return data;
    },

    createEmployee: async (payload: { data: any }): Promise<any> => {
        const { data } = await axios.post("/api/company/employees/new", payload.data);
        return data;
    },

    updateEmployee: async (payload: { id: string; updates: any }): Promise<any> => {
        const { data } = await axios.put(`/api/company/employees/${payload.id}`, payload.updates);
        return data;
    },

    deleteEmployee: async ({ id }: { id: string }): Promise<any> => {
        const { data } = await axios.delete(`/api/company/employees/${id}`);
        return data;
    }
};
