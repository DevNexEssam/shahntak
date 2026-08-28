import { z } from "zod";

export const invoiceStatusEnum = [
    "draft",
    "issued",
    "paid",
    "overdue",
    "cancelled",
] as const;

export const invoiceCreateValidationSchema = z.object({
    invoiceNumber: z.string().optional().or(z.literal("")),
    companyId: z.string("معرف الشركة مطلوب").min(1, "معرف الشركة مطلوب"),
    total: z
        .number({ message: "إجمالي الفاتورة مطلوب" })
        .min(0, "الإجمالي لا يمكن أن يكون بالسالب"),
    status: z.enum(invoiceStatusEnum).default("draft"),
    dueDate: z.coerce.date().optional(),
});

export const invoiceUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    total: z.number().min(0).optional(),
    status: z.enum(invoiceStatusEnum).optional(),
    dueDate: z.coerce.date().optional(),
});

// Type Inference
export type InvoiceCreateInput = z.infer<typeof invoiceCreateValidationSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateValidationSchema>;
