"use client";

import React from 'react';
import {
    LuPackage,
    LuX,
    LuUser,
    LuCoins,
    LuMapPin
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
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 text-amber-600">
                        قيد الانتظار
                    </span>
                );
            case 'validated':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-600">
                        مؤكد
                    </span>
                );
            case 'grouped':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/10 text-purple-600">
                        مجمع بشحنة
                    </span>
                );
            case 'shipped':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-500/10 text-sky-600">
                        تم الشحن
                    </span>
                );
            case 'delivered':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">
                        تم التوصيل
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        ملغي
                    </span>
                );
            case 'error':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        خطأ في البيانات
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-surface-muted text-muted-foreground">
                        {status}
                    </span>
                );
        }
    };

    const orderValue = Number(orderData.orderValue || 0);
    const codAmount = Number(orderData.codAmount || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150" dir="rtl">
            <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuPackage className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-foreground">تفاصيل الطلب</h2>
                                {getStatusBadge(orderData.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-latin">رقم الطلب: <span className="font-semibold text-accent">{orderData.orderNumber}</span></p>
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
                            <span className="text-muted-foreground block">تاريخ تسجيل الطلب</span>
                            <span className="font-bold text-foreground font-latin text-sm">
                                {new Date(orderData.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                            </span>
                        </div>
                        <div className="text-left">
                            <span className="text-muted-foreground block">مصدر الطلب</span>
                            <span className="font-bold text-foreground text-xs">
                                {orderData.source === 'bulk_upload' ? 'رفع مجمع (Excel)' : 'إدخال يدوي'}
                            </span>
                        </div>
                    </div>

                    {/* Recipient & Location Details Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuUser className="w-4 h-4 text-accent" />
                            <span>بيانات المستلم وموقع التوصيل</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">اسم المستلم</span>
                                <span className="font-semibold text-foreground">{orderData.recipientName}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">رقم الجوال</span>
                                <span className="font-semibold text-foreground font-latin dir-ltr">{orderData.recipientPhone}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">المدينة والحي</span>
                                <span className="font-semibold text-foreground">{orderData.recipientCity} {orderData.recipientDistrict ? `- ${orderData.recipientDistrict}` : ''}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-muted-foreground">العنوان التفصيلي</span>
                                <span className="font-semibold text-foreground">{orderData.recipientAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown & Specifications Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuCoins className="w-4 h-4 text-accent" />
                            <span>المواصفات والقيم المالية</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">وزن الطرد / عدد الكميات</span>
                                <span className="font-semibold text-foreground font-latin">{orderData.weight || 1} كجم ({orderData.quantity || 1} طرد)</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">قيمة الطلب المعترفة</span>
                                <span className="font-semibold text-emerald-600 font-latin">{orderValue.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex justify-between items-center pt-1 text-sm font-bold">
                                <span className="text-foreground">مبلغ التحصيل عند الاستلام (COD)</span>
                                <span className="text-amber-600 font-latin text-base font-bold">{codAmount.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-border/20 transition-colors text-foreground cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
