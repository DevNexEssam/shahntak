import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { routeServices } from "@/services/routes/routeServices";
import { Route } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const routeKeys = {
    all: ["routes"] as const,
    lists: () => [...routeKeys.all, "list"] as const,
    list: (page: number, limit: number, search: string = "", status: string = "all") =>
        [...routeKeys.lists(), { page, limit, search, status }] as const,
    allList: () => [...routeKeys.all, "all-list"] as const,
    details: () => [...routeKeys.all, "detail"] as const,
    detail: (id: string) => [...routeKeys.details(), id] as const,
};

// Queries
export const useRoutes = (page: number = 1, limit: number = 10, search: string = "", status: string = "all") => {
    return useQuery({
        queryKey: routeKeys.list(page, limit, search, status),
        queryFn: () => routeServices.getRoutes(page, limit, search, status),
        placeholderData: keepPreviousData,
    });
};

export const useAllRoutes = () => {
    return useQuery({
        queryKey: routeKeys.allList(),
        queryFn: () => routeServices.getAllRoutes(),
    });
};

export const useRoute = (id: string) => {
    return useQuery({
        queryKey: routeKeys.detail(id),
        queryFn: () => routeServices.getRouteById(id),
        enabled: !!id,
    });
};

// Mutations
export const useCreateRoute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Route>) => routeServices.createRoute({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: routeKeys.all });
            toast.success(res.message || "تم إنشاء المسار اللوجستي بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إنشاء المسار");
        },
    });
};

export const useUpdateRoute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Route> }) => routeServices.updateRoute(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: routeKeys.all });
            queryClient.invalidateQueries({ queryKey: routeKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات المسار بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث المسار");
        },
    });
};

export const useUpdateRoutePricing = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; basePrice: number; estimatedTransitTime?: string }) =>
            routeServices.updateRoutePricing(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: routeKeys.all });
            queryClient.invalidateQueries({ queryKey: routeKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث تسعيرة ومدّة المسار بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث تسعيرة المسار");
        },
    });
};

export const useDeleteRoute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => routeServices.deleteRoute(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: routeKeys.all });
            toast.success(res.message || "تم حذف المسار بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف المسار");
        },
    });
};
