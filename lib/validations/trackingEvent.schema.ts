import { z } from "zod";

export const trackingEventCreateValidationSchema = z.object({
    shipmentId: z.string({ message: "Shipment ID is required" }).min(1, "Shipment ID is required"),
    status: z.string({ message: "Tracking status is required" }).min(1, "Tracking status is required"),
    location: z
        .string()
        .max(255, "Location must not exceed 255 characters")
        .optional()
        .or(z.literal("")),
    occurredAt: z.coerce.date().default(() => new Date()),
});

export const trackingEventUpdateValidationSchema = z.object({
    status: z.string().min(1).optional(),
    location: z
        .string()
        .max(255, "Location must not exceed 255 characters")
        .optional()
        .or(z.literal("")),
    occurredAt: z.coerce.date().optional(),
});

// Type Inference
export type TrackingEventCreateInput = z.infer<typeof trackingEventCreateValidationSchema>;
export type TrackingEventUpdateInput = z.infer<typeof trackingEventUpdateValidationSchema>;

