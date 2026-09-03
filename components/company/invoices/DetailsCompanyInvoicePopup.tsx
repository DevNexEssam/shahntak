"use client";

import React from 'react';
import {
    LuReceipt,
    LuX,
    LuCoins,
    LuCalendar,
    LuCheck,
    LuClock,
    LuPrinter,
    LuFileText
} from 'react-icons/lu';

interface DetailsCompanyInvoicePopupProps {
    isOpen?: boolean;
    onClose: () => void;
    invoiceData: any;
}

export default function DetailsCompanyInvoicePopup({
    isOpen = true,
    onClose,
    invoiceData
}: DetailsCompanyInvoicePopupProps) {
    if (!isOpen || !invoiceData) return null;

    const handlePrintInvoice = () => {
        window.print();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <LuCheck className="w-3.5 h-3.5" />
                        مسدد ومحصل (Paid)
                    </span>
                );
            case 'issued':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        <LuFileText className="w-3.5 h-3.5" />
                        صادرة ومعلقة (Issued)
                    </span>
                );
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        <LuClock className="w-3.5 h-3.5" />
                        متأخرة السداد (Overdue)
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        مسودة (Draft)
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
                        {status}
                    </span>
                );
        }
    };

    const subtotal = invoiceData.amount || invoiceData.totalAmount || 0;
    const vatAmount = invoiceData.taxAmount || (subtotal * 0.15);
    const finalTotal = invoiceData.grandTotal || (subtotal + vatAmount);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuReceipt className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-extrabold text-heading">تفاصيل الفاتورة الضريبية</h2>
                                {getStatusBadge(invoiceData.status)}
                            </div>
                            <p className="text-xs text-body mt-0.5 font-latin">رقم الفاتورة: <span className="font-bold text-accent">{invoiceData.invoiceNumber}</span></p>
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

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Invoice Banner */}
                    <div className="p-5 rounded-2xl bg-accent-soft/30 border border-accent/20 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-accent block">الفاتورة اللوجستية المعتمدة</span>
                            <span className="text-xl font-extrabold text-heading font-latin tracking-wide">{invoiceData.invoiceNumber}</span>
                            <span className="text-xs text-body block font-latin mt-0.5">تاريخ الإصدار: {new Date(invoiceData.createdAt || Date.now()).toLocaleDateString('ar-SA')}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handlePrintInvoice}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                        >
                            <LuPrinter className="w-4 h-4" />
                            <span>طباعة الفاتورة 🖨️</span>
                        </button>
                    </div>

                    {/* Invoice Breakdown */}
                    <div className="p-5 rounded-2xl bg-surface-muted/60 border border-border space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <LuCoins className="w-4 h-4" />
                            تفاصيل المبالغ والضريبة المضافة (VAT 15%)
                        </h3>

                        <div className="space-y-2 text-sm pt-2">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <span className="text-body font-medium">المبلغ الأساسي (قبل الضريبة)</span>
                                <span className="font-extrabold text-heading font-latin">{subtotal.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <span className="text-body font-medium">ضريبة القيمة المضافة (15%)</span>
                                <span className="font-extrabold text-amber-600 font-latin">{vatAmount.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-base font-extrabold text-heading">الإجمالي النهائي</span>
                                <span className="text-xl font-extrabold text-emerald-600 font-latin">{finalTotal.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
