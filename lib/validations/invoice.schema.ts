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
    companyId: z.string({ message: "Company ID is required" }).min(1, "Company ID is required"),
    total: z
        .number({ message: "Invoice total is required" })
        .min(0, "Total cannot be negative"),
    discount: z.number().min(0, "Discount amount cannot be negative").optional().default(0),
    subtotal: z.number().min(0).optional(),
    vatAmount: z.number().min(0).optional(),
    status: z.enum(invoiceStatusEnum, { message: "Invalid invoice status" }).default("draft"),
    dueDate: z.coerce.date().optional(),
});

export const invoiceUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    total: z.number().min(0).optional(),
    discount: z.number().min(0, "Discount amount cannot be negative").optional(),
    subtotal: z.number().min(0).optional(),
    vatAmount: z.number().min(0).optional(),
    status: z.enum(invoiceStatusEnum, { message: "Invalid invoice status" }).optional(),
    dueDate: z.coerce.date().optional(),
});

// Type Inference
export type InvoiceCreateInput = z.infer<typeof invoiceCreateValidationSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateValidationSchema>;
