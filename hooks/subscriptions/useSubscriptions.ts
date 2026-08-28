import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { subscriptionServices } from "@/services/subscriptions/subscriptionServices";
import { Subscription } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const subscriptionKeys = {
    all: ["subscriptions"] as const,
    lists: () => [...subscriptionKeys.all, "list"] as const,
    list: (page: number, limit: number, search: string = "", status: string = "all", companyId: string = "") =>
        [...subscriptionKeys.lists(), { page, limit, search, status, companyId }] as const,
    allList: () => [...subscriptionKeys.all, "all-list"] as const,
    details: () => [...subscriptionKeys.all, "detail"] as const,
    detail: (id: string) => [...subscriptionKeys.details(), id] as const,
    company: (companyId: string) => [...subscriptionKeys.all, "company", companyId] as const,
};

// Queries
export const useSubscriptions = (page: number = 1, limit: number = 10, search: string = "", status: string = "all", companyId: string = "") => {
    return useQuery({
        queryKey: subscriptionKeys.list(page, limit, search, status, companyId),
        queryFn: () => subscriptionServices.getSubscriptions(page, limit, search, status, companyId),
        placeholderData: keepPreviousData,
        refetchInterval: 3000,
        refetchOnWindowFocus: true,
    });
};

export const useAllSubscriptions = () => {
    return useQuery({
        queryKey: subscriptionKeys.allList(),
        queryFn: () => subscriptionServices.getAllSubscriptions(),
        refetchInterval: 3000,
    });
};

export const useSubscription = (id: string) => {
    return useQuery({
        queryKey: subscriptionKeys.detail(id),
        queryFn: () => subscriptionServices.getSubscriptionById(id),
        enabled: !!id,
        refetchInterval: 3000,
    });
};

export const useCompanySubscription = (companyId: string) => {
    return useQuery({
        queryKey: subscriptionKeys.company(companyId),
        queryFn: () => subscriptionServices.getCompanySubscription(companyId),
        enabled: !!companyId,
        refetchInterval: 3000,
    });
};

// Mutations
export const useCreateSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Subscription>) => subscriptionServices.createSubscription({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toast.success(res.message || "تم ربط وتأكيد الاشتراك بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تفعيل الاشتراك");
        },
    });
};

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Subscription> }) => subscriptionServices.updateSubscription(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toast.success(res.message || "تم تحديث بيانات الاشتراك بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الاشتراك");
        },
    });
};

export const useDeleteSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => subscriptionServices.deleteSubscription(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toast.success(res.message || "تم حذف الاشتراك بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الاشتراك");
        },
    });
};
