/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyExpenseServices } from "@/services/company/CompanyExpenseServices";
import toast from "react-hot-toast";

export const COMPANY_EXPENSE_KEYS = {
    all: ["companyExpenses"] as const,
    lists: () => [...COMPANY_EXPENSE_KEYS.all, "list"] as const,
    list: (page: number, limit: number, search: string, category: string, startDate: string = "", endDate: string = "") =>
        [...COMPANY_EXPENSE_KEYS.lists(), { page, limit, search, category, startDate, endDate }] as const,
} as const;

export const useCompanyExpenses = (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    category: string = "",
    startDate: string = "",
    endDate: string = ""
) => {
    return useQuery({
        queryKey: COMPANY_EXPENSE_KEYS.list(page, limit, search, category, startDate, endDate),
        queryFn: () => companyExpenseServices.getExpenses(page, limit, search, category, startDate, endDate),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });
};

export const useCreateCompanyExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => companyExpenseServices.createExpense(data),
        onSuccess: (res: any) => {
            toast.success(res.message || "تم تسجيل المصروف بنجاح");
            queryClient.invalidateQueries({ queryKey: COMPANY_EXPENSE_KEYS.all });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "فشل تسجيل المصروف");
        },
    });
};

export const useUpdateCompanyExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            companyExpenseServices.updateExpense(id, data),
        onSuccess: (res: any) => {
            toast.success(res.message || "تم تعديل المصروف بنجاح");
            queryClient.invalidateQueries({ queryKey: COMPANY_EXPENSE_KEYS.all });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "فشلت عملية تعديل المصروف");
        },
    });
};

export const useDeleteCompanyExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => companyExpenseServices.deleteExpense(id),
        onSuccess: (res: any) => {
            toast.success(res.message || "تم حذف المصروف بنجاح");
            queryClient.invalidateQueries({ queryKey: COMPANY_EXPENSE_KEYS.all });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "فشلت عملية حذف المصروف");
        },
    });
};
