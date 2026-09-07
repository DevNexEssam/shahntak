/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { companyOrderServices } from "@/services/company/CompanyOrderServices";

// Object as const pattern for Query Keys
export const COMPANY_ORDER_KEYS = {
    all: ["companyOrders"] as const,
    lists: () => [...COMPANY_ORDER_KEYS.all, "list"] as const,
    list: (page: number, limit: number, search: string, startDate?: string, endDate?: string) =>
        [...COMPANY_ORDER_KEYS.lists(), { page, limit, search, startDate, endDate }] as const,
    details: () => [...COMPANY_ORDER_KEYS.all, "detail"] as const,
    detail: (id: string) => [...COMPANY_ORDER_KEYS.details(), id] as const,
} as const;

// Fetch Company Orders Hook (Supports Pagination, Search and Date Range Filtering)
export const useCompanyOrders = (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    startDate: string = "",
    endDate: string = ""
) => {
    return useQuery({
        queryKey: COMPANY_ORDER_KEYS.list(page, limit, search, startDate, endDate),
        queryFn: () => companyOrderServices.getOrders(page, limit, search, startDate, endDate),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });
};

// Fetch Company Order By ID Hook
export const useCompanyOrderById = (id: string) => {
    return useQuery({
        queryKey: COMPANY_ORDER_KEYS.detail(id),
        queryFn: () => companyOrderServices.getOrderById(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!id,
    });
};

// Create Company Order Mutation
export const useCreateCompanyOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyOrderServices.createOrder,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم إضافة الطلب بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_ORDER_KEYS.lists() });
            } else {
                toast.error(response.message || "حدث خطأ أثناء الإضافة");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
            toast.error(message);
        },
    });
};

// Update Company Order Mutation
export const useUpdateCompanyOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyOrderServices.updateOrder,
        onSuccess: (response, variables) => {
            if (response.success) {
                toast.success(response.message || "تم تحديث بيانات الطلب بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_ORDER_KEYS.lists() });
                queryClient.invalidateQueries({ queryKey: COMPANY_ORDER_KEYS.detail(variables.id) });
            } else {
                toast.error(response.message || "حدث خطأ أثناء التحديث");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
            toast.error(message);
        },
    });
};

// Delete Company Order Mutation
export const useDeleteCompanyOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyOrderServices.deleteOrder,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم حذف الطلب بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_ORDER_KEYS.lists() });
            } else {
                toast.error(response.message || "حدث خطأ أثناء الحذف");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
            toast.error(message);
        },
    });
};

// Bulk Import Company Orders Mutation
export const useBulkImportCompanyOrders = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyOrderServices.bulkImportOrders,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم استيراد الطلبات بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_ORDER_KEYS.lists() });
            } else {
                toast.error(response.message || "حدث خطأ أثناء الاستيراد");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ أثناء الاستيراد";
            toast.error(message);
        },
    });
};
