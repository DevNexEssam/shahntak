/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { companyVehicleServices } from "@/services/company/CompanyVehicleServices";

// Object as const pattern for Query Keys
export const COMPANY_VEHICLE_KEYS = {
    all: ["companyVehicles"] as const,
    lists: () => [...COMPANY_VEHICLE_KEYS.all, "list"] as const,
    list: (page: number, limit: number, search: string) =>
        [...COMPANY_VEHICLE_KEYS.lists(), { page, limit, search }] as const,
    details: () => [...COMPANY_VEHICLE_KEYS.all, "detail"] as const,
    detail: (id: string) => [...COMPANY_VEHICLE_KEYS.details(), id] as const,
} as const;

// Fetch Company Vehicles Hook
export const useCompanyVehicles = (page: number = 1, limit: number = 10, search: string = "") => {
    return useQuery({
        queryKey: COMPANY_VEHICLE_KEYS.list(page, limit, search),
        queryFn: () => companyVehicleServices.getVehicles(page, limit, search),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });
};

// Fetch Company Vehicle By ID Hook
export const useCompanyVehicleById = (id: string) => {
    return useQuery({
        queryKey: COMPANY_VEHICLE_KEYS.detail(id),
        queryFn: () => companyVehicleServices.getVehicleById(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!id,
    });
};

// Create Company Vehicle Mutation
export const useCreateCompanyVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyVehicleServices.createVehicle,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تمت إضافة المركبة بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_VEHICLE_KEYS.lists() });
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

// Update Company Vehicle Mutation
export const useUpdateCompanyVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyVehicleServices.updateVehicle,
        onSuccess: (response, variables) => {
            if (response.success) {
                toast.success(response.message || "تم تحديث بيانات المركبة بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_VEHICLE_KEYS.lists() });
                queryClient.invalidateQueries({ queryKey: COMPANY_VEHICLE_KEYS.detail(variables.id) });
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

// Delete Company Vehicle Mutation
export const useDeleteCompanyVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyVehicleServices.deleteVehicle,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم حذف المركبة بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_VEHICLE_KEYS.lists() });
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
