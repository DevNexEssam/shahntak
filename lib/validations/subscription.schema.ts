import { z } from "zod";

export const subscriptionStatusEnum = ["active", "expired", "pending_payment", "cancelled"] as const;

export const subscriptionCreateValidationSchema = z.object({
    companyId: z.string({ message: "Company ID is required" }).min(1, "Company ID is required"),
    planId: z.string({ message: "Plan ID is required" }).min(1, "Plan ID is required"),
    startDate: z.coerce.date().default(() => new Date()),
    endDate: z.coerce.date({ message: "Subscription end date is required" }),
    status: z.enum(subscriptionStatusEnum, { message: "Invalid subscription status" }).default("active"),
    autoRenew: z.boolean().default(true),
});

export const subscriptionUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    planId: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(subscriptionStatusEnum, { message: "Invalid subscription status" }).optional(),
    ordersUsedThisMonth: z.number().min(0).optional(),
    shipmentsUsedThisMonth: z.number().min(0).optional(),
    autoRenew: z.boolean().optional(),
});

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateValidationSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateValidationSchema>;
