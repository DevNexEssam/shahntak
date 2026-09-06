import { z } from "zod";

export const zatcaTaxRates = [15, 0] as const;

export const taxSettingsUpdateSchema = z.object({
    vatRate: z
        .number({ message: "نسبة ضريبة القيمة المضافة مطلوبة كرمز رقمي" })
        .refine((val) => val === 15 || val === 0, {
            message: "نسبة ضريبة القيمة المضافة يجب أن تكون 15% (أساسية) أو 0% (معفاة) وفقاً للائحة ZATCA",
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
        message: "عند اختيار نسبة الضريبة 0% (معفاة)، يجب اختيار أو إدخال سبب الإعفاء الضريبي الرسمي",
        path: ["vatExemptionReason"],
    }
);

export type TaxSettingsUpdateInput = z.infer<typeof taxSettingsUpdateSchema>;
