import { z } from "zod";

export const routeCreateValidationSchema = z.object({
    companyId: z.string().optional().or(z.literal("")),
    createdBy: z.string().optional().or(z.literal("")),
    origin: z
        .string({ message: "Origin location is required" })
        .min(2, "Origin location must be at least 2 characters")
        .max(50, "Origin location must not exceed 50 characters"),
    destination: z
        .string({ message: "Destination location is required" })
        .min(2, "Destination location must be at least 2 characters")
        .max(50, "Destination location must not exceed 50 characters"),
    vehicleType: z.string({ message: "Vehicle type is required" }).min(1, "Vehicle type is required"),
    basePrice: z
        .number({ message: "Base price is required" })
        .min(0, "Base price cannot be negative"),
    carrierId: z.string().optional().or(z.literal("")),
    estimatedTransitTime: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
});

export const routeUpdateValidationSchema = z.object({
    companyId: z.string().optional().or(z.literal("")),
    createdBy: z.string().optional().or(z.literal("")),
    origin: z
        .string()
        .min(2, "Origin location must be at least 2 characters")
        .max(50, "Origin location must not exceed 50 characters")
        .optional(),
    destination: z
        .string()
        .min(2, "Destination location must be at least 2 characters")
        .max(50, "Destination location must not exceed 50 characters")
        .optional(),
    vehicleType: z.string().optional(),
    basePrice: z.number().min(0).optional(),
    carrierId: z.string().optional().or(z.literal("")),
    estimatedTransitTime: z.string().optional().or(z.literal("")),
    isActive: z.boolean().optional(),
});

// Type Inference
export type RouteCreateInput = z.infer<typeof routeCreateValidationSchema>;
export type RouteUpdateInput = z.infer<typeof routeUpdateValidationSchema>;

