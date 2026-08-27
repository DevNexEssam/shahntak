"use client";

import React from 'react';
import { Payment, Invoice } from '@/types/data';
import {
    LuCreditCard,
    LuX,
    LuReceipt,
    LuCoins,
    LuCalendar,
    LuWallet,
    LuBuilding2
} from 'react-icons/lu';

interface DetailsPaymentsProps {
    isOpen?: boolean;
    payment: Payment | null;
    onClose: () => void;
}

export default function DetailsPayments({ isOpen = true, payment, onClose }: DetailsPaymentsProps) {
    if (!isOpen || !payment) return null;

    const invObj = typeof payment.invoiceId === 'object' && payment.invoiceId !== null
        ? (payment.invoiceId as Invoice)
        : null;

    const invoiceNumber = invObj?.invoiceNumber || 'غير محددة';
    const invoiceTotal = invObj?.total ?? 0;
    const companyName = invObj && typeof invObj.companyId === 'object' && invObj.companyId !== null
        ? (invObj.companyId as any).companyName
        : 'غير محددة';

    const methodMap: Record<string, string> = {
        bank_transfer: 'تحويل بنكي مباشر',
        card: 'بطاقة ائتمانية / مدى',
        cash: 'سداد نقدي',
        other: 'وسيلة أخرى',
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
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل عملية السداد</h2>
                            <p className="text-xs text-body mt-0.5">عرض سداد الدفعة المالية الموثقة ومعلومات الفاتورة</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1 text-right">

                    {/* Top Identity Card */}
                    <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <span className="text-xs text-body block font-medium">مبلغ الدفعة</span>
                            <h3 className="text-xl font-extrabold text-emerald-600 font-latin">{payment.amount.toLocaleString()} ر.س</h3>
                        </div>

                        <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                            دفعة مدفوعة
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-4 border border-border rounded-2xl p-4 bg-surface">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuReceipt className="w-4 h-4 text-accent" />
                                الفاتورة المربوطة:
                            </span>
                            <span className="text-sm font-bold text-heading font-latin">{invoiceNumber}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuBuilding2 className="w-4 h-4 text-accent" />
                                الشركة المشتركة:
                            </span>
                            <span className="text-sm font-bold text-heading">{companyName}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuWallet className="w-4 h-4 text-accent" />
                                طريقة السداد:
                            </span>
                            <span className="text-sm font-bold text-heading">
                                {methodMap[payment.method] || payment.method}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuCoins className="w-4 h-4 text-body/60" />
                                إجمالي قيمة الفاتورة:
                            </span>
                            <span className="text-sm font-bold text-heading font-latin">{invoiceTotal.toLocaleString()} ر.س</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuCalendar className="w-4 h-4 text-body/60" />
                                تاريخ السداد الفعلي:
                            </span>
                            <span className="text-xs font-bold text-heading">
                                {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-border bg-surface-muted/40 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
