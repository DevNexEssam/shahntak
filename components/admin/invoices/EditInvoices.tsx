"use client";

import React, { useState, useEffect } from 'react';
import { Invoice, Company } from '@/types/data';
import { useUpdateInvoice } from '@/hooks/invoices/useInvoices';
import { invoiceUpdateValidationSchema } from '@/lib/validations/invoice.schema';
import toast from 'react-hot-toast';
import {
    LuReceipt,
    LuX,
    LuBuilding2,
    LuCoins,
    LuCalendar,
    LuHash,
    LuPencil
} from 'react-icons/lu';

interface EditInvoicesProps {
    isOpen?: boolean;
    invoice: Invoice | null;
    onClose: () => void;
}

export default function EditInvoices({ isOpen = true, invoice, onClose }: EditInvoicesProps) {
    const [formValues, setFormValues] = useState({
        total: 0,
        status: 'issued' as any,
        dueDate: '',
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: updateInvoice, isPending: isSubmitting } = useUpdateInvoice();

    useEffect(() => {
        if (invoice) {
            setFormValues({
                total: invoice.total ?? 0,
                status: invoice.status || 'issued',
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
            });
            setFieldErrors({});
        }
    }, [invoice]);

    if (!isOpen || !invoice) return null;

    const companyName = typeof invoice.companyId === 'object' && invoice.companyId !== null
        ? (invoice.companyId as Company).companyName
        : 'شركة غير محددة';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const payload = {
            ...formValues,
            dueDate: formValues.dueDate || undefined,
        };

        // 1. Zod Validation Check
        const validation = invoiceUpdateValidationSchema.safeParse(payload);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("يرجى تصحيح الأخطاء الموضحة في النموذج");
            return;
        }

        // 2. Trigger Update Mutation
        updateInvoice(
            { id: invoice._id, updates: payload },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header - Identical to Add Modal Theme */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات الفاتورة</h2>
                            <p className="text-xs text-body mt-0.5">تحديث مبلغ وحالة الفاتورة رقم: <span className="font-bold text-accent font-latin">{invoice.invoiceNumber}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-50"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-5 flex-1">

                        {/* Readonly Info Header */}
                        <div className="p-4 rounded-md bg-surface-muted border border-border flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2.5">
                                <LuBuilding2 className="w-4 h-4 text-accent" />
                                <div>
                                    <span className="text-xs text-body block font-medium">الشركة المفلتر لها</span>
                                    <span className="text-sm font-bold text-heading">{companyName}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 font-latin text-xs">
                                <LuHash className="w-3.5 h-3.5 text-body" />
                                <span className="font-bold text-heading">{invoice.invoiceNumber}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-body" />
                                    إجمالي الفاتورة (ر.س) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.total}
                                    onChange={(e) => setFormValues({ ...formValues, total: Number(e.target.value) })}
                                    min={0}
                                    step="any"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.total ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.total && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.total}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCalendar className="w-3.5 h-3.5 text-body" />
                                    تاريخ الاستحقاق
                                </label>
                                <input
                                    type="date"
                                    disabled={isSubmitting}
                                    value={formValues.dueDate}
                                    onChange={(e) => setFormValues({ ...formValues, dueDate: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading block">
                                حالة الفاتورة السدادية
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.status}
                                onChange={(e) => setFormValues({ ...formValues, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="issued">صادرة بانتظار التحصيل</option>
                                <option value="paid">مدفوعة ومحصلة</option>
                                <option value="draft">مسودة </option>
                                <option value="overdue">متأخرة السداد </option>
                                <option value="cancelled">ملغاة </option>
                            </select>
                        </div>

                    </div>

                    {/* Modal Footer */}
                    <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "جاري التعديل..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
