import { z } from "zod";

export const paymentMethodEnum = ["bank_transfer", "card", "cash", "other"] as const;

export const paymentCreateValidationSchema = z.object({
    invoiceId: z.string({ message: "Invoice ID is required" }).min(1, "Invoice ID is required"),
    amount: z
        .number({ message: "Payment amount is required" })
        .positive("Amount must be a positive number"),
    method: z.enum(paymentMethodEnum, { message: "Invalid payment method" }),
    paidAt: z.coerce.date().default(() => new Date()),
});

export const paymentUpdateValidationSchema = z.object({
    amount: z.number().positive().optional(),
    method: z.enum(paymentMethodEnum, { message: "Invalid payment method" }).optional(),
    paidAt: z.coerce.date().optional(),
});

// Type Inference
export type PaymentCreateInput = z.infer<typeof paymentCreateValidationSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateValidationSchema>;
