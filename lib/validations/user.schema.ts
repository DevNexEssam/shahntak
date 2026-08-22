import { z } from "zod";

export const userRoleEnum = ["admin", "super"] as const;
export const userStatusEnum = ["active", "inactive"] as const;

export const userCreateValidationSchema = z.object({
    name: z
        .string()
        .min(3, "الاسم يجب أن يكون على الأقل 3 أحرف")
        .max(50, "الاسم يجب أن لا يتجاوز 50 حرف"),
    email: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .min(8, "البريد الإلكتروني يجب أن يكون على الأقل 8 أحرف")
        .max(70, "البريد الإلكتروني يجب أن لا يتجاوز 70 حرف"),
    password: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
        .default("123456"),
    phone: z
        .string("رقم الهاتف مطلوب")
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(15, "رقم الهاتف يجب أن لا يتجاوز 15 رقم"),
    role: z.enum(userRoleEnum).default("admin"),
    status: z.enum(userStatusEnum).default("active"),
});

export const userUpdateValidationSchema = z.object({
    name: z
        .string()
        .min(3, "الاسم يجب أن يكون على الأقل 3 أحرف")
        .max(50, "الاسم يجب أن لا يتجاوز 50 حرف")
        .optional(),
    email: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .optional(),
    password: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
        .optional()
        .or(z.literal("")),
    phone: z
        .string("رقم الهاتف مطلوب")
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(15, "رقم الهاتف يجب أن لا يتجاوز 15 رقم")
        .optional(),
    role: z.enum(userRoleEnum).optional(),
    status: z.enum(userStatusEnum).optional(),
});

// Type Inference
export type UserCreateInput = z.infer<typeof userCreateValidationSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateValidationSchema>;
