/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyInvoiceServices = {
    getInvoices: async (page: number = 1, limit: number = 10, search: string = "", startDate: string = "", endDate: string = ""): Promise<any> => {
        const { data } = await axios.get(
            `/api/company/invoices?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
        );
        return data;
    },

    getInvoiceById: async (id: string): Promise<any> => {
        const { data } = await axios.get(`/api/company/invoices/${id}`);
        return data;
    },

    updateInvoice: async (id: string, payload: any): Promise<any> => {
        const { data } = await axios.put(`/api/company/invoices/${id}`, payload);
        return data;
    },

    createInvoice: async (payload: any): Promise<any> => {
        const { data } = await axios.post("/api/company/invoices/new", payload);
        return data;
    },
};
