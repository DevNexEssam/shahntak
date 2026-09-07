/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { companyRouteServices } from "@/services/company/CompanyRouteServices";

// Object as const pattern for Query Keys
export const COMPANY_ROUTE_KEYS = {
    all: ["companyRoutes"] as const,
    lists: () => [...COMPANY_ROUTE_KEYS.all, "list"] as const,
    list: (page: number, limit: number, search: string, startDate?: string, endDate?: string) =>
        [...COMPANY_ROUTE_KEYS.lists(), { page, limit, search, startDate, endDate }] as const,
    details: () => [...COMPANY_ROUTE_KEYS.all, "detail"] as const,
    detail: (id: string) => [...COMPANY_ROUTE_KEYS.details(), id] as const,
} as const;

// Fetch Company Routes Hook (Supports Pagination, Search and Date Range Filtering)
export const useCompanyRoutes = (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    startDate: string = "",
    endDate: string = ""
) => {
    return useQuery({
        queryKey: COMPANY_ROUTE_KEYS.list(page, limit, search, startDate, endDate),
        queryFn: () => companyRouteServices.getRoutes(page, limit, search, startDate, endDate),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });
};

// Fetch All Active Company Routes Hook (No Pagination, for Select Dropdowns)
export const useAllCompanyRoutes = () => {
    return useQuery({
        queryKey: [...COMPANY_ROUTE_KEYS.lists(), "all"],
        queryFn: () => companyRouteServices.getAllRoutes(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Fetch Company Route By ID Hook
export const useCompanyRouteById = (id: string) => {
    return useQuery({
        queryKey: COMPANY_ROUTE_KEYS.detail(id),
        queryFn: () => companyRouteServices.getRouteById(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!id,
    });
};

// Create Company Route Mutation
export const useCreateCompanyRoute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyRouteServices.createRoute,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم إضافة المسار بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_ROUTE_KEYS.lists() });
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

// Update Company Route Mutation
export const useUpdateCompanyRoute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyRouteServices.updateRoute,
        onSuccess: (response, variables) => {
            if (response.success) {
                toast.success(response.message || "تم تحديث بيانات المسار بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_ROUTE_KEYS.lists() });
                queryClient.invalidateQueries({ queryKey: COMPANY_ROUTE_KEYS.detail(variables.id) });
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

// Delete Company Route Mutation
export const useDeleteCompanyRoute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyRouteServices.deleteRoute,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم حذف المسار بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_ROUTE_KEYS.lists() });
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
