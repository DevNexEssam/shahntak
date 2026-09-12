"use client";

import React, { useState } from 'react';
import AdminCompanySelect from '@/components/admin/common/AdminCompanySelect';
import AdminCompanySubscriptionWidget from '@/components/admin/common/AdminCompanySubscriptionWidget';
import { useCreateInvoice } from '@/hooks/invoices/useInvoices';
import { useAllCompanies } from '@/hooks/companies/useCompanies';
import { invoiceCreateValidationSchema } from '@/lib/validations/invoice.schema';
import toast from 'react-hot-toast';
import {
    LuReceipt,
    LuX,
    LuBuilding2,
    LuCoins,
    LuCalendar,
    LuHash
} from 'react-icons/lu';

interface AddInvoicesProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddInvoices({ isOpen = true, onClose }: AddInvoicesProps) {
    const [formValues, setFormValues] = useState({
        companyId: '',
        total: 1000,
        status: 'issued' as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createInvoice, isPending: isSubmitting } = useCreateInvoice();
    const { data: companiesRes, isLoading: isLoadingCompanies } = useAllCompanies();

    if (!isOpen) return null;

    const companies = companiesRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const payload = {
            ...formValues,
            dueDate: formValues.dueDate || undefined,
        };

        // 1. Zod Validation Check
        const validation = invoiceCreateValidationSchema.safeParse(payload);
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

        // 2. Trigger Mutation
        createInvoice(payload, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuReceipt className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">إصدار فاتورة جديدة</h2>
                            <p className="text-xs text-body mt-0.5">إنشاء فاتورة خدمات لوجستية وتحديد المستفيد والمبلغ والقيم</p>
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

                        <div className="bg-accent/10 border border-accent/30 p-3.5 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                                <LuHash className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-heading block">رقم الفاتورة الآلي</span>
                                <span className="text-[11px] text-body">سيتم توليد رقم الفاتورة فريداً أوتوماتيكياً من النظام فور الاعتماد (مثال: INV-2026-XXXX)</span>
                            </div>
                        </div>

                        {/* Company Selection with Live Subscription Quota */}
                        <div className="space-y-2">
                            <AdminCompanySelect
                                value={formValues.companyId}
                                onChange={(companyId: string) => {
                                    setFormValues((prev) => ({ ...prev, companyId }));
                                    if (fieldErrors.companyId) {
                                        setFieldErrors((prev) => ({ ...prev, companyId: '' }));
                                    }
                                }}
                                disabled={isSubmitting}
                                error={fieldErrors.companyId}
                            />

                            {/* Live Subscription Quota Widget */}
                            {formValues.companyId && (
                                <AdminCompanySubscriptionWidget
                                    companyId={formValues.companyId}
                                />
                            )}
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
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.total ? 'border-rose-500' : 'border-border'
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
                                حالة الفاتورة
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.status}
                                onChange={(e) => setFormValues({ ...formValues, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="issued">صادرة بانتظار التحصيل</option>
                                <option value="paid">مدفوعة ومحصلة</option>
                                <option value="draft">مسودة</option>
                                <option value="overdue">متأخرة السداد</option>
                                <option value="cancelled">ملغاة</option>
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
                            {isSubmitting ? "جاري الإضافة..." : "حفظ البيانات"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
