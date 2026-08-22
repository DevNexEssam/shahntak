import { z } from "zod";

export const waybillCreateValidationSchema = z.object({
    shipmentId: z.string("معرف الشحنة مطلوب").min(1, "معرف الشحنة مطلوب"),
    waybillNumber: z.string("رقم بوليصة الشحن مطلوب").min(1, "رقم بوليصة الشحن مطلوب"),
    pdfUrl: z.string("رابط البوليصة مطلوب").url("رابط البوليصة يجب أن يكون رابطاً صحيحاً"),
    issuedAt: z.coerce.date().default(() => new Date()),
});

export const waybillUpdateValidationSchema = z.object({
    pdfUrl: z.string().url("رابط البوليصة يجب أن يكون رابطاً صحيحاً").optional(),
    issuedAt: z.coerce.date().optional(),
});

// Type Inference
export type WaybillCreateInput = z.infer<typeof waybillCreateValidationSchema>;
export type WaybillUpdateInput = z.infer<typeof waybillUpdateValidationSchema>;
