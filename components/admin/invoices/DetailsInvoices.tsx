"use client";

import React from 'react';
import { Invoice, Company } from '@/types/data';
import {
    LuReceipt,
    LuX,
    LuBuilding2,
    LuCoins,
    LuCalendar,
    LuHash
} from 'react-icons/lu';

interface DetailsInvoicesProps {
    isOpen?: boolean;
    invoice: Invoice | null;
    onClose: () => void;
}

export default function DetailsInvoices({ isOpen = true, invoice, onClose }: DetailsInvoicesProps) {
    if (!isOpen || !invoice) return null;

    const companyName = typeof invoice.companyId === 'object' && invoice.companyId !== null
        ? (invoice.companyId as Company).companyName
        : 'شركة غير محددة';

    const statusMap = {
        draft: { label: 'مسودة (Draft)', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
        issued: { label: 'صادرة (Issued)', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        paid: { label: 'مدفوعة (Paid)', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
        overdue: { label: 'متأخرة (Overdue)', bg: 'bg-rose-500/10 text-rose-600 border-rose-200' },
        cancelled: { label: 'ملغاة (Cancelled)', bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    }[invoice.status || 'draft'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuReceipt className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل الفاتورة المالية</h2>
                            <p className="text-xs text-body mt-0.5">عرض المبلغ والقيمة المضافة والشركة المرتبطة وحالة السداد</p>
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
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">

                    {/* Invoice Number & Status Header */}
                    <div className="p-5 rounded-2xl bg-surface-muted border border-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center font-bold">
                                <LuHash className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs text-body font-medium block">رقم الفاتورة</span>
                                <h3 className="text-lg font-extrabold text-heading font-latin">{invoice.invoiceNumber}</h3>
                            </div>
                        </div>

                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusMap.bg}`}>
                            {statusMap.label}
                        </span>
                    </div>

                    {/* Company Info Card */}
                    <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                        <span className="text-xs text-body font-medium flex items-center gap-1.5">
                            <LuBuilding2 className="w-4 h-4 text-accent" />
                            الشركة المفلتر لها (Company)
                        </span>
                        <span className="text-base font-extrabold text-heading block">{companyName}</span>
                    </div>

                    {/* Amounts & Due Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 text-center">
                            <LuCoins className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                            <span className="text-xs text-body font-medium block">إجمالي مبلغ الفاتورة</span>
                            <span className="text-lg font-extrabold text-emerald-600 font-latin block">{invoice.total} ر.س</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 text-center">
                            <LuCalendar className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                            <span className="text-xs text-body font-medium block">تاريخ الاستحقاق (Due Date)</span>
                            <span className="text-sm font-bold text-heading block">
                                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-SA') : 'غير حدد'}
                            </span>
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-body">
                        <div className="flex items-center gap-1.5">
                            <LuCalendar className="w-3.5 h-3.5 text-body/60" />
                            <span>تاريخ الإصدار: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
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
