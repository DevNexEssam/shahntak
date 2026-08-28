import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { planServices } from "@/services/plans/planServices";
import { Plan } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const planKeys = {
    all: ["plans"] as const,
    lists: () => [...planKeys.all, "list"] as const,
    list: (page: number, limit: number, search: string = "", cycle: string = "all") =>
        [...planKeys.lists(), { page, limit, search, cycle }] as const,
    allList: () => [...planKeys.all, "all-list"] as const,
    details: () => [...planKeys.all, "detail"] as const,
    detail: (id: string) => [...planKeys.details(), id] as const,
};

// Queries
export const usePlans = (page: number = 1, limit: number = 10, search: string = "", cycle: string = "all") => {
    return useQuery({
        queryKey: planKeys.list(page, limit, search, cycle),
        queryFn: () => planServices.getPlans(page, limit, search, cycle),
        placeholderData: keepPreviousData,
        refetchInterval: 3000,
        refetchOnWindowFocus: true,
    });
};

export const useAllPlans = () => {
    return useQuery({
        queryKey: planKeys.allList(),
        queryFn: () => planServices.getAllPlans(),
        refetchInterval: 3000,
    });
};

export const usePlan = (id: string) => {
    return useQuery({
        queryKey: planKeys.detail(id),
        queryFn: () => planServices.getPlanById(id),
        enabled: !!id,
        refetchInterval: 3000,
    });
};

// Mutations
export const useCreatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Plan>) => planServices.createPlan({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: planKeys.all });
            toast.success(res.message || "تم إنشاء الباقة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إنشاء الباقة");
        },
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Plan> }) => planServices.updatePlan(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: planKeys.all });
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات الباقة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الباقة");
        },
    });
};

export const useDeletePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => planServices.deletePlan(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: planKeys.all });
            toast.success(res.message || "تم حذف الباقة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الباقة");
        },
    });
};
