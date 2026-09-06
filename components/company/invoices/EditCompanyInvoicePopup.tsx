/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useUpdateCompanyInvoice } from '@/hooks/company/useCompanyInvoice';
import {
    LuReceipt,
    LuX,
    LuSave,
    LuCalendar,
    LuTriangleAlert,
    LuCheck,
    LuClock,
    LuTag,
    LuCoins
} from 'react-icons/lu';

interface EditCompanyInvoicePopupProps {
    isOpen: boolean;
    invoiceData: any;
    onClose: () => void;
}

export default function EditCompanyInvoicePopup({
    isOpen,
    invoiceData,
    onClose,
}: EditCompanyInvoicePopupProps) {
    const { mutate: updateInvoice, isPending } = useUpdateCompanyInvoice();

    const [status, setStatus] = useState<string>('draft');
    const [dueDate, setDueDate] = useState<string>('');
    const [discount, setDiscount] = useState<number | string>(0);

    useEffect(() => {
        if (invoiceData) {
            setStatus(invoiceData.status || 'draft');
            setDiscount(invoiceData.discount !== undefined ? invoiceData.discount : 0);
            if (invoiceData.dueDate) {
                setDueDate(new Date(invoiceData.dueDate).toISOString().split('T')[0]);
            } else {
                setDueDate('');
            }
        }
    }, [invoiceData]);

    if (!isOpen || !invoiceData) return null;

    const isPaid = invoiceData.status === 'paid';

    // الحسابات المحاسبية التفاعلية طبقاً للقطة التاريخية المجمدة بالفاتورة
    const taxRate = Number(invoiceData.taxRateSnapshot ?? invoiceData.taxRate ?? 15);
    const rateMultiplier = 1 + (taxRate / 100);
    const basePrice = Number(invoiceData.subtotal || invoiceData.customerPrice || Math.round(((Number(invoiceData.total || 0) / rateMultiplier) + Number(invoiceData.discount || 0)) * 100) / 100);
    const parsedDiscount = Math.max(0, Number(discount) || 0);
    const validDiscount = Math.min(basePrice, parsedDiscount);
    const discountedSubtotal = Math.max(0, basePrice - validDiscount);
    const vatAmount = Math.round(discountedSubtotal * (taxRate / 100) * 100) / 100;
    const computedTotal = Math.round((discountedSubtotal + vatAmount) * 100) / 100;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPaid) return;

        const payload: any = {
            status,
            discount: validDiscount,
        };

        if (dueDate) {
            payload.dueDate = dueDate;
        }

        updateInvoice(
            { id: invoiceData._id, data: payload },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150" dir="rtl">
            <div className="w-full max-w-lg bg-surface border border-border rounded-md shadow-lg overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-heading">تعديل الفاتورة المالية</h2>
                            <p className="text-xs text-body mt-0.5 font-latin">رقم الفاتورة: <span className="font-bold text-accent">{invoiceData.invoiceNumber}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-surface-muted text-body hover:text-heading transition-colors cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                    {/* Paid Lock Warning */}
                    {isPaid ? (
                        <div className="p-4 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-start gap-3">
                            <LuTriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <span className="font-bold block mb-1">فاتورة مدفوعة ومحصلة نهائياً</span>
                                <p className="leading-relaxed">
                                    وفقاً لقواعد النزاهة المالية والضريبية ، لا يمكن تعديل بيانات أو حالة أو تاريخ استحقاق الفواتير المدفوعة بعد تحصيل مبالغها.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 rounded-md bg-accent/10 border border-accent/20 text-accent text-xs flex items-center gap-2">
                            <LuCheck className="w-4 h-4 shrink-0" />
                            <span>يمكنك تحديث حالة الفاتورة، تاريخ استحقاق السداد، ومبلغ الخصم للفواتير غير المدفوعة.</span>
                        </div>
                    )}

                    {/* Status Select */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuClock className="w-3.5 h-3.5 text-accent" />
                            حالة الفاتورة الحالية
                        </label>
                        <select
                            disabled={isPaid}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer"
                        >
                            <option value="draft">مسودة</option>
                            <option value="issued">صادرة ومعلقة</option>
                            <option value="overdue">متأخرة السداد</option>
                            <option value="cancelled">إلغاء الفاتورة</option>
                        </select>
                    </div>

                    {/* Discount Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuTag className="w-3.5 h-3.5 text-accent" />
                            مبلغ الخصم المالي (ر.س)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={isPaid}
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="أدخل قيمة الخصم المالي"
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 font-latin"
                        />
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuCalendar className="w-3.5 h-3.5 text-accent" />
                            تاريخ استحقاق السداد
                        </label>
                        <input
                            type="date"
                            disabled={isPaid}
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 font-latin"
                        />
                    </div>

                    {/* Live Calculation Preview */}
                    <div className="p-3.5 rounded-md border border-border bg-surface-muted space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-heading border-b border-border pb-1.5">
                            <LuCoins className="w-3.5 h-3.5 text-accent" />
                            <span>معاينة المعادلة المحاسبية المعدلة</span>
                        </div>
                        <div className="flex justify-between items-center text-body">
                            <span>المبلغ الأساسي (قبل الخصم والضريبة):</span>
                            <span className="font-bold text-heading font-latin">{basePrice.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-600">
                            <span>قيمة الخصم المالي المطبق:</span>
                            <span className="font-bold font-latin">-{validDiscount.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between items-center text-body">
                            <span>الصافي الخاضع للضريبة:</span>
                            <span className="font-bold text-heading font-latin">{discountedSubtotal.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between items-center text-body">
                            <span>ضريبة القيمة المضافة:</span>
                            <span className="font-bold text-heading font-latin">{vatAmount.toFixed(2)} ر.س</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-accent pt-1.5 border-t border-border">
                            <span>الإجمالي الكلي الجديد:</span>
                            <span className="font-latin text-base">{computedTotal.toFixed(2)} ر.س</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-surface-muted transition-colors text-heading cursor-pointer"
                        >
                            إغلاق
                        </button>

                        {!isPaid && (
                            <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                                <LuSave className="w-4 h-4" />
                                <span>{isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                            </button>
                        )}
                    </div>
                </form>

            </div>
        </div>
    );
}
