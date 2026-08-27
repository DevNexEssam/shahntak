import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { shipmentServices } from "@/services/shipments/shipmentServices";
import { Shipment, ShipmentStatus } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const shipmentKeys = {
    all: ["shipments"] as const,
    lists: () => [...shipmentKeys.all, "list"] as const,
    list: (page: number, limit: number, search: string = "", status: string = "all", type: string = "all") =>
        [...shipmentKeys.lists(), { page, limit, search, status, type }] as const,
    allList: () => [...shipmentKeys.all, "all-list"] as const,
    details: () => [...shipmentKeys.all, "detail"] as const,
    detail: (id: string) => [...shipmentKeys.details(), id] as const,
};

// Queries
export const useShipments = (page: number = 1, limit: number = 10, search: string = "", status: string = "all", type: string = "all") => {
    return useQuery({
        queryKey: shipmentKeys.list(page, limit, search, status, type),
        queryFn: () => shipmentServices.getShipments(page, limit, search, status, type),
        placeholderData: keepPreviousData,
    });
};

export const useAllShipments = () => {
    return useQuery({
        queryKey: shipmentKeys.allList(),
        queryFn: () => shipmentServices.getAllShipments(),
    });
};

export const useShipment = (id: string) => {
    return useQuery({
        queryKey: shipmentKeys.detail(id),
        queryFn: () => shipmentServices.getShipmentById(id),
        enabled: !!id,
    });
};

// Mutations
export const useCreateShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Shipment>) => shipmentServices.createShipment({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success(res.message || "تم إنشاء الشحنة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إنشاء الشحنة");
        },
    });
};

export const useUpdateShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Shipment> }) => shipmentServices.updateShipment(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات الشحنة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الشحنة");
        },
    });
};

export const useAssignShipmentResources = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; routeId?: string; carrierId?: string; vehicleId?: string }) =>
            shipmentServices.assignShipmentResources(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(variables.id) });
            toast.success(res.message || "تم تعيين الناقل والمسار والمركبة للشحنة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تعيين موارد الشحنة");
        },
    });
};

export const useUpdateShipmentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; status: ShipmentStatus }) => shipmentServices.updateShipmentStatus(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["tracking-events"] });
            toast.success(res.message || "تم تحديث حالة الشحنة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث حالة الشحنة");
        },
    });
};

export const useDeleteShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => shipmentServices.deleteShipment(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            toast.success(res.message || "تم حذف الشحنة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الشحنة");
        },
    });
};
