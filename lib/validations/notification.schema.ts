import { z } from "zod";

export const notificationRecipientTypeEnum = ["company_user", "user"] as const;
export const notificationChannelEnum = ["email", "sms", "in_app"] as const;

export const notificationCreateValidationSchema = z.object({
    recipientType: z.enum(notificationRecipientTypeEnum, { message: "Invalid recipient type" }),
    recipientId: z.string({ message: "Recipient ID is required" }).min(1, "Recipient ID is required"),
    channel: z.enum(notificationChannelEnum, { message: "Invalid notification channel" }),
    event: z.string({ message: "Notification event is required" }).min(1, "Notification event is required"),
    title: z
        .string({ message: "Title is required" })
        .min(1, "Title is required")
        .max(100, "Title must not exceed 100 characters"),
    body: z
        .string({ message: "Body is required" })
        .min(1, "Body is required")
        .max(500, "Body must not exceed 500 characters"),
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
