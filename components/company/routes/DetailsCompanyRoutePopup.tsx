"use client";

import React from 'react';
import {
    LuMapPin,
    LuX,
    LuTruck,
    LuCoins,
    LuClock,
    LuCheck,
    LuCalendar
} from 'react-icons/lu';

interface DetailsCompanyRoutePopupProps {
    isOpen?: boolean;
    routeData: any | null;
    onClose: () => void;
}

export default function DetailsCompanyRoutePopup({ isOpen = true, routeData, onClose }: DetailsCompanyRoutePopupProps) {
    if (!isOpen || !routeData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-arabic">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuMapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل المسار اللوجستي</h2>
                            <p className="text-xs text-body mt-0.5">معلومات خط النقل ({routeData.origin} ⬅️ {routeData.destination})</p>
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
                <div className="p-6 overflow-y-auto space-y-4 flex-1">

                    {/* Main Route Card */}
                    <div className="p-5 rounded-2xl bg-accent-soft/40 border border-accent/20 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">المسار والاتجاه</span>
                            <h3 className="text-lg font-extrabold text-heading flex items-center gap-2">
                                <LuMapPin className="w-5 h-5 text-accent" />
                                {routeData.origin} ⬅️ {routeData.destination}
                            </h3>
                        </div>

                        <div>
                            {routeData.isActive ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    <LuCheck className="w-3.5 h-3.5" />
                                    نشط وتشغيلي
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                    معطل مؤقتاً
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Grid Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                            <span className="text-xs text-body block mb-1 flex items-center gap-1.5 font-bold">
                                <LuTruck className="w-4 h-4 text-accent" />
                                نوع المركبة المخصص:
                            </span>
                            <span className="font-extrabold text-sm text-heading">{routeData.vehicleType}</span>
                        </div>

                        <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                            <span className="text-xs text-body block mb-1 flex items-center gap-1.5 font-bold">
                                <LuCoins className="w-4 h-4 text-emerald-600" />
                                السعر الأساسي:
                            </span>
                            <span className="font-extrabold text-sm text-emerald-600 font-latin">
                                {Number(routeData.basePrice || 0).toFixed(2)} ر.س
                            </span>
                        </div>

                        <div className="p-4 rounded-xl bg-surface-muted/60 border border-border">
                            <span className="text-xs text-body block mb-1 flex items-center gap-1.5 font-bold">
                                <LuClock className="w-4 h-4 text-body" />
                                زمن الترانزيت المتوقع:
                            </span>
                            <span className="font-bold text-sm text-heading">
                                {routeData.estimatedTransitTime || '—'}
                            </span>
                        </div>
                    </div>

                    {/* Date Details */}
                    <div className="p-4 rounded-xl bg-surface-muted/40 border border-border space-y-2 text-xs">
                        <div className="flex items-center justify-between text-body">
                            <span className="flex items-center gap-1.5 font-bold">
                                <LuCalendar className="w-4 h-4 text-accent" />
                                تاريخ إنشاء المسار:
                            </span>
                            <span className="font-latin text-heading font-bold">
                                {new Date(routeData.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
