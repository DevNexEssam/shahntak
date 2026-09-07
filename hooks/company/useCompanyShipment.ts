/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { companyShipmentServices } from "@/services/company/CompanyShipmentServices";

// Object as const pattern for Query Keys
export const COMPANY_SHIPMENT_KEYS = {
    all: ["companyShipments"] as const,
    lists: () => [...COMPANY_SHIPMENT_KEYS.all, "list"] as const,
    list: (page: number, limit: number, search: string, startDate?: string, endDate?: string) =>
        [...COMPANY_SHIPMENT_KEYS.lists(), { page, limit, search, startDate, endDate }] as const,
    details: () => [...COMPANY_SHIPMENT_KEYS.all, "detail"] as const,
    detail: (id: string) => [...COMPANY_SHIPMENT_KEYS.details(), id] as const,
} as const;

// Fetch Company Shipments Hook (Supports Pagination, Search and Date Range Filtering)
export const useCompanyShipments = (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    startDate: string = "",
    endDate: string = ""
) => {
    return useQuery({
        queryKey: COMPANY_SHIPMENT_KEYS.list(page, limit, search, startDate, endDate),
        queryFn: () => companyShipmentServices.getShipments(page, limit, search, startDate, endDate),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });
};

// Fetch Company Shipment By ID Hook
export const useCompanyShipmentById = (id: string) => {
    return useQuery({
        queryKey: COMPANY_SHIPMENT_KEYS.detail(id),
        queryFn: () => companyShipmentServices.getShipmentById(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!id,
    });
};

// Create Company Shipment Mutation
export const useCreateCompanyShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyShipmentServices.createShipment,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم إنشاء الشحنة بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_SHIPMENT_KEYS.lists() });
            } else {
                toast.error(response.message || "حدث خطأ أثناء الإنشاء");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
            toast.error(message);
        },
    });
};

// Update Company Shipment Mutation
export const useUpdateCompanyShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyShipmentServices.updateShipment,
        onSuccess: (response, variables) => {
            if (response.success) {
                toast.success(response.message || "تم تحديث بيانات الشحنة بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_SHIPMENT_KEYS.lists() });
                queryClient.invalidateQueries({ queryKey: COMPANY_SHIPMENT_KEYS.detail(variables.id) });
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

// Delete Company Shipment Mutation
export const useDeleteCompanyShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyShipmentServices.deleteShipment,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم حذف الشحنة بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_SHIPMENT_KEYS.lists() });
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

// Bulk Import Company Shipments Mutation
export const useBulkImportCompanyShipments = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyShipmentServices.bulkImportShipments,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم استيراد الشحنات بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_SHIPMENT_KEYS.lists() });
                queryClient.invalidateQueries({ queryKey: ["companyOrders"] });
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
