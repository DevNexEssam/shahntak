import { z } from "zod";

export const userRoleEnum = ["admin", "super"] as const;
export const userStatusEnum = ["active", "inactive"] as const;

export const userCreateValidationSchema = z.object({
    name: z
        .string({ message: "Name is required" })
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must not exceed 50 characters"),
    email: z
        .string({ message: "Email is required" })
        .email("Invalid email address")
        .min(8, "Email must be at least 8 characters")
        .max(70, "Email must not exceed 70 characters"),
    password: z
        .string({ message: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .default("123456"),
    phone: z
        .string({ message: "Phone number is required" })
        .min(3, "Phone number must be at least 3 digits")
        .max(15, "Phone number must not exceed 15 digits"),
    role: z.enum(userRoleEnum, { message: "Invalid user role" }).default("admin"),
    status: z.enum(userStatusEnum, { message: "Invalid user status" }).default("active"),
});

export const userUpdateValidationSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must not exceed 50 characters")
        .optional(),
    email: z
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
    role: z.enum(userRoleEnum, { message: "Invalid user role" }).optional(),
    status: z.enum(userStatusEnum, { message: "Invalid user status" }).optional(),
});

// Type Inference
export type UserCreateInput = z.infer<typeof userCreateValidationSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateValidationSchema>;
