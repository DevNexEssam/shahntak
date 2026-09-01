/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyInvoiceServices = {
    getInvoices: async (page: number = 1, limit: number = 10, search: string = ""): Promise<any> => {
        const { data } = await axios.get(`/api/company/invoices?page=${page}&limit=${limit}&search=${search}`);
        return data;
    },

    getInvoiceById: async (id: string): Promise<any> => {
        const { data } = await axios.get(`/api/company/invoices/${id}`);
        return data;
    },
};
