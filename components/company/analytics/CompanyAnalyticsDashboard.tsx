/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyAnalyticsTab } from '@/hooks/company/useCompanyAnalytics';
import CompanyAnalyticsSkeleton from './CompanyAnalyticsSkeleton';
import toast from 'react-hot-toast';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import {
    LuWallet,
    LuTrendingUp,
    LuTrendingDown,
    LuCoins,
    LuReceipt,
    LuTruck,
    LuShieldCheck,
    LuShieldAlert,
    LuCalendar,
    LuDownload,
    LuRefreshCw,
    LuChartPie,
    LuChartBar,
    LuChartLine,
    LuCheck,
    LuClock,
    LuTag,
    LuFileCheck,
    LuFileText
} from 'react-icons/lu';

export default function CompanyAnalyticsDashboard() {
    const [activeTab, setActiveTab] = useState<'financial' | 'operational' | 'expenses' | 'tax'>('financial');

    // Date Range Filter States (Default to Today's Date)
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    // Summary Top Cards Query
    const {
        data: summaryResponse,
        isLoading: isLoadingSummary,
        refetch: refetchSummary,
    } = useCompanyAnalyticsTab("summary", startDate, endDate, true);

    const {
        data: tabResponse,
        isLoading: isLoadingTab,
        isFetching: isFetchingTab,
        refetch: refetchTab,
    } = useCompanyAnalyticsTab(activeTab, startDate, endDate, true);

    // Summary Data Extract
    const summaryData = summaryResponse?.data || {};
    const revenue = Number(summaryData.revenue || 0);
    const expenses = Number(summaryData.expenses || 0);
    const netProfit = Number(summaryData.netProfit || 0);
    const profitMargin = Number(summaryData.profitMargin || 0);
    const revenueChange = Number(summaryData.changes?.revenueChange || 0);
    const expenseChange = Number(summaryData.changes?.expenseChange || 0);
    const alerts = summaryData.alerts || {};

    // Date Preset Handlers
    const handlePresetToday = () => {
        setStartDate(todayStr);
        setEndDate(todayStr);
        setDatePreset('today');
    };

    const handlePresetMonth = () => {
        const now = new Date();
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        setStartDate(firstDay);
        setEndDate(todayStr);
        setDatePreset('month');
    };

    const handlePresetAll = () => {
        setStartDate('');
        setEndDate('');
        setDatePreset('all');
    };

    const handleExportReport = (type: 'pdf' | 'excel') => {
        toast.success(`Exporting analytics report as (${type.toUpperCase()})...`);
    };

    // Color Palette for Pie Charts using Accent System
    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
        <div className="space-y-6 text-left">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-body flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuChartPie className="w-5 h-5" />
                        </span>
                        Financial & Operational Analytics Dashboard
                    </h1>
                    <p className="text-xs text-body mt-1">Track company KPIs, profitability, fleet efficiency, and VAT tax filings</p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => handleExportReport('pdf')}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-border bg-surface hover:bg-surface-muted transition-all font-bold text-xs text-body shadow-xs cursor-pointer"
                    >
                        <LuDownload className="w-4 h-4 text-accent" />
                        <span>Export Report</span>
                    </button>

                    <button
                        onClick={() => {
                            refetchSummary();
                            refetchTab();
                        }}
                        disabled={isLoadingSummary || isFetchingTab}
                        title="Refresh Dashboard Data"
                        className="p-2.5 rounded-md border border-border bg-surface hover:bg-surface-muted text-body hover:text-body transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`text-sm font-bold ${(isLoadingSummary || isFetchingTab) ? 'animate-spin text-accent' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Date Range Filter Selector */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-body">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>Select Analytics Period:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Preset Buttons */}
                    <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-md border border-border">
                        <button
                            onClick={handlePresetToday}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'today'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-body'
                                }`}
                        >
                            Today (Auto)
                        </button>
                        <button
                            onClick={handlePresetMonth}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'month'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-body'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={handlePresetAll}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'all'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-body'
                                }`}
                        >
                            All Periods
                        </button>
                    </div>

                    {/* Manual Date Range Inputs */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-body">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setDatePreset('all');
                            }}
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs font-latin text-body focus:outline-none focus:border-accent"
                        />
                        <span className="text-xs text-body">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setDatePreset('all');
                            }}
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs font-latin text-body focus:outline-none focus:border-accent"
                        />
                    </div>
                </div>
            </div>

            {/* Critical Alert Banners if any */}
            {alerts.overdueCount > 0 && (
                <div className="p-3.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <LuShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                            <strong>Overdue Invoices Warning:</strong> Your company has <strong>{alerts.overdueCount}</strong> overdue invoices with a total value of <strong>({alerts.overdueSum.toFixed(2)} SAR)</strong> requiring follow-up with clients.
                        </span>
                    </div>
                </div>
            )}

            {/* Fixed Top Executive 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Net Profit Card */}
                <div className="border border-border rounded-md p-5 bg-surface shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-body">Net Operating Profit</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${netProfit >= 0 ? 'bg-accent/10 text-accent' : 'bg-accent/10 text-accent'}`}>
                            <LuWallet className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className={`text-2xl font-extrabold font-latin text-body`}>
                        {netProfit.toFixed(2)} SAR
                    </h3>
                    <div className="flex items-center justify-between text-xs text-body pt-1">
                        <span>Profit Margin: <b className="font-latin text-body">{profitMargin}%</b></span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent font-latin">
                            <LuTrendingUp className="w-3 h-3" />
                            Net Profitability
                        </span>
                    </div>
                </div>

                {/* Gross Revenue Card */}
                <div className="border border-border rounded-md p-5 bg-surface shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-body">Gross Revenue (Invoices)</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-body font-latin">
                        {revenue.toFixed(2)} SAR
                    </h3>
                    <div className="flex items-center justify-between text-xs text-body pt-1">
                        <span>Change vs Period:</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold font-latin ${revenueChange >= 0 ? 'text-accent' : 'text-rose-600'}`}>
                            {revenueChange >= 0 ? <LuTrendingUp className="w-3 h-3" /> : <LuTrendingDown className="w-3 h-3" />}
                            {revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`}
                        </span>
                    </div>
                </div>

                {/* Operating Expenses Card */}
                <div className="border border-border rounded-md p-5 bg-surface shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-body">Total Operating Expenses</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuCoins className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-body font-latin">
                        {expenses.toFixed(2)} SAR
                    </h3>
                    <div className="flex items-center justify-between text-xs text-body pt-1">
                        <span>Change vs Period:</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold font-latin ${expenseChange <= 0 ? 'text-accent' : 'text-rose-600'}`}>
                            {expenseChange <= 0 ? <LuTrendingDown className="w-3 h-3" /> : <LuTrendingUp className="w-3 h-3" />}
                            {expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}
                        </span>
                    </div>
                </div>

                {/* Profit Margin % Card */}
                <div className="border border-border rounded-md p-5 bg-surface shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-body">Operating Efficiency Ratio</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuTrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-body font-latin">
                        {profitMargin}%
                    </h3>
                    <div className="flex items-center justify-between text-xs text-body pt-1">
                        <span>Tax Status:</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-body">
                            <LuShieldCheck className="w-3.5 h-3.5" />
                            {alerts.vatRate}% Applied
                        </span>
                    </div>
                </div>

            </div>

            <div className="border-b border-border flex items-center gap-2">
                <button
                    onClick={() => setActiveTab('financial')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'financial'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-body hover:bg-surface-muted/50'
                        }`}
                >
                    <LuReceipt className="w-4 h-4" />
                    <span>Financial</span>
                </button>

                <button
                    onClick={() => setActiveTab('operational')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'operational'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-body hover:bg-surface-muted/50'
                        }`}
                >
                    <LuTruck className="w-4 h-4" />
                    <span>Operational</span>
                </button>

                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'expenses'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-body hover:bg-surface-muted/50'
                        }`}
                >
                    <LuCoins className="w-4 h-4" />
                    <span>Expenses</span>
                </button>

                <button
                    onClick={() => setActiveTab('tax')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'tax'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-body hover:bg-surface-muted/50'
                        }`}
                >
                    <LuShieldCheck className="w-4 h-4" />
                    <span>Tax & VAT</span>
                </button>
            </div>

            {/* TAB CONTENT (With Tab-based Lazy Loading Skeleton) */}
            {isLoadingTab ? (
                <CompanyAnalyticsSkeleton />
            ) : (
                <div className="animate-in fade-in duration-200">

                    {/* FINANCIAL */}
                    {activeTab === 'financial' && (
                        <div className="space-y-6">
                            {/* Detailed Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Paid & Collected Invoices</span>
                                    <h4 className="text-xl font-extrabold text-body font-latin">
                                        {(tabResponse?.data?.paidTotal || 0).toFixed(2)} SAR
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">{tabResponse?.data?.paidCount || 0} invoices</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Issued & Pending Invoices</span>
                                    <h4 className="text-xl font-extrabold text-body font-latin">
                                        {(tabResponse?.data?.issuedTotal || 0).toFixed(2)} SAR
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">{tabResponse?.data?.issuedCount || 0} invoices</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Overdue Invoices</span>
                                    <h4 className="text-xl font-extrabold text-body font-latin">
                                        {(tabResponse?.data?.overdueTotal || 0).toFixed(2)} SAR
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">{tabResponse?.data?.overdueCount || 0} invoices</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Financial Collection Rate</span>
                                    <h4 className="text-xl font-extrabold text-body font-latin">
                                        {tabResponse?.data?.collectionRate || 0}%
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">Avg Invoice: {(tabResponse?.data?.avgInvoiceValue || 0).toFixed(2)} SAR</span>
                                </div>
                            </div>

                            {/* Monthly Revenue Chart */}
                            <div className="border border-border rounded-md p-5 bg-surface space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <h3 className="text-sm font-bold text-body flex items-center gap-2">
                                        <LuChartLine className="w-4 h-4 text-accent" />
                                        Revenue Growth Over Time
                                    </h3>
                                    <span className="text-xs text-body">Net Revenue</span>
                                </div>
                                <div className="h-72 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={tabResponse?.data?.monthlyRevenueChart || []}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(val: any) => [`${val} SAR`, 'Revenue']} />
                                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OPERATIONAL */}
                    {activeTab === 'operational' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Total Completed Shipments</span>
                                    <h4 className="text-2xl font-extrabold text-body font-latin">
                                        {tabResponse?.data?.totalShipments || 0} shipments
                                    </h4>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Average Revenue Per Shipment</span>
                                    <h4 className="text-2xl font-extrabold text-accent font-latin">
                                        {(tabResponse?.data?.avgRevPerShipment || 0).toFixed(2)} SAR
                                    </h4>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Average Profit Per Shipment</span>
                                    <h4 className="text-2xl font-extrabold text-accent font-latin">
                                        {(tabResponse?.data?.avgProfitPerShipment || 0).toFixed(2)} SAR
                                    </h4>
                                </div>
                            </div>

                            {/* Monthly Shipments Chart */}
                            <div className="border border-border rounded-md p-5 bg-surface space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <h3 className="text-sm font-bold text-body flex items-center gap-2">
                                        <LuChartBar className="w-4 h-4 text-accent" />
                                        Shipments Growth Chart
                                    </h3>
                                    <span className="text-xs text-body">Trip Count</span>
                                </div>
                                <div className="h-72 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={tabResponse?.data?.monthlyShipmentsChart || []}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(val: any) => [`${val} shipments`, 'Count']} />
                                            <Bar dataKey="shipmentsCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EXPENSES */}
                    {activeTab === 'expenses' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Total Expense Spending</span>
                                    <h4 className="text-2xl font-extrabold text-rose-600 font-latin">
                                        {(tabResponse?.data?.totalExpensesSum || 0).toFixed(2)} SAR
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">{tabResponse?.data?.totalExpensesCount || 0} vouchers</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Top Expense Category</span>
                                    <h4 className="text-xl font-extrabold text-body">
                                        {tabResponse?.data?.topExpenseCategory || 'None'}
                                    </h4>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">Average Expense Per Shipment</span>
                                    <h4 className="text-2xl font-extrabold text-amber-600 font-latin">
                                        {(tabResponse?.data?.avgExpensePerShipment || 0).toFixed(2)} SAR
                                    </h4>
                                </div>
                            </div>

                            {/* Expenses Category Doughnut Chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 border border-border rounded-md p-5 bg-surface space-y-4">
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <h3 className="text-sm font-bold text-body flex items-center gap-2">
                                            <LuChartPie className="w-4 h-4 text-rose-500" />
                                            Expenses Breakdown by Category
                                        </h3>
                                    </div>
                                    <div className="h-64 w-full pt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={tabResponse?.data?.categoriesChart || []}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    label={(entry: any) => `${entry.name} (${entry.percentage}%)`}
                                                >
                                                    {(tabResponse?.data?.categoriesChart || []).map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(val: any) => [`${val} SAR`, 'Amount']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Side List of Categories */}
                                <div className="border border-border rounded-md p-5 bg-surface space-y-3">
                                    <h3 className="text-xs font-bold text-body border-b border-border pb-2">
                                        Expense Details
                                    </h3>
                                    <div className="space-y-2.5">
                                        {(tabResponse?.data?.categoriesChart || []).map((cat: any, i: number) => (
                                            <div key={cat.name} className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-2 font-bold text-body">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                                                    {cat.name}
                                                </span>
                                                <span className="font-latin text-body font-bold">{cat.value.toFixed(2)} SAR</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAX */}
                    {activeTab === 'tax' && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-between text-xs text-body">
                                <div className="flex items-center gap-2.5">
                                    <LuShieldCheck className="w-5 h-5 text-accent shrink-0" />
                                    <span>
                                        <strong>VAT Registration Status: </strong>
                                        {tabResponse?.data?.taxNumber ? (
                                            <span className="text-accent font-bold">Registered with official VAT number ({tabResponse?.data?.taxNumber})</span>
                                        ) : (
                                            <span className="text-amber-600 font-bold">Exemption Rate (0%) - {tabResponse?.data?.vatExemptionReason || 'Not VAT registered'}</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                                    <span className="text-xs text-body font-bold">Output Sales VAT</span>
                                    <h4 className="text-2xl font-extrabold text-body font-latin">
                                        {(tabResponse?.data?.outputVat || 0).toFixed(2)} SAR
                                    </h4>
                                    <span className="text-[11px] text-body block">Collected from invoices ({tabResponse?.data?.vatRate}%)</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                                    <span className="text-xs text-body font-bold">Input Purchases VAT</span>
                                    <h4 className="text-2xl font-extrabold text-accent font-latin">
                                        {(tabResponse?.data?.inputVat || 0).toFixed(2)} SAR
                                    </h4>
                                    <span className="text-[11px] text-body block">Paid in expenses and deductible</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                                    <span className="text-xs text-body font-bold">Net Payable VAT to Tax Authority</span>
                                    <h4 className="text-2xl font-extrabold text-accent font-latin">
                                        {(tabResponse?.data?.netPayableVat || 0).toFixed(2)} SAR
                                    </h4>
                                    <span className="text-[11px] text-body block">(Output VAT - Input VAT)</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
}
