import { Payment, PaymentResponse, PaymentSingleResponse, PaymentDeleteResponse } from "@/types/data";
import axios from "axios";

export const paymentServices = {
    // Get paginated payments list with server-side search & filtering
    getPayments: async (page: number = 1, limit: number = 10, search: string = "", method: string = "all"): Promise<PaymentResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search && search.trim() !== "") params.append("search", search.trim());
        if (method && method !== "all") params.append("method", method);

        const { data } = await axios.get(`/api/admin/payments?${params.toString()}`);
        return data;
    },

    // Get single payment by ID
    getPaymentById: async (id: string): Promise<PaymentSingleResponse> => {
        const { data } = await axios.get(`/api/admin/payments/${id}`);
        return data;
    },

    // Custom Business Logic: Record payment proof & auto-update invoice status to 'paid'
    createPayment: async (payload: { data: Partial<Payment> }): Promise<PaymentSingleResponse> => {
        const { data } = await axios.post("/api/admin/payments/new", payload.data);
        return data;
    },

    // Delete payment entry
    deletePayment: async ({ id, hard = true }: { id: string; hard?: boolean }): Promise<PaymentDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/payments/${id}`, {
            params: { hard }
        });
        return data;
    },
};
