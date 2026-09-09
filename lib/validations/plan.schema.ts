import { z } from "zod";

export const billingCycleEnum = ["monthly", "yearly"] as const;

export const planCreateValidationSchema = z.object({
    name: z.string("اسم الباقة مطلوب").min(2, "اسم الباقة يجب أن يكون على الأقل حرفين").max(100, "اسم الباقة يجب أن لا يتجاوز 100 حرف"),
    description: z.string().optional().or(z.literal("")),
    price: z
        .number({ message: "سعر الباقة مطلوب" })
        .min(0, "السعر لا يمكن أن يكون بالسالب"),
    billingCycle: z.enum(billingCycleEnum, "دورة الفوترة غير صحيحة").default("monthly"),
    maxOrdersPerMonth: z
        .number({ message: "حد الطلبات الشهرية مطلوب" })
        .min(-1, "الحد الأدنى هو -1 (غير محدود)"),
    maxShipmentsPerMonth: z
        .number({ message: "حد الشحنات الشهرية مطلوب" })
        .min(-1, "الحد الأدنى هو -1 (غير محدود)"),
    maxCompanyUsers: z
        .number({ message: "حد الموظفين مطلوب" })
        .min(1, "يجب السماح بموظف واحد على الأقل"),
    features: z.array(z.string()).default([]),
    // Checkbox Feature Flags
    hasWaybillPdfExport: z.boolean().default(true),
    hasBulkExcelImport: z.boolean().default(true),
    hasZatcaInvoicing: z.boolean().default(true),
    hasExpensesTracking: z.boolean().default(true),
    hasCustomRoutes: z.boolean().default(true),
    hasAdvancedAnalytics: z.boolean().default(true),
    hasAuditLogs: z.boolean().default(true),
    isActive: z.boolean().default(true),
});

export const planUpdateValidationSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional().or(z.literal("")),
    price: z.number().min(0).optional(),
    billingCycle: z.enum(billingCycleEnum , "دورة الفوترة غير صحيحة").optional(),
    maxOrdersPerMonth: z.number().min(-1).optional(),
    maxShipmentsPerMonth: z.number().min(-1).optional(),
    maxCompanyUsers: z.number().min(1).optional(),
    features: z.array(z.string()).optional(),
    // Checkbox Feature Flags
    hasWaybillPdfExport: z.boolean().optional(),
    hasBulkExcelImport: z.boolean().optional(),
    hasZatcaInvoicing: z.boolean().optional(),
    hasExpensesTracking: z.boolean().optional(),
    hasCustomRoutes: z.boolean().optional(),
    hasAdvancedAnalytics: z.boolean().optional(),
    hasAuditLogs: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export type PlanCreateInput = z.infer<typeof planCreateValidationSchema>;
export type PlanUpdateInput = z.infer<typeof planUpdateValidationSchema>;
