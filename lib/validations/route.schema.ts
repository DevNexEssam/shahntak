import { z } from "zod";

export const routeCreateValidationSchema = z.object({
    companyId: z.string().optional().or(z.literal("")),
    createdBy: z.string().optional().or(z.literal("")),
    origin: z
        .string("نقطة الانطلاق مطلوبة")
        .min(2, "نقطة الانطلاق يجب أن تكون على الأقل حرفين")
        .max(50, "نقطة الانطلاق يجب أن لا تتجاوز 50 حرف"),
    destination: z
        .string("وجهة الوصول مطلوبة")
        .min(2, "وجهة الوصول يجب أن تكون على الأقل حرفين")
        .max(50, "وجهة الوصول يجب أن لا تتجاوز 50 حرف"),
    vehicleType: z.string("نوع المركبة مطلوب").min(1, "نوع المركبة مطلوب"),
    basePrice: z
        .number({ message: "السعر الأساسي مطلوب" })
        .min(0, "السعر الأساسي لا يمكن أن يكون بالسالب"),
    carrierId: z.string().optional().or(z.literal("")),
    estimatedTransitTime: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
});

export const routeUpdateValidationSchema = z.object({
    companyId: z.string().optional().or(z.literal("")),
    createdBy: z.string().optional().or(z.literal("")),
    origin: z
        .string()
        .min(2, "نقطة الانطلاق يجب أن تكون على الأقل حرفين")
        .max(50, "نقطة الانطلاق يجب أن لا تتجاوز 50 حرف")
        .optional(),
    destination: z
        .string()
        .min(2, "وجهة الوصول يجب أن تكون على الأقل حرفين")
        .max(50, "وجهة الوصول يجب أن لا تتجاوز 50 حرف")
        .optional(),
    vehicleType: z.string().optional(),
    basePrice: z.number().min(0).optional(),
    carrierId: z.string().optional().or(z.literal("")),
    estimatedTransitTime: z.string().optional().or(z.literal("")),
    isActive: z.boolean().optional(),
});

// Type Inference
export type RouteCreateInput = z.infer<typeof routeCreateValidationSchema>;
export type RouteUpdateInput = z.infer<typeof routeUpdateValidationSchema>;
