import { z } from "zod";

export const companyUserRoleEnum = ["owner", "manager", "staff"] as const;

export const companyUserCreateValidationSchema = z.object({
    companyId: z
        .string()
        .min(1, "معرف الشركة مطلوب"),
    userName: z
        .string()
        .min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف")
        .max(50, "اسم المستخدم يجب أن لا يتجاوز 50 حرف"),
    userEmail: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .min(8, "البريد الإلكتروني يجب أن يكون على الأقل 8 أحرف")
        .max(70, "البريد الإلكتروني يجب أن لا يتجاوز 70 حرف"),
    password: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف"),
    phone: z
        .string()
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(15, "رقم الهاتف يجب أن لا يتجاوز 15 رقم"),
    userRole: z.enum(companyUserRoleEnum).default("staff"),
    permissions: z.array(z.string()).default([]),
    userIsActive: z.boolean().default(true),
    createdBy: z.string().optional().or(z.literal("")),
});

export const companyUserUpdateValidationSchema = z.object({
    userName: z
        .string()
        .min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف")
        .max(50, "اسم المستخدم يجب أن لا يتجاوز 50 حرف")
        .optional(),
    userEmail: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .optional(),
    password: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
        .optional()
        .or(z.literal("")),
    phone: z
        .string()
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(15, "رقم الهاتف يجب أن لا يتجاوز 15 رقم")
        .optional(),
    userRole: z.enum(companyUserRoleEnum).optional(),
    permissions: z.array(z.string()).optional(),
    userIsActive: z.boolean().optional(),
});

// Type Inference
export type CompanyUserCreateInput = z.infer<typeof companyUserCreateValidationSchema>;
export type CompanyUserUpdateInput = z.infer<typeof companyUserUpdateValidationSchema>;
