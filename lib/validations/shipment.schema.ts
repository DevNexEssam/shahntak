import { z } from "zod";

export const shipmentTypeEnum = ["ftl", "ltl", "local_delivery"] as const;

export const shipmentStatusEnum = [
    "created",
    "confirmed",
    "assigned",
    "ready_for_pickup",
    "picked_up",
    "in_transit",
    "arrived",
    "out_for_delivery",
    "delivered",
    "delivery_failed",
    "cancelled",
    "returned",
    "exception",
] as const;

export const shipmentCreateValidationSchema = z.object({
    shipmentNumber: z.string("رقم الشحنة مطلوب").min(1, "رقم الشحنة مطلوب"),
    companyId: z.string("معرف الشركة مطلوب").min(1, "معرف الشركة مطلوب"),
    type: z.enum(shipmentTypeEnum).default("ftl"),
    origin: z.string("نقطة انطلاق الشحنة مطلوبة").min(1, "نقطة انطلاق الشحنة مطلوبة"),
    destination: z.string("وجهة الشحنة مطلوبة").min(1, "وجهة الشحنة مطلوبة"),
    routeId: z.string().optional().or(z.literal("")),
    carrierId: z.string().optional().or(z.literal("")),
    vehicleId: z.string().optional().or(z.literal("")),
    invoiceId: z.string().optional().or(z.literal("")),
    ordersCount: z.number().min(0).default(0),
    shippingCost: z
        .number({ message: "تكلفة الشحن مطلوبة" })
        .min(0, "التكلفة لا يمكن أن تكون بالسالب"),
    customerPrice: z
        .number({ message: "السعر للعميل مطلوب" })
        .min(0, "السعر لا يمكن أن يكون بالسالب"),
    waybillNumber: z.string().optional().or(z.literal("")),
    trackingNumber: z.string().optional().or(z.literal("")),
    status: z.enum(shipmentStatusEnum).default("created"),
    orderIds: z.array(z.string()).optional(),
});

export const shipmentUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    type: z.enum(shipmentTypeEnum).optional(),
    origin: z.string().min(1).optional(),
    destination: z.string().min(1).optional(),
    routeId: z.string().optional().or(z.literal("")),
    carrierId: z.string().optional().or(z.literal("")),
    vehicleId: z.string().optional().or(z.literal("")),
    invoiceId: z.string().optional().or(z.literal("")),
    ordersCount: z.number().min(0).optional(),
    shippingCost: z.number().min(0).optional(),
    customerPrice: z.number().min(0).optional(),
    waybillNumber: z.string().optional().or(z.literal("")),
    trackingNumber: z.string().optional().or(z.literal("")),
    status: z.enum(shipmentStatusEnum).optional(),
});

// Type Inference
export type ShipmentCreateInput = z.infer<typeof shipmentCreateValidationSchema>;
export type ShipmentUpdateInput = z.infer<typeof shipmentUpdateValidationSchema>;
