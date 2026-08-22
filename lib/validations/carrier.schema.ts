import { z } from "zod";

export const carrierTypeEnum = ["local", "external_api"] as const;

export const carrierCreateValidationSchema = z.object({
    name: z
        .string()
        .min(2, "اسم الناقل يجب أن يكون على الأقل حرفين")
        .max(50, "اسم الناقل يجب أن لا يتجاوز 50 حرف"),
    type: z.enum(carrierTypeEnum).default("local"),
    contactPhone: z
        .string()
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(15, "رقم الهاتف يجب أن لا يتجاوز 15 رقم")
        .optional()
        .or(z.literal("")),
    contactEmail: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .min(8, "البريد الإلكتروني يجب أن يكون على الأقل 8 أحرف")
        .max(70, "البريد الإلكتروني يجب أن لا يتجاوز 70 حرف")
        .optional()
        .or(z.literal("")),
    isActive: z.boolean().default(true),
});

export const carrierUpdateValidationSchema = z.object({
    name: z
        .string()
        .min(2, "اسم الناقل يجب أن يكون على الأقل حرفين")
        .max(50, "اسم الناقل يجب أن لا يتجاوز 50 حرف")
        .optional(),
    type: z.enum(carrierTypeEnum).optional(),
    contactPhone: z
        .string()
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(15, "رقم الهاتف يجب أن لا يتجاوز 15 رقم")
        .optional()
        .or(z.literal("")),
    contactEmail: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .optional()
        .or(z.literal("")),
    isActive: z.boolean().optional(),
});

// Type Inference
export type CarrierCreateInput = z.infer<typeof carrierCreateValidationSchema>;
export type CarrierUpdateInput = z.infer<typeof carrierUpdateValidationSchema>;
