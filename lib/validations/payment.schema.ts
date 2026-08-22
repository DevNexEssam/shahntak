import { z } from "zod";

export const paymentMethodEnum = ["bank_transfer", "card", "cash", "other"] as const;

export const paymentCreateValidationSchema = z.object({
    invoiceId: z.string().min(1, "معرف الفاتورة مطلوب"),
    amount: z
        .number({ message: "المبلغ يجب أن يكون رقماً" })
        .positive("المبلغ يجب أن يكون رقماً موجباً"),
    method: z.enum(paymentMethodEnum, { message: "طريقة الدفع غير صحيحة" }),
    paidAt: z.coerce.date().default(() => new Date()),
});

export const paymentUpdateValidationSchema = z.object({
    amount: z.number().positive().optional(),
    method: z.enum(paymentMethodEnum).optional(),
    paidAt: z.coerce.date().optional(),
});

// Type Inference
export type PaymentCreateInput = z.infer<typeof paymentCreateValidationSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateValidationSchema>;
