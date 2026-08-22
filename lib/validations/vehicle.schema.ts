import { z } from "zod";

export const vehicleCreateValidationSchema = z.object({
    type: z
        .string()
        .min(2, "نوع المركبة يجب أن يكون على الأقل حرفين")
        .max(50, "نوع المركبة يجب أن لا يتجاوز 50 حرف"),
    capacityWeight: z
        .number({ message: "الوزن الأقصى يجب أن يكون رقماً" })
        .positive("الوزن الأقصى يجب أن يكون رقماً موجباً")
        .optional(),
    capacityVolume: z
        .number({ message: "الحجم الأقصى يجب أن يكون رقماً" })
        .positive("الحجم الأقصى يجب أن يكون رقماً موجباً")
        .optional(),
    isActive: z.boolean().default(true),
});

export const vehicleUpdateValidationSchema = z.object({
    type: z
        .string()
        .min(2, "نوع المركبة يجب أن يكون على الأقل حرفين")
        .max(50, "نوع المركبة يجب أن لا يتجاوز 50 حرف")
        .optional(),
    capacityWeight: z
        .number({ message: "الوزن الأقصى يجب أن يكون رقماً" })
        .positive("الوزن الأقصى يجب أن يكون رقماً موجباً")
        .optional(),
    capacityVolume: z
        .number({ message: "الحجم الأقصى يجب أن يكون رقماً" })
        .positive("الحجم الأقصى يجب أن يكون رقماً موجباً")
        .optional(),
    isActive: z.boolean().optional(),
});

// Type Inference
export type VehicleCreateInput = z.infer<typeof vehicleCreateValidationSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateValidationSchema>;
