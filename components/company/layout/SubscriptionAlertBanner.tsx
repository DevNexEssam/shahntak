"use client";

import React from 'react';
import { useCompanySubscriptionStatus } from '@/hooks/company/useCompanySubscriptionStatus';
import { LuTriangleAlert, LuClock, LuShieldAlert } from 'react-icons/lu';

export function SubscriptionAlertBanner() {
    const { isExpired, isWarning, daysRemaining, planName, status, isLoading } = useCompanySubscriptionStatus();

    if (isLoading) return null;

    // 1. Expired Subscription Banner (Red Alert)
    if (isExpired || status === 'expired' || status === 'cancelled') {
        return (
            <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-700 px-4 py-3 text-sm font-medium flex items-center justify-between gap-3 shadow-sm animate-pulse">
                <div className="flex items-center gap-2">
                    <LuShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
                    <span>
                        <strong className="font-bold">تنبيه انتهاء الاشتراك:</strong> انتهت صلاحية اشتراك المنشأة. تم توقيف كافة عمليات الإضافة والتعديل والحذف تلقائياً لحين تجديد الاشتراك.
                    </span>
                </div>
                <span className="text-xs bg-rose-600 text-white px-3 py-1 rounded-md font-bold shrink-0">
                    تجديد الآن
                </span>
            </div>
        );
    }

    // 2. Warning Subscription Banner (Yellow Alert - 5 days or less)
    if (isWarning) {
        return (
            <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 px-4 py-2.5 text-sm font-medium flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <LuClock className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                        <strong className="font-bold">اقتراب انتهاء الاشتراك:</strong> متبقي <span className="underline font-bold">{daysRemaining} أيام</span> على انتهاء اشتراك باقة ({planName}). يرجى التجديد لتجنب توقف الخدمات.
                    </span>
                </div>
                <span className="text-xs bg-amber-600 text-white px-2.5 py-1 rounded font-bold shrink-0">
                    متابعة التجديد
                </span>
            </div>
        );
    }

    // 3. No Subscription Banner
    if (status === 'no_subscription') {
        return (
            <div className="bg-sky-500/10 border-b border-sky-500/20 text-sky-800 px-4 py-2.5 text-sm font-medium flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <LuTriangleAlert className="w-4 h-4 shrink-0 text-sky-600" />
                    <span>
                        لا يوجد اشتراك نشط مسجل لحساب المنشأة حالياً. يرجى التواصل مع إدارة النظام لاختيار الباقة المناسبة.
                    </span>
                </div>
            </div>
        );
    }

    return null;
}
