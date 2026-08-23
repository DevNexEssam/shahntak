import { Notification, NotificationResponse, NotificationSingleResponse, NotificationDeleteResponse } from "@/types/data";
import axios from "axios";

export const notificationServices = {
    // Get paginated notifications for recipient
    getNotifications: async (recipientId: string, page: number = 1, limit: number = 10): Promise<NotificationResponse> => {
        const { data } = await axios.get(`/api/admin/notifications?recipientId=${recipientId}&page=${page}&limit=${limit}`);
        return data;
    },

    // Custom Business Logic: Dispatch new notification via channel (email, sms, in_app)
    sendNotification: async (payload: { data: Partial<Notification> }): Promise<NotificationSingleResponse> => {
        const { data } = await axios.post("/api/admin/notifications/new", payload.data);
        return data;
    },

    // Custom Business Logic: Mark notification as read
    markAsRead: async (id: string): Promise<NotificationSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/notifications/${id}/read`);
        return data;
    },

    // Delete notification
    deleteNotification: async ({ id }: { id: string }): Promise<NotificationDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/notifications/${id}`);
        return data;
    },
};
