import { z } from "zod";

export const waybillCreateValidationSchema = z.object({
    shipmentId: z.string({ message: "Shipment ID is required" }).min(1, "Shipment ID is required"),
    waybillNumber: z.string({ message: "Waybill number is required" }).min(1, "Waybill number is required"),
    pdfUrl: z.string({ message: "PDF URL is required" }).url("PDF URL must be a valid URL"),
    issuedAt: z.coerce.date().default(() => new Date()),
});

export const waybillUpdateValidationSchema = z.object({
    pdfUrl: z.string().url("PDF URL must be a valid URL").optional(),
    issuedAt: z.coerce.date().optional(),
});

// Type Inference
export type WaybillCreateInput = z.infer<typeof waybillCreateValidationSchema>;
export type WaybillUpdateInput = z.infer<typeof waybillUpdateValidationSchema>;

