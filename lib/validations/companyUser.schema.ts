import { z } from "zod";

export const companyUserRoleEnum = ["owner", "manager", "staff"] as const;
export const companyUserStatusEnum = ["active", "inactive"] as const;
export const companyUserTypeEnum = ["user", "company"] as const;

export const companyUserCreateValidationSchema = z.object({
    companyId: z
        .string({ message: "Company ID is required" })
        .min(1, "Company ID is required"),
    userName: z
        .string({ message: "Username is required" })
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must not exceed 50 characters"),
    userEmail: z
        .string({ message: "Email is required" })
        .email("Invalid email address")
        .min(8, "Email must be at least 8 characters")
        .max(70, "Email must not exceed 70 characters"),
    password: z
        .string({ message: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
    phone: z
        .string({ message: "Phone number is required" })
        .min(3, "Phone number must be at least 3 digits")
        .max(15, "Phone number must not exceed 15 digits"),
    userRole: z.enum(companyUserRoleEnum, { message: "Invalid role: must be owner, manager, or staff" }).default("staff"),
    permissions: z.array(z.string()).default([]),
    userStatus: z.enum(companyUserStatusEnum, { message: "Invalid status: must be active or inactive" }).default("active"),
    userIsActive: z.boolean().optional(),
    userType: z.enum(companyUserTypeEnum, { message: "Invalid type: must be user or company" }).default("user"),
    createdBy: z.string().optional().or(z.literal("")),
});

export const companyUserUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    userName: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must not exceed 50 characters")
        .optional(),
    userEmail: z
        .string()
        .email("Invalid email address")
        .optional(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional()
        .or(z.literal("")),
    phone: z
        .string()
        .min(3, "Phone number must be at least 3 digits")
        .max(15, "Phone number must not exceed 15 digits")
        .optional(),
    userRole: z.enum(companyUserRoleEnum, { message: "Invalid role: must be owner, manager, or staff" }).optional(),
    permissions: z.array(z.string()).optional(),
    userStatus: z.enum(companyUserStatusEnum, { message: "Invalid status: must be active or inactive" }).optional(),
    userIsActive: z.boolean().optional(),
    userType: z.enum(companyUserTypeEnum, { message: "Invalid type: must be user or company" }).optional(),
    createdBy: z.string().optional().or(z.literal("")),
});

// Type Inference
export type CompanyUserCreateInput = z.infer<typeof companyUserCreateValidationSchema>;
export type CompanyUserUpdateInput = z.infer<typeof companyUserUpdateValidationSchema>;
