import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { usersService } from "@/services/users/userServices";
import { User } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (page: number, limit: number, search: string = "", status: string = "") =>
        [...userKeys.lists(), { page, limit, search, status }] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

// Queries
export const useUsers = (page: number = 1, limit: number = 10, search: string = "", status: string = "") => {
    return useQuery({
        queryKey: userKeys.list(page, limit, search, status),
        queryFn: () => usersService.getUsers(page, limit, search, status),
        placeholderData: keepPreviousData,
    });
};

export const useUser = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => usersService.getUserById(id),
        enabled: !!id && enabled,
    });
};

// Mutations
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<User>) => usersService.createUser({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast.success(res.message || "تم إنشاء المستخدم بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إنشاء المستخدم");
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<User> }) => usersService.updateUser(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات المستخدم بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث البيانات");
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => usersService.deleteUser({ id }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast.success(res.message || "تم حذف المستخدم بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف المستخدم");
        },
    });
};
