"use client";

import React from 'react';
import Link from 'next/link';
import { FaAngleRight } from 'react-icons/fa6';
import {
    LuBuilding2,
    LuPackageCheck,
    LuCircleDollarSign,
    LuTrendingUp,
    LuArrowUpRight,
    LuUsers,
    LuRefreshCw,
} from 'react-icons/lu';
import {
    useAdminKPIs,
    useAdminTopCompanies,
    useAdminUrgentAlerts,
} from "@/hooks/admin/useAdminDashboard";
import {
    AdminKPIsSkeleton,
    AdminTopCompaniesSkeleton,
    AdminAlertsSkeleton,
} from "@/components/admin/dashboard/AdminDashboardSkeleton";

export default function AdminDashboardPage() {
    const {
        data: kpisRes,
        isLoading: isKpisLoading,
        refetch: refetchKPIs,
        isFetching: isKpisFetching,
    } = useAdminKPIs();

    const {
        data: topCompaniesRes,
        isLoading: isTopCompaniesLoading,
    } = useAdminTopCompanies();

    const {
        data: alertsRes,
        isLoading: isAlertsLoading,
    } = useAdminUrgentAlerts();

    const kpis = kpisRes?.data;
    const topCompanies = topCompaniesRes?.data || [];
    const alerts = alertsRes?.data || [];

    return (
        <div className="space-y-8" dir="ltr">

            {/* Page Title & Refresh Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">Main Operations Center</h1>
                    <p className="text-sm text-body mt-1">A real-time overview of the performance of all shipping companies registered on the Shahntak platform.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetchKPIs()}
                        disabled={isKpisFetching}
                        className="text-xs font-semibold text-body bg-surface hover:bg-surface-muted px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                        <LuRefreshCw className={`w-3.5 h-3.5 ${isKpisFetching ? "animate-spin text-accent" : ""}`} />
                        <span>{isKpisFetching ? "Refreshing..." : "Refresh Data"}</span>
                    </button>
                </div>
            </div>

            {/* Section 1: Core Platform Metrics (KPIs) */}
            {isKpisLoading ? (
                <AdminKPIsSkeleton />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                    {/* Total Companies */}
                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <span className="w-12 h-12 rounded-md bg-accent-soft text-accent flex items-center justify-center">
                                <LuBuilding2 className="w-6 h-6" />
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                (kpis?.companiesGrowthPct || 0) >= 0
                                    ? "text-success bg-success-soft"
                                    : "text-error bg-error-soft"
                            }`}>
                                <LuTrendingUp className="w-3 h-3" />
                                {kpis?.companiesGrowthPct && kpis.companiesGrowthPct > 0 ? `+${kpis.companiesGrowthPct}%` : `${kpis?.companiesGrowthPct || 0}%`}
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-body block mb-1">Active Registered Companies</span>
                        <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">
                            {(kpis?.totalCompanies || 0).toLocaleString('en-US')} companies
                        </b>
                    </div>

                    {/* Total Shipments Today */}
                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <span className="w-12 h-12 rounded-md bg-accent-soft text-accent flex items-center justify-center">
                                <LuPackageCheck className="w-6 h-6" />
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                (kpis?.shipmentsGrowthPct || 0) >= 0
                                    ? "text-success bg-success-soft"
                                    : "text-error bg-error-soft"
                            }`}>
                                <LuTrendingUp className="w-3 h-3" />
                                {kpis?.shipmentsGrowthPct && kpis.shipmentsGrowthPct > 0 ? `+${kpis.shipmentsGrowthPct}%` : `${kpis?.shipmentsGrowthPct || 0}%`}
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-body block mb-1">Today's Shipments (All Companies)</span>
                        <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">
                            {(kpis?.todayShipments || 0).toLocaleString('en-US')}
                        </b>
                    </div>

                    {/* Platform Monthly Revenue */}
                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <span className="w-12 h-12 rounded-md bg-accent-soft text-accent flex items-center justify-center">
                                <LuCircleDollarSign className="w-6 h-6" />
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                (kpis?.revenueGrowthPct || 0) >= 0
                                    ? "text-success bg-success-soft"
                                    : "text-error bg-error-soft"
                            }`}>
                                <LuTrendingUp className="w-3 h-3" />
                                {kpis?.revenueGrowthPct && kpis.revenueGrowthPct > 0 ? `+${kpis.revenueGrowthPct}%` : `${kpis?.revenueGrowthPct || 0}%`}
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-body block mb-1">Subscription Revenue (Monthly)</span>
                        <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">
                            {(kpis?.monthlyRevenue || 0).toLocaleString('en-US')} <span className="text-xs font-normal">SAR</span>
                        </b>
                    </div>

                    {/* Active Drivers Platform-wide */}
                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <span className="w-12 h-12 rounded-md bg-accent-soft text-accent flex items-center justify-center">
                                <LuUsers className="w-6 h-6" />
                            </span>
                            <span className="text-xs font-bold text-success bg-success-soft px-2 py-0.5 rounded-full">
                                Active Now
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-body block mb-1">Total Fleet & Vehicles</span>
                        <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">
                            {(kpis?.activeDrivers || 0).toLocaleString('en-US')} vehicles
                        </b>
                    </div>

                </div>
            )}

            {/* Main Grid: Progressive Loading Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Section 2: Companies Performance Table (2 cols) */}
                <div className="lg:col-span-2">
                    {isTopCompaniesLoading ? (
                        <AdminTopCompaniesSkeleton />
                    ) : (
                        <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-base font-extrabold text-heading">Most Active Shipping Companies</h2>
                                    <p className="text-xs text-body mt-0.5">Companies ranked by daily shipments and plan usage.</p>
                                </div>
                                <Link
                                    href="/admin/companies"
                                    className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                                >
                                    View All Companies <LuArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-body text-xs">
                                            <th className="pb-3 font-bold">Company</th>
                                            <th className="pb-3 font-bold">Plan</th>
                                            <th className="pb-3 font-bold">Today's Shipments</th>
                                            <th className="pb-3 font-bold">Plan Usage</th>
                                            <th className="pb-3 font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {topCompanies.length > 0 ? (
                                            topCompanies.map((co) => (
                                                <tr key={co._id} className="hover:bg-surface-muted/50 transition-colors">
                                                    <td className="py-3.5 font-bold text-heading">{co.companyName}</td>
                                                    <td className="py-3.5 text-xs text-body font-semibold">{co.planName}</td>
                                                    <td className="py-3.5 font-latin font-bold text-heading">{co.todayShipments.toLocaleString('en-US')}</td>
                                                    <td className="py-3.5">
                                                        <div className="w-24 bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
                                                            <div
                                                                className={`h-full rounded-full ${co.usagePct >= 90 ? 'bg-warning' : 'bg-accent'}`}
                                                                style={{ width: `${co.usagePct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-body mt-0.5 block">{co.usagePct}%</span>
                                                    </td>
                                                    <td className="py-3.5">
                                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                                            co.status === 'Active'
                                                                ? 'bg-success-soft text-success'
                                                                : 'bg-warning-soft text-warning'
                                                        }`}>
                                                            {co.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-6 text-center text-xs text-body">
                                                    No registered company data available at the moment
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 3: Operational Alerts & System Health (1 col) */}
                <div className="space-y-5">

                    {/* Action Required Card */}
                    {isAlertsLoading ? (
                        <AdminAlertsSkeleton />
                    ) : (
                        <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs">
                            <div className="flex items-center gap-2 mb-4 text-heading">
                                <FaAngleRight className="w-5 h-5 text-warning" />
                                <h2 className="text-base font-extrabold">Urgent Platform Alerts</h2>
                            </div>

                            <div className="space-y-3.5">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-3.5 rounded-md border ${
                                            alert.type === "warning"
                                                ? "bg-warning-soft/60 border-warning/20"
                                                : alert.type === "error"
                                                ? "bg-error-soft/60 border-error/20"
                                                : "bg-surface-muted border-border"
                                        }`}
                                    >
                                        <span className="block text-xs font-bold text-heading mb-1">{alert.title}</span>
                                        <p className="text-xs text-body leading-relaxed">
                                            {alert.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Platform Controls */}
                    <div className="bg-heading text-white rounded-2xl p-6 shadow-md">
                        <h3 className="font-extrabold text-sm mb-2 text-white">Quick Platform Actions</h3>
                        <p className="text-xs text-white/60 mb-4">Comprehensive controls for operations and infrastructure.</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href="/admin/invoices"
                                className="p-2.5 rounded-md bg-white/10 hover:bg-white/15 text-xs font-bold text-center transition-colors block text-white"
                            >
                                Generate Monthly Invoices
                            </Link>
                            <Link
                                href="/admin/reports"
                                className="p-2.5 rounded-md bg-white/10 hover:bg-white/15 text-xs font-bold text-center transition-colors block text-white"
                            >
                                Export Full Report
                            </Link>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}