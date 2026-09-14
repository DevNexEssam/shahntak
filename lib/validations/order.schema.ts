import { z } from "zod";

export const orderStatusEnum = [
    "pending",
    "validated",
    "error",
    "grouped",
    "shipped",
    "delivered",
    "cancelled",
] as const;

export const orderSourceEnum = ["manual", "bulk_upload"] as const;

export const orderCreateValidationSchema = z.object({
    orderNumber: z.string().optional().or(z.literal("")),
    companyId: z.string({ message: "Company ID is required" }).min(1, "Company ID is required"),
    shipmentId: z.string().optional().or(z.literal("")),
    createdByUserId: z.string().optional().or(z.literal("")),
    createdByUserType: z.enum(["user", "company_user"]).optional(),
    recipientName: z
        .string({ message: "Recipient name is required" })
        .min(2, "Recipient name must be at least 2 characters")
        .max(50, "Recipient name must not exceed 50 characters"),
    recipientPhone: z
        .string({ message: "Recipient phone is required" })
        .min(8, "Recipient phone must be at least 8 digits")
        .max(15, "Recipient phone must not exceed 15 digits"),
    recipientCity: z
        .string({ message: "City is required" })
        .min(2, "City must be at least 2 characters")
        .max(50, "City must not exceed 50 characters"),
    recipientDistrict: z
        .string()
        .max(50, "District must not exceed 50 characters")
        .optional()
        .or(z.literal("")),
    recipientAddress: z
        .string({ message: "Recipient address is required" })
        .min(1, "Recipient address is required")
        .max(255, "Address must not exceed 255 characters"),
    description: z
        .string()
        .max(255, "Description must not exceed 255 characters")
        .optional()
        .or(z.literal("")),
    quantity: z
        .number({ message: "Quantity must be a number" })
        .min(1, "Quantity must be at least 1")
        .default(1),
    weight: z
        .number({ message: "Weight is required" })
        .positive("Weight must be a positive number"),
    orderValue: z
        .number({ message: "Order value is required" })
        .min(0, "Order value cannot be negative"),
    codAmount: z
        .number({ message: "COD amount must be a number" })
        .min(0, "COD amount cannot be negative")
        .default(0),
    status: z.enum(orderStatusEnum, { message: "Invalid status" }).default("pending"),
    source: z.enum(orderSourceEnum, { message: "Invalid source" }).default("manual"),
});

export const orderUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    createdByUserId: z.string().optional(),
    shipmentId: z.string().optional().or(z.literal("")),
    recipientName: z
        .string()
        .min(2, "Recipient name must be at least 2 characters")
        .max(50, "Recipient name must not exceed 50 characters")
        .optional(),
    recipientPhone: z
        .string()
        .min(8, "Recipient phone must be at least 8 digits")
        .max(15, "Recipient phone must not exceed 15 digits")
        .optional(),
    recipientCity: z
        .string()
        .min(2, "City must be at least 2 characters")
        .max(50, "City must not exceed 50 characters")
        .optional(),
    recipientDistrict: z
        .string()
        .max(50, "District must not exceed 50 characters")
        .optional()
        .or(z.literal("")),
    recipientAddress: z
        .string()
        .max(255, "Address must not exceed 255 characters")
        .optional(),
    description: z
        .string()
        .max(255, "Description must not exceed 255 characters")
        .optional()
        .or(z.literal("")),
    quantity: z.number().min(1).optional(),
    weight: z.number().positive().optional(),
    orderValue: z.number().min(0).optional(),
    codAmount: z.number().min(0).optional(),
    status: z.enum(orderStatusEnum, { message: "Invalid status" }).optional(),
    source: z.enum(orderSourceEnum, { message: "Invalid source" }).optional(),
});

// Type Inference
export type OrderCreateInput = z.infer<typeof orderCreateValidationSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateValidationSchema>;
