import { Payment, PaymentResponse, PaymentSingleResponse, PaymentDeleteResponse } from "@/types/data";
import axios from "axios";

export const paymentServices = {
    // Get paginated payments list
    getPayments: async (page: number = 1, limit: number = 10): Promise<PaymentResponse> => {
        const { data } = await axios.get(`/api/admin/payments?page=${page}&limit=${limit}`);
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
    deletePayment: async ({ id }: { id: string }): Promise<PaymentDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/payments/${id}`);
        return data;
    },
};
