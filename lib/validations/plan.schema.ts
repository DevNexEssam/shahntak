import { z } from "zod";

export const billingCycleEnum = ["monthly", "yearly"] as const;

export const planCreateValidationSchema = z.object({
    name: z.string({ message: "Plan name is required" }).min(2, "Plan name must be at least 2 characters").max(100, "Plan name must not exceed 100 characters"),
    description: z.string().optional().or(z.literal("")),
    price: z
        .number({ message: "Plan price is required" })
        .min(0, "Price cannot be negative"),
    billingCycle: z.enum(billingCycleEnum, { message: "Invalid billing cycle" }).default("monthly"),
    maxOrdersPerMonth: z
        .number({ message: "Monthly orders limit is required" })
        .min(-1, "Minimum is -1 (unlimited)"),
    maxShipmentsPerMonth: z
        .number({ message: "Monthly shipments limit is required" })
        .min(-1, "Minimum is -1 (unlimited)"),
    maxCompanyUsers: z
        .number({ message: "Employee limit is required" })
        .min(1, "Must allow at least 1 employee"),
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
    billingCycle: z.enum(billingCycleEnum, { message: "Invalid billing cycle" }).optional(),
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
