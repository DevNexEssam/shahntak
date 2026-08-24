import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { vehicleServices } from "@/services/vehicles/vehicleServices";
import { Vehicle } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const vehicleKeys = {
    all: ["vehicles"] as const,
    lists: () => [...vehicleKeys.all, "list"] as const,
    list: (page: number, limit: number) => [...vehicleKeys.lists(), { page, limit }] as const,
    allList: () => [...vehicleKeys.all, "all-list"] as const,
    details: () => [...vehicleKeys.all, "detail"] as const,
    detail: (id: string) => [...vehicleKeys.details(), id] as const,
};

// Queries
export const useVehicles = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: vehicleKeys.list(page, limit),
        queryFn: () => vehicleServices.getVehicles(page, limit),
        placeholderData: keepPreviousData,
    });
};

export const useAllVehicles = () => {
    return useQuery({
        queryKey: vehicleKeys.allList(),
        queryFn: () => vehicleServices.getAllVehicles(),
    });
};

export const useVehicle = (id: string) => {
    return useQuery({
        queryKey: vehicleKeys.detail(id),
        queryFn: () => vehicleServices.getVehicleById(id),
        enabled: !!id,
    });
};

// Mutations
export const useCreateVehicle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Vehicle>) => vehicleServices.createVehicle({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
            toast.success(res.message || "تم إضافة المركبة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إضافة المركبة");
        },
    });
};

export const useUpdateVehicle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Vehicle> }) => vehicleServices.updateVehicle(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
            queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات المركبة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث بيانات المركبة");
        },
    });
};

export const useUpdateVehicleCapacities = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; capacityWeight: number; capacityVolume: number }) =>
            vehicleServices.updateVehicleCapacities(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
            queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث سعات وحمولات المركبة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث أوزان وسعات المركبة");
        },
    });
};

export const useDeleteVehicle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => vehicleServices.deleteVehicle(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
            toast.success(res.message || "تم حذف المركبة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف المركبة");
        },
    });
};
