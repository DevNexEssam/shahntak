import { z } from "zod";

export const trackingEventCreateValidationSchema = z.object({
    shipmentId: z.string().min(1, "معرف الشحنة مطلوب"),
    status: z.string().min(1, "حالة التتبع مطلوبة"),
    location: z
        .string()
        .max(255, "الموقع يجب أن لا يتجاوز 255 حرف")
        .optional()
        .or(z.literal("")),
    occurredAt: z.coerce.date().default(() => new Date()),
});

export const trackingEventUpdateValidationSchema = z.object({
    status: z.string().min(1).optional(),
    location: z
        .string()
        .max(255, "الموقع يجب أن لا يتجاوز 255 حرف")
        .optional()
        .or(z.literal("")),
    occurredAt: z.coerce.date().optional(),
});

// Type Inference
export type TrackingEventCreateInput = z.infer<typeof trackingEventCreateValidationSchema>;
export type TrackingEventUpdateInput = z.infer<typeof trackingEventUpdateValidationSchema>;
