/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyInvoiceServices } from "@/services/company/CompanyInvoiceServices";
import toast from "react-hot-toast";

// Object as const pattern for Query Keys
export const COMPANY_INVOICE_KEYS = {
    all: ["companyInvoices"] as const,
    lists: () => [...COMPANY_INVOICE_KEYS.all, "list"] as const,
    list: (page: number, limit: number, search: string, startDate: string = "", endDate: string = "") =>
        [...COMPANY_INVOICE_KEYS.lists(), { page, limit, search, startDate, endDate }] as const,
    details: () => [...COMPANY_INVOICE_KEYS.all, "detail"] as const,
    detail: (id: string) => [...COMPANY_INVOICE_KEYS.details(), id] as const,
} as const;

// Fetch Company Invoices Hook (Supports Pagination, Search, and Date Range)
export const useCompanyInvoices = (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    startDate: string = "",
    endDate: string = ""
) => {
    return useQuery({
        queryKey: COMPANY_INVOICE_KEYS.list(page, limit, search, startDate, endDate),
        queryFn: () => companyInvoiceServices.getInvoices(page, limit, search, startDate, endDate),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });
};

// Fetch Company Invoice By ID Hook
export const useCompanyInvoiceById = (id: string) => {
    return useQuery({
        queryKey: COMPANY_INVOICE_KEYS.detail(id),
        queryFn: () => companyInvoiceServices.getInvoiceById(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!id,
    });
};

// Update Company Invoice Hook
export const useUpdateCompanyInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            companyInvoiceServices.updateInvoice(id, data),
        onSuccess: (res: any) => {
            toast.success(res.message || "تم تحديث بيانات الفاتورة بنجاح");
            queryClient.invalidateQueries({ queryKey: COMPANY_INVOICE_KEYS.all });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "فشلت عملية التعديل");
        },
    });
};

// Create Company Invoice Hook
export const useCreateCompanyInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => companyInvoiceServices.createInvoice(data),
        onSuccess: (res: any) => {
            toast.success(res.message || "تم إنشاء الفاتورة الضريبية بنجاح");
            queryClient.invalidateQueries({ queryKey: COMPANY_INVOICE_KEYS.all });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "فشلت عملية إنشاء الفاتورة");
        },
    });
};
