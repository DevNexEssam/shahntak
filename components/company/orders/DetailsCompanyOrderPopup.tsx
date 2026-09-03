"use client";

import React from 'react';
import {
    LuPackage,
    LuX,
    LuUser,
    LuPhone,
    LuMapPin,
    LuCoins,
    LuWeight,
    LuHash,
    LuCalendar,
    LuCheck,
    LuClock
} from 'react-icons/lu';

interface DetailsCompanyOrderPopupProps {
    isOpen?: boolean;
    onClose: () => void;
    orderData: any;
}

export default function DetailsCompanyOrderPopup({ isOpen = true, onClose, orderData }: DetailsCompanyOrderPopupProps) {
    if (!isOpen || !orderData) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <LuClock className="w-3.5 h-3.5" />
                        قيد الانتظار (Pending)
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        <LuPackage className="w-3.5 h-3.5" />
                        تم الشحن (Shipped)
                    </span>
                );
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <LuCheck className="w-3.5 h-3.5" />
                        تم التوصيل (Delivered)
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        <LuX className="w-3.5 h-3.5" />
                        ملغي (Cancelled)
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPackage className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-extrabold text-heading">تفاصيل الطلب</h2>
                                {getStatusBadge(orderData.status)}
                            </div>
                            <p className="text-xs text-body mt-0.5 font-latin">رقم الطلب: <span className="font-bold text-accent">{orderData.orderNumber}</span></p>
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

                    {/* Recipient Information Card */}
                    <div className="p-5 rounded-2xl bg-surface-muted/60 border border-border space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <LuUser className="w-4 h-4" />
                            بيانات المستلم والتوصيل
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-body block font-medium">اسم المستلم</span>
                                <span className="font-extrabold text-heading">{orderData.recipientName}</span>
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">رقم الجوال</span>
                                <span className="font-bold text-heading font-latin dir-ltr inline-block">{orderData.recipientPhone}</span>
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">المدينة والحي</span>
                                <span className="font-bold text-heading">{orderData.recipientCity} {orderData.recipientDistrict ? `- ${orderData.recipientDistrict}` : ''}</span>
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">العنوان التفصيلي</span>
                                <span className="font-bold text-heading">{orderData.recipientAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financials & Metrics Card */}
                    <div className="p-5 rounded-2xl bg-surface-muted/60 border border-border space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <LuCoins className="w-4 h-4" />
                            المواصفات والقيم المالية
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="p-3 rounded-xl bg-surface border border-border text-center">
                                <span className="text-[11px] text-body block font-medium">الوزن</span>
                                <span className="font-extrabold text-heading font-latin">{orderData.weight} كجم</span>
                            </div>
                            <div className="p-3 rounded-xl bg-surface border border-border text-center">
                                <span className="text-[11px] text-body block font-medium">عدد الطرود</span>
                                <span className="font-extrabold text-heading font-latin">{orderData.quantity || 1}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-surface border border-border text-center">
                                <span className="text-[11px] text-body block font-medium">قيمة الطلب</span>
                                <span className="font-extrabold text-emerald-600 font-latin">{orderData.orderValue} ر.س</span>
                            </div>
                            <div className="p-3 rounded-xl bg-surface border border-border text-center">
                                <span className="text-[11px] text-body block font-medium">مبلغ COD</span>
                                <span className="font-extrabold text-amber-600 font-latin">{orderData.codAmount || 0} ر.س</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Metadata */}
                    <div className="flex items-center justify-between text-xs text-body border-t border-border pt-4">
                        <span className="flex items-center gap-1.5 font-latin">
                            <LuCalendar className="w-4 h-4 text-accent" />
                            تاريخ الإنشاء: {new Date(orderData.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-surface-muted font-bold text-heading">
                            المصدر: {orderData.source === 'bulk_upload' ? 'رفع مجمع' : 'إدخال يدوي'}
                        </span>
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
