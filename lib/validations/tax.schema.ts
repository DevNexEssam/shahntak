import { z } from "zod";

export const zatcaTaxRates = [15, 0] as const;

export const taxSettingsUpdateSchema = z.object({
    vatRate: z
        .number({ message: "VAT rate is required as a numeric value" })
        .refine((val) => val === 15 || val === 0, {
            message: "VAT rate must be 15% (Standard) or 0% (Exempt) according to ZATCA regulations",
        }),
    vatExemptionReason: z.string().trim().optional(),
    vatRateReason: z.string().trim().optional(),
}).refine(
    (data) => {
        if (data.vatRate === 0) {
            return !!data.vatExemptionReason && data.vatExemptionReason.trim().length >= 3;
        }
        return true;
    },
    {
        message: "When selecting 0% VAT rate (Exempt), an official tax exemption reason must be provided",
        path: ["vatExemptionReason"],
    }
);

export type TaxSettingsUpdateInput = z.infer<typeof taxSettingsUpdateSchema>;
