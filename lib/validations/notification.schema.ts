import { z } from "zod";

export const notificationRecipientTypeEnum = ["company_user", "user"] as const;
export const notificationChannelEnum = ["email", "sms", "in_app"] as const;

export const notificationCreateValidationSchema = z.object({
    recipientType: z.enum(notificationRecipientTypeEnum, "نوع المستلم غير صحيح"),
    recipientId: z.string("معرف المستلم مطلوب").min(1, "معرف المستلم مطلوب"),
    channel: z.enum(notificationChannelEnum, "قناة الإشعار غير صحيحة"),
    event: z.string("حدث الإشعار مطلوب").min(1, "حدث الإشعار مطلوب"),
    title: z
        .string("عنوان الإشعار مطلوب")
        .min(1, "عنوان الإشعار مطلوب")
        .max(100, "العنوان يجب أن لا يتجاوز 100 حرف"),
    body: z
        .string("نص الإشعار مطلوب")
        .min(1, "نص الإشعار مطلوب")
        .max(500, "النص يجب أن لا يتجاوز 500 حرف"),
    isRead: z.boolean().default(false),
    sentAt: z.coerce.date().optional(),
});

export const notificationUpdateValidationSchema = z.object({
    isRead: z.boolean().optional(),
    sentAt: z.coerce.date().optional(),
});

// Type Inference
export type NotificationCreateInput = z.infer<typeof notificationCreateValidationSchema>;
export type NotificationUpdateInput = z.infer<typeof notificationUpdateValidationSchema>;
