/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useCompanySubscription } from "@/hooks/subscriptions/useSubscriptions";
import { LuCreditCard, LuPackageCheck, LuBoxes, LuTriangle, LuCheck, LuX } from "react-icons/lu";

interface AdminCompanySubscriptionWidgetProps {
    companyId: string;
    compact?: boolean;
}

export default function AdminCompanySubscriptionWidget({
    companyId,
    compact = false,
}: AdminCompanySubscriptionWidgetProps) {
    const { data: subRes, isLoading } = useCompanySubscription(companyId);

    if (!companyId) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="p-3 bg-surface-muted/60 border border-border rounded-xl animate-pulse space-y-2 dir-rtl">
                <div className="h-3 bg-surface-muted rounded w-40"></div>
                <div className="h-2 bg-surface-muted rounded w-full"></div>
            </div>
        );
    }

    const subData = subRes?.data;
    if (!subData) return null;

    const {
        hasActiveSubscription,
        planName,
        statusStr,
        shipmentsCount,
        ordersCount,
        features,
    } = subData;

    const isNearShipmentsLimit = (shipmentsCount?.pct || 0) >= 90;
    const isNearOrdersLimit = (ordersCount?.pct || 0) >= 90;

    if (compact) {
        return (
            <div className="p-3 rounded-xl bg-surface border border-border space-y-2 dir-rtl text-xs">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-heading flex items-center gap-1.5">
                        <LuCreditCard className="w-4 h-4 text-accent" />
                        {planName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasActiveSubscription
                            ? isNearShipmentsLimit || isNearOrdersLimit
                                ? "bg-warning-soft text-warning"
                                : "bg-success-soft text-success"
                            : "bg-error-soft text-error"
                    }`}>
                        {statusStr}
                    </span>
                </div>

                {hasActiveSubscription && (
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/60">
                        <div>
                            <span className="text-[10px] text-body block mb-0.5">الشحنات: {shipmentsCount.used} / {shipmentsCount.max}</span>
                            <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${isNearShipmentsLimit ? "bg-warning" : "bg-accent"}`}
                                    style={{ width: `${shipmentsCount.pct}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-body block mb-0.5">الطلبات: {ordersCount.used} / {ordersCount.max}</span>
                            <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${isNearOrdersLimit ? "bg-warning" : "bg-accent"}`}
                                    style={{ width: `${ordersCount.pct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3.5 dir-rtl">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold">
                        <LuCreditCard className="w-5 h-5" />
                    </span>
                    <div>
                        <h4 className="text-xs font-extrabold text-heading">باقة الشركة الحالية: {planName}</h4>
                        <p className="text-[11px] text-body">متابعة الحصة والرصيد المتبقي لإكمال العمليات اللوجستية.</p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    hasActiveSubscription
                        ? isNearShipmentsLimit || isNearOrdersLimit
                            ? "bg-warning-soft text-warning border border-warning/20"
                            : "bg-success-soft text-success border border-success/20"
                        : "bg-error-soft text-error border border-error/20"
                }`}>
                    {statusStr}
                </span>
            </div>

            {hasActiveSubscription ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Shipments Quota Bar */}
                        <div className="p-3 bg-surface-muted/50 rounded-xl border border-border space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-heading flex items-center gap-1">
                                    <LuPackageCheck className="w-3.5 h-3.5 text-accent" /> الشحنات الشهرية
                                </span>
                                <span className="font-mono font-bold text-heading">
                                    {shipmentsCount.used} / {shipmentsCount.max} ({shipmentsCount.pct}%)
                                </span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        shipmentsCount.pct >= 90 ? "bg-warning" : "bg-accent"
                                    }`}
                                    style={{ width: `${shipmentsCount.pct}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-body block">
                                المتبقي للشركة: <b className="text-heading font-mono">{shipmentsCount.remaining}</b> شحنة هذا الشهر
                            </span>
                        </div>

                        {/* Orders Quota Bar */}
                        <div className="p-3 bg-surface-muted/50 rounded-xl border border-border space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-heading flex items-center gap-1">
                                    <LuBoxes className="w-3.5 h-3.5 text-accent" /> الطلبات الشهرية
                                </span>
                                <span className="font-mono font-bold text-heading">
                                    {ordersCount.used} / {ordersCount.max} ({ordersCount.pct}%)
                                </span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        ordersCount.pct >= 90 ? "bg-warning" : "bg-accent"
                                    }`}
                                    style={{ width: `${ordersCount.pct}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-body block">
                                المتبقي للشركة: <b className="text-heading font-mono">{ordersCount.remaining}</b> طلب هذا الشهر
                            </span>
                        </div>
                    </div>

                    {/* Features Flags Badges */}
                    {features && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-bold">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                features.hasZatcaInvoicing ? "bg-success-soft text-success" : "bg-surface-muted text-body"
                            }`}>
                                {features.hasZatcaInvoicing ? <LuCheck className="w-3 h-3" /> : <LuX className="w-3 h-3" />}
                                فوترة ZATCA
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                features.hasWaybillPdfExport ? "bg-success-soft text-success" : "bg-surface-muted text-body"
                            }`}>
                                {features.hasWaybillPdfExport ? <LuCheck className="w-3 h-3" /> : <LuX className="w-3 h-3" />}
                                بوالص PDF
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                features.hasBulkExcelImport ? "bg-success-soft text-success" : "bg-surface-muted text-body"
                            }`}>
                                {features.hasBulkExcelImport ? <LuCheck className="w-3 h-3" /> : <LuX className="w-3 h-3" />}
                                استيراد Excel
                            </span>
                        </div>
                    )}
                </>
            ) : (
                <div className="p-3 rounded-xl bg-error-soft/40 border border-error/20 flex items-center gap-2 text-xs text-error font-semibold">
                    <LuTriangle className="w-4 h-4 shrink-0" />
                    <span>تنبيه: هذه الشركة لا تملك اشتراكاً نشطاً في قاعدة البيانات حالياً.</span>
                </div>
            )}
        </div>
    );
}
