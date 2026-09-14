import { z } from "zod";

export const carrierTypeEnum = ["local", "external_api"] as const;

export const carrierCreateValidationSchema = z.object({
    name: z
        .string({ message: "Carrier name is required" })
        .min(2, "Carrier name must be at least 2 characters")
        .max(50, "Carrier name must not exceed 50 characters"),
    type: z.enum(carrierTypeEnum, { message: "Invalid carrier type" }).default("local"),
    contactPhone: z
        .string()
        .min(3, "Phone number must be at least 3 digits")
        .max(15, "Phone number must not exceed 15 digits")
        .optional()
        .or(z.literal("")),
    contactEmail: z
        .string()
        .email("Invalid email address")
        .min(8, "Email must be at least 8 characters")
        .max(70, "Email must not exceed 70 characters")
        .optional()
        .or(z.literal("")),
    isActive: z.boolean().default(true),
});

export const carrierUpdateValidationSchema = z.object({
    name: z
        .string()
        .min(2, "Carrier name must be at least 2 characters")
        .max(50, "Carrier name must not exceed 50 characters")
        .optional(),
    type: z.enum(carrierTypeEnum, { message: "Invalid carrier type" }).optional(),
    contactPhone: z
        .string()
        .min(3, "Phone number must be at least 3 digits")
        .max(15, "Phone number must not exceed 15 digits")
        .optional()
        .or(z.literal("")),
    contactEmail: z
        .string()
        .email("Invalid email address")
        .optional()
        .or(z.literal("")),
    isActive: z.boolean().optional(),
});

// Type Inference
export type CarrierCreateInput = z.infer<typeof carrierCreateValidationSchema>;
export type CarrierUpdateInput = z.infer<typeof carrierUpdateValidationSchema>;
