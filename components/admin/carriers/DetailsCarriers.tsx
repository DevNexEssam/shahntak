"use client";

import React from 'react';
import { Carrier } from '@/types/data';
import {
    LuTruck,
    LuX,
    LuPhone,
    LuMail,
    LuCalendar,
    LuLayers,
    LuCheck,
    LuX as LuCloseIcon
} from 'react-icons/lu';

interface DetailsCarriersProps {
    isOpen?: boolean;
    carrier: Carrier | null;
    onClose: () => void;
}

export default function DetailsCarriers({ isOpen = true, carrier, onClose }: DetailsCarriersProps) {
    if (!isOpen || !carrier) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل بيانات الناقل</h2>
                            <p className="text-xs text-body mt-0.5">عرض معلومات التشغيل والربط والتواصل للناقل الشريك</p>
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

                    {/* Carrier Top Identity Card */}
                    <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center font-bold">
                                <LuTruck className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">اسم الناقل</span>
                                <h3 className="text-base font-extrabold text-heading">{carrier.name}</h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                carrier.isActive !== false
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                    : 'bg-rose-500/10 text-rose-600 border-rose-200'
                            }`}>
                                {carrier.isActive !== false ? (
                                    <span className="flex items-center gap-1">
                                        <LuCheck className="w-3 h-3" /> نشط
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <LuCloseIcon className="w-3 h-3" /> موقوف
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-4 border border-border rounded-2xl p-4 bg-surface">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuLayers className="w-4 h-4 text-accent" />
                                نوع الربط والتشغيل:
                            </span>
                            <span className="text-sm font-bold text-heading">
                                {carrier.type === 'external_api' ? 'ربط خارجي عبر البرمجيات (API)' : 'ناقل محلي مباشر'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuPhone className="w-4 h-4 text-accent" />
                                هاتف التواصل:
                            </span>
                            <span className="text-sm font-bold text-heading font-latin">
                                {carrier.contactPhone || 'غير محدد'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuMail className="w-4 h-4 text-accent" />
                                البريد الإلكتروني:
                            </span>
                            <span className="text-sm font-bold text-heading font-latin">
                                {carrier.contactEmail || 'غير محدد'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-body font-semibold flex items-center gap-2">
                                <LuCalendar className="w-4 h-4 text-body/60" />
                                تاريخ التسجيل بالمنصة:
                            </span>
                            <span className="text-xs font-bold text-heading">
                                {carrier.createdAt ? new Date(carrier.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
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
