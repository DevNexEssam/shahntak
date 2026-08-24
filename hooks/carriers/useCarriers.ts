import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { carrierServices } from "@/services/carriers/carrierServices";
import { Carrier } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const carrierKeys = {
    all: ["carriers"] as const,
    lists: () => [...carrierKeys.all, "list"] as const,
    list: (page: number, limit: number) => [...carrierKeys.lists(), { page, limit }] as const,
    allList: () => [...carrierKeys.all, "all-list"] as const,
    details: () => [...carrierKeys.all, "detail"] as const,
    detail: (id: string) => [...carrierKeys.details(), id] as const,
};

// Queries
export const useCarriers = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: carrierKeys.list(page, limit),
        queryFn: () => carrierServices.getCarriers(page, limit),
        placeholderData: keepPreviousData,
    });
};

export const useAllCarriers = () => {
    return useQuery({
        queryKey: carrierKeys.allList(),
        queryFn: () => carrierServices.getAllCarriers(),
    });
};

export const useCarrier = (id: string) => {
    return useQuery({
        queryKey: carrierKeys.detail(id),
        queryFn: () => carrierServices.getCarrierById(id),
        enabled: !!id,
    });
};

// Mutations
export const useCreateCarrier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Carrier>) => carrierServices.createCarrier({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: carrierKeys.all });
            toast.success(res.message || "تم إضافة الناقل بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إضافة الناقل");
        },
    });
};

export const useUpdateCarrier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Carrier> }) => carrierServices.updateCarrier(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: carrierKeys.all });
            queryClient.invalidateQueries({ queryKey: carrierKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات الناقل بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث بيانات الناقل");
        },
    });
};

export const useToggleCarrierStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; isActive: boolean }) => carrierServices.toggleCarrierStatus(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: carrierKeys.all });
            queryClient.invalidateQueries({ queryKey: carrierKeys.detail(variables.id) });
            toast.success(res.message || "تم تغيير حالة الناقل بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تغيير حالة الناقل");
        },
    });
};

export const useDeleteCarrier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => carrierServices.deleteCarrier(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: carrierKeys.all });
            toast.success(res.message || "تم حذف الناقل بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الناقل");
        },
    });
};
