import { z } from "zod";

export const defaultExpenseCategories = [
    "وقود ومحروقات",
    "صيانة وورش",
    "رسوم طرق وتنقّل",
    "رواتب وبدلات للسائقين",
    "إيجار ومرافق مكتبية",
    "قطع غيار وتجهيزات",
    "تأمين ورخيص مركبات",
    "أخرى / مخصص",
] as const;

export const createExpenseSchema = z.object({
    title: z.string({ message: "عنوان المصروف مطلوب" }).min(2, "عنوان المصروف يجب أن يتكون من حرفين على الأقل"),
    category: z.string({ message: "تصنيف المصروف مطلوب" }).min(2, "يرجى تحديد أو كتابة تصنيف المصروف"),
    amount: z.number({ message: "مبلغ المصروف مطلوب" }).positive("المبلغ يجب أن يكون أكبر من الصفر"),
    taxIncluded: z.boolean().optional().default(false),
    taxAmount: z.number().min(0, "قيمة الضريبة لا يمكن أن تكون بالسالب").optional().default(0),
    expenseDate: z.string().optional(),
    receiptNumber: z.string().optional(),
    notes: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
