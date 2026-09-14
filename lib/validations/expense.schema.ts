import { z } from "zod";

export const defaultExpenseCategories = [
    "Fuel & Gas",
    "Maintenance & Repairs",
    "Tolls & Transport Fees",
    "Driver Salaries & Allowances",
    "Office Rent & Utilities",
    "Spare Parts & Equipment",
    "Insurance & Licensing",
    "Other / Custom",
] as const;

export const createExpenseSchema = z.object({
    title: z.string({ message: "Expense title is required" }).min(2, "Expense title must be at least 2 characters"),
    category: z.string({ message: "Expense category is required" }).min(2, "Please specify or enter an expense category"),
    amount: z.number({ message: "Expense amount is required" }).positive("Amount must be greater than zero"),
    taxIncluded: z.boolean().optional().default(false),
    taxAmount: z.number().min(0, "Tax amount cannot be negative").optional().default(0),
    expenseDate: z.string().optional(),
    receiptNumber: z.string().optional(),
    notes: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
