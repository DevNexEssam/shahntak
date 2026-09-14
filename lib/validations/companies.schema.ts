import { z } from "zod";

export const companyStatusEnum = ["active", "inactive", "archived", "banned"] as const;

export const companyCreateValidationSchema = z.object({
    companyName: z
        .string({ message: "Company name is required" })
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name must not exceed 100 characters"),
    email: z
        .string({ message: "Company email is required" })
        .email("Invalid email address")
        .min(4, "Email must be at least 4 characters")
        .max(70, "Email must not exceed 70 characters"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional()
        .or(z.literal("")),
    phone: z
        .string({ message: "Phone number is required" })
        .min(3, "Phone number must be at least 3 digits")
        .max(20, "Phone number must not exceed 20 digits"),
    city: z
        .string({ message: "City is required" })
        .min(1, "City is required")
        .max(50, "City must not exceed 50 characters"),
    taxNumber: z
        .string()
        .max(50, "Tax number must not exceed 50 characters")
        .optional()
        .or(z.literal("")),
    address: z
        .string()
        .max(255, "Address must not exceed 255 characters")
        .optional()
        .or(z.literal("")),
    facilityInfo: z
        .string()
        .max(500, "Facility information must not exceed 500 characters")
        .optional()
        .or(z.literal("")),
    status: z.enum(companyStatusEnum, { message: "Invalid status: must be active, inactive, archived, or banned" }).default("active"),
    approvedBy: z.string().optional().or(z.literal("")),
    approvedAt: z.coerce.date().optional(),
});

export const updateCompanyValidationSchema = z.object({
    companyName: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name must not exceed 100 characters")
        .optional(),
    email: z
        .string()
        .email("Invalid email address")
        .optional(),
    phone: z
        .string()
        .min(3, "Phone number must be at least 3 digits")
        .max(20, "Phone number must not exceed 20 digits")
        .optional(),
    city: z
        .string()
        .min(1, "City is required")
        .max(50, "City must not exceed 50 characters")
        .optional(),
    taxNumber: z
        .string()
        .max(50, "Tax number must not exceed 50 characters")
        .optional()
        .or(z.literal("")),
    address: z
        .string()
        .max(255, "Address must not exceed 255 characters")
        .optional()
        .or(z.literal("")),
    facilityInfo: z
        .string()
        .max(500, "Facility information must not exceed 500 characters")
        .optional()
        .or(z.literal("")),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional()
        .or(z.literal("")),
    status: z.enum(companyStatusEnum, { message: "Invalid status: must be active, inactive, archived, or banned" }).optional(),
    approvedBy: z.string().optional().or(z.literal("")),
    approvedAt: z.coerce.date().optional(),
});

// Type Inference
export type CompanyCreateInput = z.infer<typeof companyCreateValidationSchema>;
export type CompanyUpdateInput = z.infer<typeof updateCompanyValidationSchema>;


