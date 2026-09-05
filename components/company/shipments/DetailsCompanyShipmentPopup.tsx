"use client";

import React from 'react';
import { useCompanyShipmentById } from '@/hooks/company/useCompanyShipment';
import {
    LuTruck,
    LuX,
    LuMapPin,
    LuCoins,
    LuPrinter
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
    const { data: detailResponse } = useCompanyShipmentById(shipmentData?._id || '');
    const activeShipment = detailResponse?.data || shipmentData;

    if (!isOpen || !activeShipment) return null;

    const handlePrintInvoice = () => {
        if (onPrintWaybill) {
            onPrintWaybill(activeShipment);
        } else {
            window.print();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'created':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 text-amber-600">
                        حديثة
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-600">
                        مؤكدة
                    </span>
                );
            case 'assigned':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-500/10 text-blue-600">
                        معينة لناقل
                    </span>
                );
            case 'ready_for_pickup':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/10 text-purple-600">
                        جاهزة للاستلام
                    </span>
                );
            case 'picked_up':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-500/10 text-teal-600">
                        تم الاستلام
                    </span>
                );
            case 'in_transit':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-500/10 text-sky-600">
                        في الطريق
                    </span>
                );
            case 'arrived':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-600">
                        وصلت للمركز
                    </span>
                );
            case 'out_for_delivery':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-orange-500/10 text-orange-600">
                        خرجت للتوصيل
                    </span>
                );
            case 'delivered':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">
                        تم التوصيل
                    </span>
                );
            case 'delivery_failed':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        فشل التوصيل
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        ملغية
                    </span>
                );
            case 'returned':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-500/10 text-gray-600">
                        مرتجعة
                    </span>
                );
            case 'exception':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        حالة استثنائية
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

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ftl': return 'شحن كامل ';
            case 'ltl': return 'شحن جزئي ';
            default: return 'توصيل محلي';
        }
    };

    const vehicleType = typeof activeShipment.vehicleId === 'object' && activeShipment.vehicleId !== null
        ? activeShipment.vehicleId.type
        : 'غير معينة';
    const carrierName = typeof activeShipment.carrierId === 'object' && activeShipment.carrierId !== null
        ? activeShipment.carrierId.name
        : 'أسطول الشركة الذاتي';

    const shippingCost = Number(activeShipment.shippingCost || 0);
    const customerPrice = Number(activeShipment.customerPrice || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150" dir="rtl">
            <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuTruck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-foreground">تفاصيل الشحنة والبوليصة</h2>
                                {getStatusBadge(activeShipment.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-latin">رقم الشحنة: <span className="font-semibold text-accent">{activeShipment.shipmentNumber}</span></p>
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

                    {/* Waybill & Print Summary Row */}
                    <div className="p-4 rounded-md bg-surface-muted border border-border flex items-center justify-between text-xs">
                        <div>
                            <span className="text-muted-foreground block font-medium">رقم بوليصة الشحن (Waybill)</span>
                            <span className="font-bold text-foreground font-latin text-sm">
                                {activeShipment.waybillNumber || 'WB-PENDING'}
                            </span>
                            {activeShipment.trackingNumber && (
                                <span className="text-muted-foreground text-[11px] block font-latin mt-0.5">رقم التتبع: {activeShipment.trackingNumber}</span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handlePrintInvoice}
                            disabled={activeShipment.status === 'cancelled'}
                            title={activeShipment.status === 'cancelled' ? 'لا يمكن طباعة بوليصة لشحنة ملغية' : 'طباعة بوليصة الشحن'}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <LuPrinter className="w-4 h-4" />
                            <span>{activeShipment.status === 'cancelled' ? 'بوليصة ملغية' : 'طباعة البوليصة'}</span>
                        </button>
                    </div>

                    {/* Logistics Route & Carrier Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuMapPin className="w-4 h-4 text-accent" />
                            <span>مسار الخدمة والناقل</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">نوع الخدمة</span>
                                <span className="font-semibold text-foreground">{getTypeLabel(activeShipment.type)}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">خط المسار (المصدر ⬅️ الوجهة)</span>
                                <span className="font-semibold text-foreground">{activeShipment.origin} ⬅️ {activeShipment.destination}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">الناقل المعين</span>
                                <span className="font-semibold text-foreground">{carrierName}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-muted-foreground">المركبة المعينة</span>
                                <span className="font-semibold text-foreground">{vehicleType}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuCoins className="w-4 h-4 text-accent" />
                            <span>تفاصيل التكاليف والأسعار</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">عدد الطلبات / الطرود</span>
                                <span className="font-semibold text-foreground font-latin">{activeShipment.ordersCount || 1}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">تكلفة النقل الفعلي (التشغيلية)</span>
                                <span className="font-semibold text-amber-600 font-latin">{shippingCost.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex justify-between items-center pt-1 text-sm font-bold">
                                <span className="text-foreground">سعر الخدمة للعميل (الإجمالي)</span>
                                <span className="text-emerald-600 font-latin text-base font-bold">{customerPrice.toFixed(2)} ر.س</span>
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
