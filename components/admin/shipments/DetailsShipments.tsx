"use client";

import React from 'react';
import { Shipment, Company, Route as RouteType, Carrier, Vehicle } from '@/types/data';
import {
    LuPackage,
    LuX,
    LuBuilding2,
    LuMapPin,
    LuRoute,
    LuTruck,
    LuBox,
    LuCoins,
    LuCalendar
} from 'react-icons/lu';

interface DetailsShipmentsProps {
    isOpen?: boolean;
    shipment: Shipment | null;
    onClose: () => void;
}

export default function DetailsShipments({ isOpen = true, shipment, onClose }: DetailsShipmentsProps) {
    if (!isOpen || !shipment) return null;

    const companyName = typeof shipment.companyId === 'object' && shipment.companyId !== null
        ? (shipment.companyId as Company).companyName
        : 'غير محددة';

    const carrierName = typeof shipment.carrierId === 'object' && shipment.carrierId !== null
        ? (shipment.carrierId as Carrier).name
        : 'غير محدد';

    const vehicleType = typeof shipment.vehicleId === 'object' && shipment.vehicleId !== null
        ? (shipment.vehicleId as Vehicle).type
        : 'غير محددة';

    const statusBadge = (status?: string) => {
        const map: Record<string, { label: string; bg: string }> = {
            created: { label: 'تم إنشاء الشحنة', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
            confirmed: { label: 'مؤكدة بانتظار التخصيص', bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
            assigned: { label: 'تم تعيين الموارد', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
            ready_for_pickup: { label: 'جاهزة للتحميل', bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
            in_transit: { label: 'في الطريق اللوجستي', bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
            delivered: { label: 'تم التسليم بنجاح', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
            cancelled: { label: 'ملغاة', bg: 'bg-rose-500/10 text-rose-600 border-rose-200' },
        };
        const st = map[status || 'created'] || { label: status || '', bg: 'bg-surface-muted text-body border-border' };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${st.bg}`}>
                {st.label}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPackage className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل الشحنة اللوجستية</h2>
                            <p className="text-xs text-body mt-0.5">عرض الموارد المعينة والمسار والتكلفة المالية للشحنة</p>
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

                    {/* Shipment Identity Card */}
                    <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <span className="text-xs text-body block font-medium">رقم الشحنة</span>
                            <h3 className="text-lg font-extrabold text-accent font-latin">{shipment.shipmentNumber}</h3>
                        </div>

                        <div>
                            {statusBadge(shipment.status)}
                        </div>
                    </div>

                    {/* Path & Cities Card */}
                    <div className="p-4 rounded-2xl bg-accent-soft/20 border border-accent-soft flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LuMapPin className="w-5 h-5 text-emerald-600" />
                            <div>
                                <span className="text-[10px] text-body block">نقطة الانطلاق</span>
                                <span className="text-sm font-extrabold text-heading">{shipment.origin}</span>
                            </div>
                        </div>

                        <div className="text-accent font-bold text-lg">➔</div>

                        <div className="flex items-center gap-2">
                            <LuMapPin className="w-5 h-5 text-rose-600" />
                            <div>
                                <span className="text-[10px] text-body block">وجهة الوصول</span>
                                <span className="text-sm font-extrabold text-heading">{shipment.destination}</span>
                            </div>
                        </div>
                    </div>

                    {/* Relational Resources Grid */}
                    <div className="space-y-3 border border-border rounded-2xl p-4 bg-surface">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuBuilding2 className="w-4 h-4 text-accent" />
                                الشركة المشتركة المالكة:
                            </span>
                            <span className="text-xs font-bold text-heading">{companyName}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuTruck className="w-4 h-4 text-accent" />
                                الناقل الشريك المخصص:
                            </span>
                            <span className="text-xs font-bold text-heading">{carrierName}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuBox className="w-4 h-4 text-accent" />
                                المركبة المخصصة:
                            </span>
                            <span className="text-xs font-bold text-heading font-latin">{vehicleType}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuCoins className="w-4 h-4 text-body/60" />
                                تكلفة الشحن الفعلي:
                            </span>
                            <span className="text-xs font-bold text-heading font-latin">{shipment.shippingCost} ر.س</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuCoins className="w-4 h-4 text-emerald-600" />
                                سعر الفاتورة للعميل:
                            </span>
                            <span className="text-xs font-bold text-emerald-600 font-latin">{shipment.customerPrice} ر.س</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuCalendar className="w-4 h-4 text-body/60" />
                                تاريخ الإنشاء بالمنصة:
                            </span>
                            <span className="text-xs font-bold text-heading">
                                {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
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
