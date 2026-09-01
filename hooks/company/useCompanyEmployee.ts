/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { companyEmployeeServices } from "@/services/company/CompanyEmployeeServices";

// Object as const pattern for Query Keys
export const COMPANY_EMPLOYEE_KEYS = {
    all: ["companyEmployees"] as const,
    lists: () => [...COMPANY_EMPLOYEE_KEYS.all, "list"] as const,
    list: (page: number, limit: number, search: string) =>
        [...COMPANY_EMPLOYEE_KEYS.lists(), { page, limit, search }] as const,
    details: () => [...COMPANY_EMPLOYEE_KEYS.all, "detail"] as const,
    detail: (id: string) => [...COMPANY_EMPLOYEE_KEYS.details(), id] as const,
} as const;

// Fetch Company Employees Hook (Supports Pagination and Search)
export const useCompanyEmployees = (page: number = 1, limit: number = 10, search: string = "") => {
    return useQuery({
        queryKey: COMPANY_EMPLOYEE_KEYS.list(page, limit, search),
        queryFn: () => companyEmployeeServices.getEmployees(page, limit, search),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });
};

// Fetch Company Employee By ID Hook
export const useCompanyEmployeeById = (id: string) => {
    return useQuery({
        queryKey: COMPANY_EMPLOYEE_KEYS.detail(id),
        queryFn: () => companyEmployeeServices.getEmployeeById(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!id,
    });
};

// Create Company Employee Mutation
export const useCreateCompanyEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyEmployeeServices.createEmployee,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم إضافة الموظف بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_EMPLOYEE_KEYS.lists() });
            } else {
                toast.error(response.message || "حدث خطأ أثناء الإضافة");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
            toast.error(message);
        },
    });
};

// Update Company Employee Mutation
export const useUpdateCompanyEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyEmployeeServices.updateEmployee,
        onSuccess: (response, variables) => {
            if (response.success) {
                toast.success(response.message || "تم تحديث بيانات الموظف بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_EMPLOYEE_KEYS.lists() });
                queryClient.invalidateQueries({ queryKey: COMPANY_EMPLOYEE_KEYS.detail(variables.id) });
            } else {
                toast.error(response.message || "حدث خطأ أثناء التحديث");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
            toast.error(message);
        },
    });
};

// Delete Company Employee Mutation
export const useDeleteCompanyEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companyEmployeeServices.deleteEmployee,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم حذف الموظف بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_EMPLOYEE_KEYS.lists() });
            } else {
                toast.error(response.message || "حدث خطأ أثناء الحذف");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
            toast.error(message);
        },
    });
};
