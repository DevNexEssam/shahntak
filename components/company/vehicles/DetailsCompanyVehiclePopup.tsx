"use client";

import React from 'react';
import {
    LuTruck,
    LuX,
    LuWeight,
    LuBox
} from 'react-icons/lu';

interface DetailsCompanyVehiclePopupProps {
    isOpen?: boolean;
    onClose: () => void;
    vehicleData: any;
}

export default function DetailsCompanyVehiclePopup({ isOpen = true, onClose, vehicleData }: DetailsCompanyVehiclePopupProps) {
    if (!isOpen || !vehicleData) return null;

    const isActive = vehicleData.isActive !== false && vehicleData.status !== 'inactive';

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
                                <h2 className="text-base font-bold text-foreground">{vehicleData.type}</h2>
                                {isActive ? (
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">
                                        نشطة ومفعلة
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                                        متوقفة
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-latin">معرف المركبة: <span className="font-semibold text-accent">{vehicleData._id}</span></p>
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
                <div className="p-5 space-y-4 text-right">

                    {/* Summary Info Row */}
                    <div className="p-4 rounded-md bg-surface-muted border border-border flex items-center justify-between text-xs">
                        <div>
                            <span className="text-muted-foreground block">تاريخ التسجيل بالأسطول</span>
                            <span className="font-bold text-foreground font-latin text-sm">
                                {new Date(vehicleData.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                            </span>
                        </div>
                        <div className="text-left">
                            <span className="text-muted-foreground block font-medium">نوع المركبة</span>
                            <span className="font-bold text-foreground text-xs">{vehicleData.type}</span>
                        </div>
                    </div>

                    {/* Metrics Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuTruck className="w-4 h-4 text-accent" />
                            <span>مواصفات الحمولة والسعات التشغيلية</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <LuWeight className="w-4 h-4 text-accent" />
                                    الحمولة الوزنية القصوى
                                </span>
                                <span className="font-semibold text-foreground font-latin">{vehicleData.capacityWeight || 'غير محدد'} كجم</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <LuBox className="w-4 h-4 text-accent" />
                                    السعة الحجمية المتاحة
                                </span>
                                <span className="font-semibold text-foreground font-latin">{vehicleData.capacityVolume || 'غير محدد'} م³</span>
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
