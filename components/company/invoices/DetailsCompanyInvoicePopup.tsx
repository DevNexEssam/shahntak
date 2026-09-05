"use client";

import React from 'react';
import {
    LuReceipt,
    LuX,
    LuCoins,
    LuPrinter
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
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">
                        مسدد ومحصل
                    </span>
                );
            case 'issued':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-accent/10 text-accent">
                        صادرة ومعلقة
                    </span>
                );
            case 'overdue':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        متأخرة السداد
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-surface-muted text-muted-foreground">
                        مسودة
                    </span>
                );
        }
    };

    const finalTotal = Number(invoiceData.total ?? invoiceData.amount ?? invoiceData.totalAmount ?? 0);
    const subtotal = Number(invoiceData.subtotal ?? (finalTotal / 1.15));
    const vatAmount = Number(invoiceData.vatAmount ?? (finalTotal - subtotal));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150" dir="rtl">
            <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-foreground">تفاصيل الفاتورة الضريبية</h2>
                                {getStatusBadge(invoiceData.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-latin">رقم الفاتورة: <span className="font-semibold text-accent">{invoiceData.invoiceNumber}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">

                    {/* Summary Info Row */}
                    <div className="p-4 rounded-md bg-surface-muted border border-border flex items-center justify-between text-xs">
                        <div>
                            <span className="text-muted-foreground block">تاريخ إصدار الفاتورة</span>
                            <span className="font-bold text-foreground font-latin text-sm">
                                {new Date(invoiceData.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handlePrintInvoice}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-xs"
                        >
                            <LuPrinter className="w-4 h-4" />
                            <span>طباعة الفاتورة</span>
                        </button>
                    </div>

                    {/* Financial Breakdown Table */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuCoins className="w-4 h-4 text-accent" />
                            <span>تفاصيل المبالغ وضريبة القيمة المضافة (VAT 15%)</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">المبلغ الأساسي (قبل الضريبة)</span>
                                <span className="font-semibold text-foreground font-latin">{subtotal.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
                                <span className="font-semibold text-foreground font-latin">{vatAmount.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex justify-between items-center pt-2 text-sm font-bold">
                                <span className="text-foreground">الإجمالي الكلي المستحق</span>
                                <span className="text-accent font-latin text-base font-bold">{finalTotal.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-border/20 transition-colors text-foreground"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
