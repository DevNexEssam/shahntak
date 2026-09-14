"use client";

import React from 'react';
import { useCompanySubscriptionStatus } from '@/hooks/company/useCompanySubscriptionStatus';
import { LuTriangleAlert, LuClock, LuShieldAlert } from 'react-icons/lu';

export function SubscriptionAlertBanner() {
    const { isExpired, isWarning, daysRemaining, planName, status, isLoading } = useCompanySubscriptionStatus();

    if (isLoading) return null;

    if (isExpired || status === 'expired' || status === 'cancelled') {
        return (
            <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-700 px-4 py-3 text-sm font-medium flex items-center justify-between gap-3 shadow-sm animate-pulse">
                <div className="flex items-center gap-2">
                    <LuShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
                    <span>
                        <strong className="font-bold">Subscription Expired:</strong> The company subscription has expired. All creation, editing, and deletion operations have been suspended until the subscription is renewed.
                    </span>
                </div>
                <span className="text-xs bg-rose-600 text-white px-3 py-1 rounded-md font-bold shrink-0">
                    Renew Now
                </span>
            </div>
        );
    }

    if (isWarning) {
        return (
            <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 px-4 py-2.5 text-sm font-medium flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <LuClock className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                        <strong className="font-bold">Subscription Expiring Soon:</strong> Only <span className="underline font-bold">{daysRemaining} day(s)</span> remaining on your ({planName}) subscription. Please renew to avoid service disruption.
                    </span>
                </div>
                <span className="text-xs bg-amber-600 text-white px-2.5 py-1 rounded font-bold shrink-0">
                    Proceed to Renewal
                </span>
            </div>
        );
    }

    if (status === 'no_subscription') {
        return (
            <div className="bg-sky-500/10 border-b border-sky-500/20 text-sky-800 px-4 py-2.5 text-sm font-medium flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <LuTriangleAlert className="w-4 h-4 shrink-0 text-sky-600" />
                    <span>
                        No active subscription is currently registered for your company account. Please contact system administration to select a suitable plan.
                    </span>
                </div>
            </div>
        );
    }

    return null;
}
