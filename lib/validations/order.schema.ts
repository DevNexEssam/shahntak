import { z } from "zod";

export const orderStatusEnum = [
    "pending",
    "validated",
    "error",
    "grouped",
    "shipped",
    "delivered",
    "cancelled",
] as const;

export const orderSourceEnum = ["manual", "bulk_upload"] as const;

export const orderCreateValidationSchema = z.object({
    orderNumber: z.string().optional().or(z.literal("")),
    companyId: z.string("معرف الشركة مطلوب").min(1, "معرف الشركة مطلوب"),
    shipmentId: z.string().optional().or(z.literal("")),
    createdByUserId: z.string().optional().or(z.literal("")),
    createdByUserType: z.enum(["user", "company_user"]).optional(),
    recipientName: z
        .string("اسم المستلم مطلوب")
        .min(2, "اسم المستلم يجب أن يكون على الأقل حرفين")
        .max(50, "اسم المستلم يجب أن لا يتجاوز 50 حرف"),
    recipientPhone: z
        .string("رقم هاتف المستلم مطلوب")
        .min(8, "رقم هاتف المستلم يجب أن يكون على الأقل 8 أرقام")
        .max(15, "رقم هاتف المستلم يجب أن لا يتجاوز 15 رقم"),
    recipientCity: z
        .string("المدينة مطلوبة")
        .min(2, "المدينة يجب أن تكون على الأقل حرفين")
        .max(50, "المدينة يجب أن لا تتجاوز 50 حرف"),
    recipientDistrict: z
        .string()
        .max(50, "الحي يجب أن لا يتجاوز 50 حرف")
        .optional()
        .or(z.literal("")),
    recipientAddress: z
        .string("عنوان المستلم مطلوب")
        .min(1, "عنوان المستلم مطلوب")
        .max(255, "العنوان يجب أن لا يتجاوز 255 حرف"),
    description: z
        .string()
        .max(255, "الوصف يجب أن لا يتجاوز 255 حرف")
        .optional()
        .or(z.literal("")),
    quantity: z
        .number({ message: "الكمية يجب أن تكون رقماً" })
        .min(1, "الكمية يجب أن تكون 1 على الأقل")
        .default(1),
    weight: z
        .number({ message: "الوزن مطلوب" })
        .positive("الوزن يجب أن يكون رقماً موجباً"),
    orderValue: z
        .number({ message: "قيمة الطلب مطلوبة" })
        .min(0, "قيمة الطلب لا يمكن أن تكون بالسالب"),
    codAmount: z
        .number({ message: "مبلغ الدفع عند الاستلام يجب أن يكون رقماً" })
        .min(0, "المبلغ لا يمكن أن يكون بالسالب")
        .default(0),
    status: z.enum(orderStatusEnum, "الحالة المحددة غير صحيحة").default("pending"),
    source: z.enum(orderSourceEnum, "المصدر المحدد غير صحيح").default("manual"),
});

export const orderUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    createdByUserId: z.string().optional(),
    shipmentId: z.string().optional().or(z.literal("")),
    recipientName: z
        .string()
        .min(2, "اسم المستلم يجب أن يكون على الأقل حرفين")
        .max(50, "اسم المستلم يجب أن لا يتجاوز 50 حرف")
        .optional(),
    recipientPhone: z
        .string()
        .min(8, "رقم هاتف المستلم يجب أن يكون على الأقل 8 أرقام")
        .max(15, "رقم هاتف المستلم يجب أن لا يتجاوز 15 رقم")
        .optional(),
    recipientCity: z
        .string()
        .min(2, "المدينة يجب أن تكون على الأقل حرفين")
        .max(50, "المدينة يجب أن لا تتجاوز 50 حرف")
        .optional(),
    recipientDistrict: z
        .string()
        .max(50, "الحي يجب أن لا يتجاوز 50 حرف")
        .optional()
        .or(z.literal("")),
    recipientAddress: z
        .string()
        .max(255, "العنوان يجب أن لا يتجاوز 255 حرف")
        .optional(),
    description: z
        .string()
        .max(255, "الوصف يجب أن لا يتجاوز 255 حرف")
        .optional()
        .or(z.literal("")),
    quantity: z.number().min(1).optional(),
    weight: z.number().positive().optional(),
    orderValue: z.number().min(0).optional(),
    codAmount: z.number().min(0).optional(),
    status: z.enum(orderStatusEnum, "الحالة المحددة غير صحيحة").optional(),
    source: z.enum(orderSourceEnum, "المصدر المحدد غير صحيح").optional(),
});

// Type Inference
export type OrderCreateInput = z.infer<typeof orderCreateValidationSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateValidationSchema>;
