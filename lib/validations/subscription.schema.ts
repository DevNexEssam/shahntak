import { z } from "zod";

export const subscriptionStatusEnum = ["active", "expired", "pending_payment", "cancelled"] as const;

export const subscriptionCreateValidationSchema = z.object({
    companyId: z.string("معرف الشركة مطلوب").min(1, "معرف الشركة مطلوب"),
    planId: z.string("معرف الباقة مطلوب").min(1, "معرف الباقة مطلوب"),
    startDate: z.coerce.date().default(() => new Date()),
    endDate: z.coerce.date({ message: "تاريخ انتهاء الاشتراك مطلوب" }),
    status: z.enum(subscriptionStatusEnum).default("active"),
    autoRenew: z.boolean().default(true),
});

export const subscriptionUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    planId: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(subscriptionStatusEnum).optional(),
    ordersUsedThisMonth: z.number().min(0).optional(),
    shipmentsUsedThisMonth: z.number().min(0).optional(),
    autoRenew: z.boolean().optional(),
});

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateValidationSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateValidationSchema>;
