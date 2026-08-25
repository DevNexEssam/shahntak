"use client";

import React from 'react';
import { Route, Carrier } from '@/types/data';
import {
    LuMapPin,
    LuX,
    LuTruck,
    LuCoins,
    LuClock,
    LuBuilding2,
    LuCalendar,
    LuArrowLeft
} from 'react-icons/lu';

interface DetailsRoutesProps {
    isOpen?: boolean;
    route: Route | null;
    onClose: () => void;
}

export default function DetailsRoutes({ isOpen = true, route, onClose }: DetailsRoutesProps) {
    if (!isOpen || !route) return null;

    const carrierName = typeof route.carrierId === 'object' && route.carrierId !== null
        ? (route.carrierId as Carrier).name
        : 'جميع الناقلين المتاحين';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuMapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل المسار اللوجستي</h2>
                            <p className="text-xs text-body mt-0.5">عرض اتجاه الخط النظيري والتسعيرة ونوع المركبة</p>
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

                    {/* Origin -> Destination Card */}
                    <div className="p-5 rounded-2xl bg-surface-muted border border-border flex items-center justify-between gap-4">
                        <div className="text-center flex-1">
                            <span className="text-xs text-body font-medium block mb-1">نقطة الانطلاق</span>
                            <span className="text-lg font-extrabold text-heading">{route.origin}</span>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                            <LuArrowLeft className="w-5 h-5" />
                        </div>

                        <div className="text-center flex-1">
                            <span className="text-xs text-body font-medium block mb-1">وجهة الوصول</span>
                            <span className="text-lg font-extrabold text-heading">{route.destination}</span>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                            <span className="text-xs text-body font-medium flex items-center gap-1.5">
                                <LuTruck className="w-4 h-4 text-accent" />
                                نوع المركبة المطلوبة
                            </span>
                            <span className="text-sm font-bold text-heading block">{route.vehicleType}</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                            <span className="text-xs text-body font-medium flex items-center gap-1.5">
                                <LuCoins className="w-4 h-4 text-emerald-600" />
                                السعر الأساسي للمسار
                            </span>
                            <span className="text-sm font-bold text-emerald-600 font-latin block">{route.basePrice} ر.س</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                            <span className="text-xs text-body font-medium flex items-center gap-1.5">
                                <LuClock className="w-4 h-4 text-amber-600" />
                                وقت الترانزيت التقديري
                            </span>
                            <span className="text-sm font-bold text-heading block">
                                {route.estimatedTransitTime || 'غير محدد'}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                            <span className="text-xs text-body font-medium flex items-center gap-1.5">
                                <LuBuilding2 className="w-4 h-4 text-accent" />
                                الناقل المعين (Carrier)
                            </span>
                            <span className="text-sm font-bold text-heading block">{carrierName}</span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
                        <span className="text-xs font-bold text-body">حالة المسار اللوجستي:</span>
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                            route.isActive !== false
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                : 'bg-rose-500/10 text-rose-600 border-rose-200'
                        }`}>
                            {route.isActive !== false ? 'نشط ومتاح' : 'موقوف مؤقتاً'}
                        </span>
                    </div>

                    {/* Created Date */}
                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-body">
                        <div className="flex items-center gap-1.5">
                            <LuCalendar className="w-3.5 h-3.5 text-body/60" />
                            <span>تاريخ الإنشاء: {route.createdAt ? new Date(route.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
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
