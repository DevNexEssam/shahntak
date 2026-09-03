import { z } from "zod";

export const companyUserRoleEnum = ["owner", "manager", "staff"] as const;
export const companyUserStatusEnum = ["active", "inactive"] as const;
export const companyUserTypeEnum = ["user", "company"] as const;

export const companyUserCreateValidationSchema = z.object({
    companyId: z
        .string("معرف الشركة مطلوب")
        .min(1, "معرف الشركة مطلوب"),
    userName: z
        .string("اسم المستخدم مطلوب")
        .min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف")
        .max(50, "اسم المستخدم يجب أن لا يتجاوز 50 حرف"),
    userEmail: z
        .string("البريد الإلكتروني مطلوب")
        .email("البريد الإلكتروني غير صحيح")
        .min(8, "البريد الإلكتروني يجب أن يكون على الأقل 8 أحرف")
        .max(70, "البريد الإلكتروني يجب أن لا يتجاوز 70 حرف"),
    password: z
        .string("كلمة المرور مطلوبة")
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف"),
    phone: z
        .string("رقم الهاتف مطلوب")
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(15, "رقم الهاتف يجب أن لا يتجاوز 15 رقم"),
    userRole: z.enum(companyUserRoleEnum, "الدور المحدد غير صالح، يجب أن يكون owner أو manager أو staff").default("staff"),
    permissions: z.array(z.string()).default([]),
    userStatus: z.enum(companyUserStatusEnum, "الحالة المحددة غير صالحة، يجب أن تكون active أو inactive").default("active"),
    userIsActive: z.boolean().optional(),
    userType: z.enum(companyUserTypeEnum, "النوع المحدد غير صالح، يجب أن يكون user أو company").default("user"),
    createdBy: z.string().optional().or(z.literal("")),
});

export const companyUserUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
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
    userRole: z.enum(companyUserRoleEnum, "الدور المحدد غير صالح، يجب أن يكون owner أو manager أو staff").optional(),
    permissions: z.array(z.string()).optional(),
    userStatus: z.enum(companyUserStatusEnum, "الحالة المحددة غير صالحة، يجب أن تكون active أو inactive").optional(),
    userIsActive: z.boolean().optional(),
    userType: z.enum(companyUserTypeEnum, "النوع المحدد غير صالح، يجب أن يكون user أو company").optional(),
    createdBy: z.string().optional().or(z.literal("")),
});

// Type Inference
export type CompanyUserCreateInput = z.infer<typeof companyUserCreateValidationSchema>;
export type CompanyUserUpdateInput = z.infer<typeof companyUserUpdateValidationSchema>;
