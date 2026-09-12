import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { orderServices } from "@/services/orders/orderServices";
import { Order } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const orderKeys = {
    all: ["orders"] as const,
    lists: () => [...orderKeys.all, "list"] as const,
    list: (page: number, limit: number, search: string = "", status: string = "all", startDate: string = "", endDate: string = "") =>
        [...orderKeys.lists(), { page, limit, search, status, startDate, endDate }] as const,
    allList: () => [...orderKeys.all, "all-list"] as const,
    details: () => [...orderKeys.all, "detail"] as const,
    detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Queries
export const useOrders = (page: number = 1, limit: number = 10, search: string = "", status: string = "all", startDate: string = "", endDate: string = "") => {
    return useQuery({
        queryKey: orderKeys.list(page, limit, search, status, startDate, endDate),
        queryFn: () => orderServices.getOrders(page, limit, search, status, startDate, endDate),
        placeholderData: keepPreviousData,
        refetchInterval: 3000, // Live background auto-refetch every 3s
        refetchOnWindowFocus: true,
    });
};

export const useAllOrders = () => {
    return useQuery({
        queryKey: orderKeys.allList(),
        queryFn: () => orderServices.getAllOrders(),
        refetchInterval: 3000,
    });
};

export const useOrder = (id: string) => {
    return useQuery({
        queryKey: orderKeys.detail(id),
        queryFn: () => orderServices.getOrderById(id),
        enabled: !!id,
        refetchInterval: 3000,
    });
};

// Mutations
export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Order>) => orderServices.createOrder({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success(res.message || "تم إنشاء الطلب بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إنشاء الطلب");
        },
    });
};

export const useBulkUploadOrders = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ordersData: Partial<Order>[]) => orderServices.bulkUploadOrders(ordersData),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            toast.success(`تم رفع ${res.count || res.data?.length || 0} طلب بنجاح`);
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء الرفع الجماعي للطلبات");
        },
    });
};

export const useUpdateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Order> }) => orderServices.updateOrder(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success(res.message || "تم تحديث بيانات الطلب بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الطلب");
        },
    });
};

export const useGroupOrdersToShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { orderIds: string[]; shipmentId: string }) => orderServices.groupOrdersToShipment(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success(res.message || "تم تجميع الطلبات في الشحنة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تجميع الطلبات");
        },
    });
};

export const useDeleteOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => orderServices.deleteOrder(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            toast.success(res.message || "تم حذف الطلب بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الطلب");
        },
    });
};
