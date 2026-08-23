import { Invoice, InvoiceResponse, InvoiceSingleResponse, InvoiceDeleteResponse } from "@/types/data";
import axios from "axios";

export const invoiceServices = {
    // Get paginated invoices list
    getInvoices: async (page: number = 1, limit: number = 10): Promise<InvoiceResponse> => {
        const { data } = await axios.get(`/api/admin/invoices?page=${page}&limit=${limit}`);
        return data;
    },

    // Get all invoices without pagination
    getAllInvoices: async (): Promise<InvoiceResponse> => {
        const { data } = await axios.get("/api/admin/invoices?nopagination=true");
        return data;
    },

    // Get single invoice by ID
    getInvoiceById: async (id: string): Promise<InvoiceSingleResponse> => {
        const { data } = await axios.get(`/api/admin/invoices/${id}`);
        return data;
    },

    // Create a new invoice
    createInvoice: async (payload: { data: Partial<Invoice> }): Promise<InvoiceSingleResponse> => {
        const { data } = await axios.post("/api/admin/invoices/new", payload.data);
        return data;
    },

    // Update invoice details by ID
    updateInvoice: async (payload: { id: string; updates: Partial<Invoice> }): Promise<InvoiceSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/invoices/${payload.id}`, payload.updates);
        return data;
    },

    // Custom Business Logic: Update invoice status (draft, issued, paid, overdue, cancelled)
    updateInvoiceStatus: async (payload: { id: string; status: Invoice["status"] }): Promise<InvoiceSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/invoices/${payload.id}`, { status: payload.status });
        return data;
    },

    // Delete invoice by ID
    deleteInvoice: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<InvoiceDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/invoices/${id}`, {
            params: { hard }
        });
        return data;
    },
};
