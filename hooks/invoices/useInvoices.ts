import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { invoiceServices } from "@/services/invoices/invoiceServices";
import { Invoice } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const invoiceKeys = {
    all: ["invoices"] as const,
    lists: () => [...invoiceKeys.all, "list"] as const,
    list: (page: number, limit: number, search: string = "", status: string = "all") =>
        [...invoiceKeys.lists(), { page, limit, search, status }] as const,
    allList: () => [...invoiceKeys.all, "all-list"] as const,
    details: () => [...invoiceKeys.all, "detail"] as const,
    detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

// Queries
export const useInvoices = (page: number = 1, limit: number = 10, search: string = "", status: string = "all") => {
    return useQuery({
        queryKey: invoiceKeys.list(page, limit, search, status),
        queryFn: () => invoiceServices.getInvoices(page, limit, search, status),
        placeholderData: keepPreviousData,
    });
};

export const useAllInvoices = () => {
    return useQuery({
        queryKey: invoiceKeys.allList(),
        queryFn: () => invoiceServices.getAllInvoices(),
    });
};

export const useInvoice = (id: string) => {
    return useQuery({
        queryKey: invoiceKeys.detail(id),
        queryFn: () => invoiceServices.getInvoiceById(id),
        enabled: !!id,
    });
};

// Mutations
export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Invoice>) => invoiceServices.createInvoice({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
            toast.success(res.message || "تم إنشاء الفاتورة اللوجستية بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إنشاء الفاتورة");
        },
    });
};

export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; updates: Partial<Invoice> }) => invoiceServices.updateInvoice(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث بيانات الفاتورة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الفاتورة");
        },
    });
};

export const useUpdateInvoiceStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; status: Invoice["status"] }) => invoiceServices.updateInvoiceStatus(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
            toast.success(res.message || "تم تحديث حالة الفاتورة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث حالة الفاتورة");
        },
    });
};

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; hard?: boolean }) => invoiceServices.deleteInvoice(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
            toast.success(res.message || "تم حذف الفاتورة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الفاتورة");
        },
    });
};
