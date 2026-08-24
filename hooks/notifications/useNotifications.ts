import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { notificationServices } from "@/services/notifications/notificationServices";
import { Notification } from "@/types/data";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const notificationKeys = {
    all: ["notifications"] as const,
    recipientLists: (recipientId: string) => [...notificationKeys.all, "recipient", recipientId] as const,
    recipientList: (recipientId: string, page: number, limit: number) =>
        [...notificationKeys.recipientLists(recipientId), { page, limit }] as const,
};

// Queries
export const useNotifications = (recipientId: string, page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: notificationKeys.recipientList(recipientId, page, limit),
        queryFn: () => notificationServices.getNotifications(recipientId, page, limit),
        enabled: !!recipientId,
        placeholderData: keepPreviousData,
    });
};

// Mutations
export const useSendNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Notification>) => notificationServices.sendNotification({ data }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success(res.message || "تم إرسال الإشعار والتنبيه بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إرسال الإشعار");
        },
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationServices.markAsRead(id),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success(res.message || "تم تحديث الإشعار كمقروء");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث حالة الإشعار");
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string }) => notificationServices.deleteNotification(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success(res.message || "تم حذف الإشعار بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الإشعار");
        },
    });
};
