/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyInvoiceServices } from "@/services/company/CompanyInvoiceServices";
import toast from "react-hot-toast";

// Object as const pattern for Query Keys
export const COMPANY_INVOICE_KEYS = {
    all: ["companyInvoices"] as const,
    lists: () => [...COMPANY_INVOICE_KEYS.all, "list"] as const,
    list: (page: number, limit: number, search: string) =>
        [...COMPANY_INVOICE_KEYS.lists(), { page, limit, search }] as const,
    details: () => [...COMPANY_INVOICE_KEYS.all, "detail"] as const,
    detail: (id: string) => [...COMPANY_INVOICE_KEYS.details(), id] as const,
} as const;

// Fetch Company Invoices Hook (Supports Pagination and Search)
export const useCompanyInvoices = (page: number = 1, limit: number = 10, search: string = "") => {
    return useQuery({
        queryKey: COMPANY_INVOICE_KEYS.list(page, limit, search),
        queryFn: () => companyInvoiceServices.getInvoices(page, limit, search),
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
