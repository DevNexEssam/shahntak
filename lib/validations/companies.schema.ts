import { z } from "zod";

export const companyStatusEnum = ["active", "inactive", "archived", "banned"] as const;

export const companyCreateValidationSchema = z.object({
    companyName: z
        .string("اسم الشركة مطلوب")
        .min(3, "الاسم يجب أن يكون على الأقل 3 أحرف")
        .max(100, "الاسم يجب أن لا يتجاوز 100 حرف"),
    email: z
        .string("ايميل الشركة مطلوب")
        .email("البريد الإلكتروني غير صحيح")
        .min(4, "البريد الإلكتروني يجب أن يكون على الأقل 4 أحرف")
        .max(70, "البريد الإلكتروني يجب أن لا يتجاوز 70 حرف"),
    password: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
        .optional()
        .or(z.literal("")),
    phone: z
        .string("رقم الهاتف مطلوب")
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(20, "رقم الهاتف يجب أن لا يتجاوز 20 رقم"),
    city: z
        .string("المدينة مطلوبة")
        .min(1, "المدينة مطلوبة")
        .max(50, "المدينة يجب أن لا تتجاوز 50 حرف"),
    taxNumber: z
        .string()
        .max(50, "رقم الضريبة يجب أن لا يتجاوز 50 حرف")
        .optional()
        .or(z.literal("")),
    address: z
        .string()
        .max(255, "العنوان يجب أن لا يتجاوز 255 حرف")
        .optional()
        .or(z.literal("")),
    facilityInfo: z
        .string()
        .max(500, "معلومات المنشأة يجب أن لا تتجاوز 500 حرف")
        .optional()
        .or(z.literal("")),
    status: z.enum(companyStatusEnum).default("active"),
    approvedBy: z.string().optional().or(z.literal("")),
    approvedAt: z.coerce.date().optional(),
});

export const updateCompanyValidationSchema = z.object({
    companyName: z
        .string()
        .min(3, "الاسم يجب أن يكون على الأقل 3 أحرف")
        .max(100, "الاسم يجب أن لا يتجاوز 100 حرف")
        .optional(),
    email: z
        .string()
        .email("البريد الإلكتروني غير صحيح")
        .optional(),
    phone: z
        .string()
        .min(3, "رقم الهاتف يجب أن يكون على الأقل 3 أرقام")
        .max(20, "رقم الهاتف يجب أن لا يتجاوز 20 رقم")
        .optional(),
    city: z
        .string()
        .min(1, "المدينة مطلوبة")
        .max(50, "المدينة يجب أن لا تتجاوز 50 حرف")
        .optional(),
    taxNumber: z
        .string()
        .max(50, "رقم الضريبة يجب أن لا يتجاوز 50 حرف")
        .optional()
        .or(z.literal("")),
    address: z
        .string()
        .max(255, "العنوان يجب أن لا يتجاوز 255 حرف")
        .optional()
        .or(z.literal("")),
    facilityInfo: z
        .string()
        .max(500, "معلومات المنشأة يجب أن لا تتجاوز 500 حرف")
        .optional()
        .or(z.literal("")),
    password: z
        .string()
        .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
        .optional()
        .or(z.literal("")),
    status: z.enum(companyStatusEnum).optional(),
    approvedBy: z.string().optional().or(z.literal("")),
    approvedAt: z.coerce.date().optional(),
});

// Type Inference
export type CompanyCreateInput = z.infer<typeof companyCreateValidationSchema>;
export type CompanyUpdateInput = z.infer<typeof updateCompanyValidationSchema>;

