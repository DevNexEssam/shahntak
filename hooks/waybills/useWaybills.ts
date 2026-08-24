import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { waybillServices } from "@/services/waybills/waybillServices";
import { Waybill } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const waybillKeys = {
    all: ["waybills"] as const,
    lists: () => [...waybillKeys.all, "list"] as const,
    list: (page: number, limit: number) => [...waybillKeys.lists(), { page, limit }] as const,
    details: () => [...waybillKeys.all, "detail"] as const,
    detail: (id: string) => [...waybillKeys.details(), id] as const,
};

// Queries
export const useWaybills = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: waybillKeys.list(page, limit),
        queryFn: () => waybillServices.getWaybills(page, limit),
        placeholderData: keepPreviousData,
    });
};

export const useWaybill = (id: string) => {
    return useQuery({
        queryKey: waybillKeys.detail(id),
        queryFn: () => waybillServices.getWaybillById(id),
        enabled: !!id,
    });
};

// Mutations
export const useGenerateWaybill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { shipmentId: string }) => waybillServices.generateWaybill(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: waybillKeys.all });
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success(res.message || "تم توليد بوليصة الشحن PDF بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إصدار بوليصة الشحن");
        },
    });
};

export const useCreateWaybill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Waybill>) => waybillServices.createWaybill({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: waybillKeys.all });
            toast.success(res.message || "تم إنشاء بوليصة الشحن بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إنشاء بوليصة الشحن");
        },
    });
};

export const useDeleteWaybill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string }) => waybillServices.deleteWaybill(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: waybillKeys.all });
            toast.success(res.message || "تم حذف بوليصة الشحن بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف بوليصة الشحن");
        },
    });
};
