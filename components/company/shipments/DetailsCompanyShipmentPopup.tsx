"use client";

import React from 'react';
import {
    LuTruck,
    LuX,
    LuMapPin,
    LuCoins,
    LuReceipt,
    LuCalendar,
    LuCheck,
    LuClock,
    LuPrinter,
    LuLayers,
    LuBox
} from 'react-icons/lu';

interface DetailsCompanyShipmentPopupProps {
    isOpen?: boolean;
    onClose: () => void;
    shipmentData: any;
    onPrintWaybill?: (shipment: any) => void;
}

export default function DetailsCompanyShipmentPopup({
    isOpen = true,
    onClose,
    shipmentData,
    onPrintWaybill
}: DetailsCompanyShipmentPopupProps) {
    if (!isOpen || !shipmentData) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'created':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <LuClock className="w-3.5 h-3.5" />
                        حديثة (Created)
                    </span>
                );
            case 'in_transit':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        <LuTruck className="w-3.5 h-3.5" />
                        في الطريق (In Transit)
                    </span>
                );
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <LuCheck className="w-3.5 h-3.5" />
                        تم التسليم (Delivered)
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        <LuX className="w-3.5 h-3.5" />
                        ملغية (Cancelled)
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

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ftl': return 'شحن كامل (FTL)';
            case 'ltl': return 'شحن جزئي (LTL)';
            default: return 'توصيل محلي (Local Delivery)';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-3xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-extrabold text-heading">تفاصيل الشحنة والبوليصة</h2>
                                {getStatusBadge(shipmentData.status)}
                            </div>
                            <p className="text-xs text-body mt-0.5 font-latin">رقم الشحنة: <span className="font-bold text-accent">{shipmentData.shipmentNumber}</span></p>
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

                    {/* Waybill Info Card */}
                    <div className="p-5 rounded-2xl bg-accent-soft/30 border border-accent/20 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-accent block">رقم بوليصة الشحن (Waybill)</span>
                            <span className="text-lg font-extrabold text-heading font-latin tracking-wide">{shipmentData.waybillNumber || 'WB-PENDING'}</span>
                            {shipmentData.trackingNumber && (
                                <span className="text-xs text-body block font-latin mt-0.5">رقم التتبع: {shipmentData.trackingNumber}</span>
                            )}
                        </div>

                        {onPrintWaybill && (
                            <button
                                type="button"
                                onClick={() => onPrintWaybill(shipmentData)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                            >
                                <LuPrinter className="w-4 h-4" />
                                <span>طباعة البوليصة</span>
                            </button>
                        )}
                    </div>

                    {/* Route Card */}
                    <div className="p-5 rounded-2xl bg-surface-muted/60 border border-border space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <LuMapPin className="w-4 h-4" />
                            مسار الشحنة والنوع
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-body block font-medium">نوع الخدمة</span>
                                <span className="font-extrabold text-heading">{getTypeLabel(shipmentData.type)}</span>
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">من (المصدر)</span>
                                <span className="font-extrabold text-heading">{shipmentData.origin}</span>
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">إلى (الوجهة)</span>
                                <span className="font-extrabold text-heading">{shipmentData.destination}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resources & Financials */}
                    <div className="p-5 rounded-2xl bg-surface-muted/60 border border-border space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <LuCoins className="w-4 h-4" />
                            تعيين الموارد والقيم المالية
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="p-3 rounded-xl bg-surface border border-border text-center">
                                <span className="text-[11px] text-body block font-medium">عدد الطلبات</span>
                                <span className="font-extrabold text-heading font-latin">{shipmentData.ordersCount || 1}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-surface border border-border text-center">
                                <span className="text-[11px] text-body block font-medium">المركبة المعينة</span>
                                <span className="font-bold text-heading text-xs">
                                    {typeof shipmentData.vehicleId === 'object' && shipmentData.vehicleId !== null
                                        ? shipmentData.vehicleId.type
                                        : 'لم تعين بعد'}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-surface border border-border text-center">
                                <span className="text-[11px] text-body block font-medium">التكلفة التشغيلية</span>
                                <span className="font-extrabold text-amber-600 font-latin">{shipmentData.shippingCost || 0} ر.س</span>
                            </div>
                            <div className="p-3 rounded-xl bg-surface border border-border text-center">
                                <span className="text-[11px] text-body block font-medium">سعر العميل</span>
                                <span className="font-extrabold text-emerald-600 font-latin">{shipmentData.customerPrice || 0} ر.س</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Metadata */}
                    <div className="flex items-center justify-between text-xs text-body border-t border-border pt-4">
                        <span className="flex items-center gap-1.5 font-latin">
                            <LuCalendar className="w-4 h-4 text-accent" />
                            تاريخ الإنشاء: {new Date(shipmentData.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-surface-muted font-bold text-heading font-latin">
                            ID: {shipmentData._id}
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
