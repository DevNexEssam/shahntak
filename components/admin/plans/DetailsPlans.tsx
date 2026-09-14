"use client";

import React from 'react';
import { Plan } from '@/types/data';
import {
    LuCreditCard,
    LuX,
    LuCoins,
    LuCheck,
    LuLayers,
    LuBox,
    LuUsers
} from 'react-icons/lu';

interface DetailsPlansProps {
    isOpen?: boolean;
    plan: Plan | null;
    onClose: () => void;
}

export default function DetailsPlans({ isOpen = true, plan, onClose }: DetailsPlansProps) {
    if (!isOpen || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuCreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">{plan.name}</h2>
                            <p className="text-xs text-body mt-0.5">تفاصيل وميزات الباقة السحابية والحدود المتاحة</p>
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

                {/* Details Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-right">
                    {/* Price Banner */}
                    <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-body block">السعر ودورة الفوترة</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-black text-accent font-latin">{plan.price.toLocaleString('ar-SA')}</span>
                                <span className="text-sm font-bold text-heading">ر.س / {plan.billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${plan.isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                            {plan.isActive ? 'باقة نشطة' : 'معطلة'}
                        </span>
                    </div>

                    {/* Quota Limits Grid */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-surface-muted border border-border">
                            <LuBox className="w-5 h-5 text-accent mx-auto mb-1" />
                            <span className="text-xs font-bold text-body block">الطلبات/شهر</span>
                            <span className="text-base font-extrabold text-heading font-latin">
                                {plan.maxOrdersPerMonth === -1 ? 'غير محدود' : plan.maxOrdersPerMonth}
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-surface-muted border border-border">
                            <LuLayers className="w-5 h-5 text-accent mx-auto mb-1" />
                            <span className="text-xs font-bold text-body block">الشحنات/شهر</span>
                            <span className="text-base font-extrabold text-heading font-latin">
                                {plan.maxShipmentsPerMonth === -1 ? 'غير محدود' : plan.maxShipmentsPerMonth}
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-surface-muted border border-border">
                            <LuUsers className="w-5 h-5 text-accent mx-auto mb-1" />
                            <span className="text-xs font-bold text-body block">الموظفين</span>
                            <span className="text-base font-extrabold text-heading font-latin">{plan.maxCompanyUsers}</span>
                        </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 pt-2 border-t border-border">
                        <span className="text-xs font-bold text-heading block">الميزات المتاحة في الباقة:</span>
                        <div className="space-y-2">
                            {plan.features && plan.features.length > 0 ? (
                                plan.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-heading">
                                        <LuCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>{feat}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-body">لا توجد ميزات مسجلة خاصة لهذه الباقة.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border bg-surface-muted/40 flex justify-end">
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
