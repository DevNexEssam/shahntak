import { z } from "zod";

export const vehicleCreateValidationSchema = z.object({
    type: z
        .string({ message: "Vehicle type is required" })
        .min(2, "Vehicle type must be at least 2 characters")
        .max(50, "Vehicle type must not exceed 50 characters"),
    capacityWeight: z
        .number({ message: "Max weight capacity must be a number" })
        .positive("Max weight capacity must be a positive number")
        .optional(),
    capacityVolume: z
        .number({ message: "Max volume capacity must be a number" })
        .positive("Max volume capacity must be a positive number")
        .optional(),
    isActive: z.boolean().default(true),
});

export const vehicleUpdateValidationSchema = z.object({
    type: z
        .string()
        .min(2, "Vehicle type must be at least 2 characters")
        .max(50, "Vehicle type must not exceed 50 characters")
        .optional(),
    capacityWeight: z
        .number({ message: "Max weight capacity must be a number" })
        .positive("Max weight capacity must be a positive number")
        .optional(),
    capacityVolume: z
        .number({ message: "Max volume capacity must be a number" })
        .positive("Max volume capacity must be a positive number")
        .optional(),
    isActive: z.boolean().optional(),
});

// Type Inference
export type VehicleCreateInput = z.infer<typeof vehicleCreateValidationSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateValidationSchema>;

