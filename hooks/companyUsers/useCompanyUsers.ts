import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { companyUserServices } from "@/services/companyUsers/companyUserServices";
import { CompanyUser } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const companyUserKeys = {
    all: ["company-users"] as const,
    lists: () => [...companyUserKeys.all, "list"] as const,
    list: (page: number, limit: number) => [...companyUserKeys.lists(), { page, limit }] as const,
    allList: () => [...companyUserKeys.all, "all-list"] as const,
    details: () => [...companyUserKeys.all, "detail"] as const,
    detail: (id: string) => [...companyUserKeys.details(), id] as const,
    fullDetails: (id: string) => [...companyUserKeys.details(), "full", id] as const,
};

// Queries
export const useCompanyUsers = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: companyUserKeys.list(page, limit),
        queryFn: () => companyUserServices.getCompanyUsers(page, limit),
        placeholderData: keepPreviousData,
    });
};

export const useAllCompanyUsers = () => {
    return useQuery({
        queryKey: companyUserKeys.allList(),
        queryFn: () => companyUserServices.getAllCompanyUsers(),
    });
};

export const useCompanyUser = (id: string) => {
    return useQuery({
        queryKey: companyUserKeys.detail(id),
        queryFn: () => companyUserServices.getCompanyUserById(id),
        enabled: !!id,
    });
};

export const useCompanyUserFullDetails = (id: string) => {
    return useQuery({
        queryKey: companyUserKeys.fullDetails(id),
        queryFn: () => companyUserServices.getCompanyUserFullDetails(id),
        enabled: !!id,
    });
};

// Mutations
export const useCreateCompanyUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<CompanyUser>) => companyUserServices.createCompanyUser({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: companyUserKeys.all });
            toast.success(res.message || "تم إضافة موظف الشركة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إضافة الموظف");
        },
    });
};

export const useUpdateCompanyUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<CompanyUser> }) => companyUserServices.updateCompanyUser(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: companyUserKeys.all });
            queryClient.invalidateQueries({ queryKey: companyUserKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات الموظف بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث بيانات الموظف");
        },
    });
};

export const useUpdateCompanyUserRoleAndPermissions = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; userRole: CompanyUser["userRole"]; permissions: string[] }) =>
            companyUserServices.updateUserRoleAndPermissions(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: companyUserKeys.all });
            queryClient.invalidateQueries({ queryKey: companyUserKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث صلاحيات الدور والمستخدم بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الصلاحيات");
        },
    });
};

export const useToggleCompanyUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; userIsActive: boolean }) =>
            companyUserServices.toggleCompanyUserStatus(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: companyUserKeys.all });
            queryClient.invalidateQueries({ queryKey: companyUserKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: companyUserKeys.fullDetails(variables.id) });
            toast.success(res.message || "تم تغيير حالة الحساب بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تغيير حالة الحساب");
        },
    });
};

export const useDeleteCompanyUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => companyUserServices.deleteCompanyUser(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: companyUserKeys.all });
            toast.success(res.message || "تم حذف موظف الشركة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الموظف");
        },
    });
};
