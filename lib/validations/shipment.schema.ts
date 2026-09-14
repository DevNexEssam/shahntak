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
    shipmentNumber: z.string({ message: "Shipment number is required" }).min(1, "Shipment number is required"),
    companyId: z.string({ message: "Company ID is required" }).min(1, "Company ID is required"),
    type: z.enum(shipmentTypeEnum, { message: "Invalid shipment type" }).default("ftl"),
    origin: z.string({ message: "Shipment origin is required" }).min(1, "Shipment origin is required"),
    destination: z.string({ message: "Shipment destination is required" }).min(1, "Shipment destination is required"),
    routeId: z.string().optional().or(z.literal("")),
    carrierId: z.string().optional().or(z.literal("")),
    vehicleId: z.string().optional().or(z.literal("")),
    invoiceId: z.string().optional().or(z.literal("")),
    ordersCount: z.number().min(0).default(0),
    shippingCost: z
        .number({ message: "Shipping cost is required" })
        .min(0, "Cost cannot be negative")
        .default(0),
    customerPrice: z
        .number({ message: "Customer price is required" })
        .min(0, "Price cannot be negative")
        .default(0),
    waybillNumber: z.string().optional().or(z.literal("")),
    trackingNumber: z.string().optional().or(z.literal("")),
    status: z.enum(shipmentStatusEnum, { message: "Invalid shipment status" }).default("created"),
    orderIds: z.array(z.string()).optional(),
});

export const shipmentUpdateValidationSchema = z.object({
    companyId: z.string().optional(),
    type: z.enum(shipmentTypeEnum, { message: "Invalid shipment type" }).optional(),
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
    status: z.enum(shipmentStatusEnum, { message: "Invalid shipment status" }).optional(),
});

// Type Inference
export type ShipmentCreateInput = z.infer<typeof shipmentCreateValidationSchema>;
export type ShipmentUpdateInput = z.infer<typeof shipmentUpdateValidationSchema>;

