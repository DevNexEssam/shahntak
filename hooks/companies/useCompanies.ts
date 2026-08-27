import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { companyServices } from "@/services/companies/companyServices";
import { Company } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const companyKeys = {
    all: ["companies"] as const,
    lists: () => [...companyKeys.all, "list"] as const,
    list: (page: number, limit: number) => [...companyKeys.lists(), { page, limit }] as const,
    allList: () => [...companyKeys.all, "all-list"] as const,
    details: () => [...companyKeys.all, "detail"] as const,
    detail: (id: string) => [...companyKeys.details(), id] as const,
    fullDetails: (id: string) => [...companyKeys.details(), "full", id] as const,
};

// Queries
export const useCompanies = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: companyKeys.list(page, limit),
        queryFn: () => companyServices.getCompanies(page, limit),
        placeholderData: keepPreviousData,
    });
};

export const useAllCompanies = () => {
    return useQuery({
        queryKey: companyKeys.allList(),
        queryFn: () => companyServices.getAllCompanies(),
    });
};

export const useCompany = (id: string) => {
    return useQuery({
        queryKey: companyKeys.detail(id),
        queryFn: () => companyServices.getCompanyById(id),
        enabled: !!id,
    });
};

export const useCompanyFullDetails = (id: string) => {
    return useQuery({
        queryKey: companyKeys.fullDetails(id),
        queryFn: () => companyServices.getCompanyFullDetails(id),
        enabled: !!id,
    });
};

// Mutations
export const useCreateCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Company>) => companyServices.createCompany({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: companyKeys.all });
            toast.success(res.message || "تم تسجيل الشركة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تسجيل الشركة");
        },
    });
};

export const useUpdateCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Company> }) => companyServices.updateCompany(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: companyKeys.all });
            queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات الشركة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث بيانات الشركة");
        },
    });
};

export const useUpdateCompanyStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; status: Company["status"] }) => companyServices.updateCompanyStatus(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: companyKeys.all });
            queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث حالة الشركة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث حالة الشركة");
        },
    });
};

export const useApproveCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; approvedBy: string }) => companyServices.approveCompany(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: companyKeys.all });
            queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) });
            toast.success(res.message || "تم الموافقة على اعتماد الشركة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء اعتماد الشركة");
        },
    });
};

export const useDeleteCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => companyServices.deleteCompany(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: companyKeys.all });
            toast.success(res.message || "تم حذف الشركة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الشركة");
        },
    });
};
