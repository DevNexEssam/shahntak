"use client";

import React, { useState } from 'react';
import { useCreatePayment } from '@/hooks/payments/usePayments';
import { useAllInvoices } from '@/hooks/invoices/useInvoices';
import { paymentCreateValidationSchema } from '@/lib/validations/payment.schema';
import toast from 'react-hot-toast';
import {
    LuCreditCard,
    LuX,
    LuReceipt,
    LuCoins,
    LuCalendar,
    LuWallet
} from 'react-icons/lu';

interface AddPaymentsProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddPayments({ isOpen = true, onClose }: AddPaymentsProps) {
    const [formValues, setFormValues] = useState({
        invoiceId: '',
        amount: 1000,
        method: 'bank_transfer' as 'bank_transfer' | 'card' | 'cash' | 'other',
        paidAt: new Date().toISOString().split('T')[0],
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createPayment, isPending: isSubmitting } = useCreatePayment();

    // Fetch invoices list for dropdown selection
    const { data: invoicesRes, isLoading: isLoadingInvoices } = useAllInvoices();

    if (!isOpen) return null;

    const invoices = invoicesRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const payload = {
            ...formValues,
            paidAt: formValues.paidAt ? new Date(formValues.paidAt) : new Date(),
        };

        // 1. Zod Validation Check
        const validation = paymentCreateValidationSchema.safeParse(payload);
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
        createPayment(payload as any, {
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
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuCreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">إثبات وسداد دفعة مالية</h2>
                            <p className="text-xs text-body mt-0.5">تسجيل الدفعة المحصلة وتعديل حالة الفاتورة التلقائية بالمنصة</p>
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
                    <div className="p-6 overflow-y-auto space-y-5 flex-1 text-right">

                        {/* Invoice Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuReceipt className="w-3.5 h-3.5 text-body" />
                                الفاتورة المالية المستحقة <span className="text-red-500">*</span>
                            </label>
                            <select
                                disabled={isSubmitting || isLoadingInvoices}
                                value={formValues.invoiceId}
                                onChange={(e) => {
                                    const selectedInv = invoices.find(inv => inv._id === e.target.value);
                                    setFormValues({
                                        ...formValues,
                                        invoiceId: e.target.value,
                                        amount: selectedInv ? selectedInv.total : formValues.amount,
                                    });
                                }}
                                className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 ${
                                    fieldErrors.invoiceId ? 'border-rose-500' : 'border-border'
                                }`}
                            >
                                <option value="">اختر الفاتورة...</option>
                                {invoices.map((inv) => (
                                    <option key={inv._id} value={inv._id}>
                                        فاتورة رقم {inv.invoiceNumber} (المبلغ الإجمالي: {inv.total} ر.س)
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.invoiceId && (
                                <span className="text-xs text-rose-500 font-medium block">{fieldErrors.invoiceId}</span>
                            )}
                        </div>

                        {/* Amount & Method */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-body" />
                                    مبلغ الدفعة المسددة (ر.س) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.amount}
                                    onChange={(e) => setFormValues({ ...formValues, amount: Number(e.target.value) })}
                                    min={0.01}
                                    step="any"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.amount ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.amount && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.amount}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuWallet className="w-3.5 h-3.5 text-body" />
                                    طريقة السداد <span className="text-red-500">*</span>
                                </label>
                                <select
                                    disabled={isSubmitting}
                                    value={formValues.method}
                                    onChange={(e) => setFormValues({ ...formValues, method: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 font-medium"
                                >
                                    <option value="bank_transfer">تحويل بنكي مباشر</option>
                                    <option value="card">بطاقة ائتمانية / مدى</option>
                                    <option value="cash">سداد نقدي</option>
                                    <option value="other">وسيلة أخرى</option>
                                </select>
                            </div>
                        </div>

                        {/* Payment Date */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCalendar className="w-3.5 h-3.5 text-body" />
                                تاريخ السداد الفعلي
                            </label>
                            <input
                                type="date"
                                disabled={isSubmitting}
                                value={formValues.paidAt}
                                onChange={(e) => setFormValues({ ...formValues, paidAt: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer"
                            />
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
                            {isSubmitting ? "جاري التسجيل..." : "تأكيد السداد"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
