/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyExpenseServices = {
    getExpenses: async (page: number = 1, limit: number = 10, search: string = "", category: string = "", startDate: string = "", endDate: string = ""): Promise<any> => {
        const { data } = await axios.get(
            `/api/company/expenses?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
        );
        return data;
    },

    createExpense: async (payload: any): Promise<any> => {
        const { data } = await axios.post("/api/company/expenses", payload);
        return data;
    },

    updateExpense: async (id: string, payload: any): Promise<any> => {
        const { data } = await axios.put(`/api/company/expenses/${id}`, payload);
        return data;
    },

    deleteExpense: async (id: string): Promise<any> => {
        const { data } = await axios.delete(`/api/company/expenses/${id}`);
        return data;
    },
};
