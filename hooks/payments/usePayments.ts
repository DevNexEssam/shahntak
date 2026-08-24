import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { paymentServices } from "@/services/payments/paymentServices";
import { Payment } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const paymentKeys = {
    all: ["payments"] as const,
    lists: () => [...paymentKeys.all, "list"] as const,
    list: (page: number, limit: number) => [...paymentKeys.lists(), { page, limit }] as const,
    details: () => [...paymentKeys.all, "detail"] as const,
    detail: (id: string) => [...paymentKeys.details(), id] as const,
};

// Queries
export const usePayments = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: paymentKeys.list(page, limit),
        queryFn: () => paymentServices.getPayments(page, limit),
        placeholderData: keepPreviousData,
    });
};

export const usePayment = (id: string) => {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => paymentServices.getPaymentById(id),
        enabled: !!id,
    });
};

// Mutations
export const useCreatePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Payment>) => paymentServices.createPayment({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success(res.message || "تم تسجيل عملية السداد وتحديث الفاتورة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إثبات سداد الفاتورة");
        },
    });
};

export const useDeletePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string }) => paymentServices.deletePayment(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success(res.message || "تم حذف عملية الدفع بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف سجل الدفع");
        },
    });
};
