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
    // 0. Active Tab ('financial' | 'operational' | 'expenses' | 'tax')
    const [activeTab, setActiveTab] = useState<'financial' | 'operational' | 'expenses' | 'tax'>('financial');

    // 1. Date Range Filter States (Default to Today's Date)
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    // 2. Summary Top Cards Query (Loads immediately)
    const {
        data: summaryResponse,
        isLoading: isLoadingSummary,
        refetch: refetchSummary,
    } = useCompanyAnalyticsTab("summary", startDate, endDate, true);

    // 3. Tab-specific Query (Lazy loaded only for active tab)
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
        toast.success(`جاري تصدير تقرير التحليلات بصيغة (${type.toUpperCase()})...`);
    };

    // Color Palette for Pie Charts using Accent System
    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuChartPie className="w-5 h-5" />
                        </span>
                        لوحة التحليلات والتقارير المالية والتشغيلية
                    </h1>
                    <p className="text-xs text-body mt-1">متابعة مؤشرات أداء الشركة، الربحية، كفاءة الأسطول، وإقرارات الزكاة والدخل (ZATCA)</p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => handleExportReport('pdf')}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-border bg-surface hover:bg-surface-muted transition-all font-bold text-xs text-heading shadow-xs cursor-pointer"
                    >
                        <LuDownload className="w-4 h-4 text-accent" />
                        <span>تصدير TBD</span>
                    </button>

                    <button
                        onClick={() => {
                            refetchSummary();
                            refetchTab();
                        }}
                        disabled={isLoadingSummary || isFetchingTab}
                        title="تحديث بيانات اللوحة"
                        className="p-2.5 rounded-md border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`text-sm font-bold ${(isLoadingSummary || isFetchingTab) ? 'animate-spin text-accent' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Date Range Filter Selector */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-heading">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>تحديد الفترة التحليلية:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Preset Buttons */}
                    <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-md border border-border">
                        <button
                            onClick={handlePresetToday}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'today'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-heading'
                                }`}
                        >
                            اليوم (تلقائي)
                        </button>
                        <button
                            onClick={handlePresetMonth}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'month'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-heading'
                                }`}
                        >
                            هذا الشهر
                        </button>
                        <button
                            onClick={handlePresetAll}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'all'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-heading'
                                }`}
                        >
                            جميع الفترات
                        </button>
                    </div>

                    {/* Manual Date Range Inputs */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-body">من:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setDatePreset('all');
                            }}
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs font-latin text-heading focus:outline-none focus:border-accent"
                        />
                        <span className="text-xs text-body">إلى:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setDatePreset('all');
                            }}
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs font-latin text-heading focus:outline-none focus:border-accent"
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
                            <strong>تنبيه الفواتير المتأخرة:</strong> توجد لشركتك <strong>{alerts.overdueCount}</strong> فواتير متأخرة السداد بقيمة إجمالية <strong>({alerts.overdueSum.toFixed(2)} ر.س)</strong> تستوجب المتابعة مع العملاء.
                        </span>
                    </div>
                </div>
            )}

            {/* Fixed Top Executive 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Net Profit Card */}
                <div className="border border-border rounded-md p-5 bg-surface shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-body">صافي الربح التشغيلي</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                            <LuWallet className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className={`text-2xl font-extrabold font-latin ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {netProfit.toFixed(2)} ر.س
                    </h3>
                    <div className="flex items-center justify-between text-xs text-body pt-1">
                        <span>هامش الربح: <b className="font-latin text-heading">{profitMargin}%</b></span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 font-latin">
                            <LuTrendingUp className="w-3 h-3" />
                            صافي الربحية
                        </span>
                    </div>
                </div>

                {/* Gross Revenue Card */}
                <div className="border border-border rounded-md p-5 bg-surface shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-body">إجمالي الإيرادات (الفواتير)</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-heading font-latin">
                        {revenue.toFixed(2)} ر.س
                    </h3>
                    <div className="flex items-center justify-between text-xs text-body pt-1">
                        <span>التغير مقارنة بالفترة:</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold font-latin ${revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {revenueChange >= 0 ? <LuTrendingUp className="w-3 h-3" /> : <LuTrendingDown className="w-3 h-3" />}
                            {revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`}
                        </span>
                    </div>
                </div>

                {/* Operating Expenses Card */}
                <div className="border border-border rounded-md p-5 bg-surface shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-body">إجمالي المصروفات</span>
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                            <LuCoins className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-rose-600 font-latin">
                        {expenses.toFixed(2)} ر.س
                    </h3>
                    <div className="flex items-center justify-between text-xs text-body pt-1">
                        <span>التغير مقارنة بالفترة:</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold font-latin ${expenseChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {expenseChange <= 0 ? <LuTrendingDown className="w-3 h-3" /> : <LuTrendingUp className="w-3 h-3" />}
                            {expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}
                        </span>
                    </div>
                </div>

                {/* Profit Margin % Card */}
                <div className="border border-border rounded-md p-5 bg-surface shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-body">نسبة كفاءة التشغيل</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuTrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-accent font-latin">
                        {profitMargin}%
                    </h3>
                    <div className="flex items-center justify-between text-xs text-body pt-1">
                        <span>حالة الضريبة ZATCA:</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent">
                            <LuShieldCheck className="w-3.5 h-3.5" />
                            {alerts.vatRate}% مطبقة
                        </span>
                    </div>
                </div>

            </div>

            {/* 4 Tabs Navigation Bar */}
            <div className="border-b border-border flex items-center gap-2">
                <button
                    onClick={() => setActiveTab('financial')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'financial'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-heading hover:bg-surface-muted/50'
                        }`}
                >
                    <LuReceipt className="w-4 h-4" />
                    <span>📊 التبويب المالي (Financial)</span>
                </button>

                <button
                    onClick={() => setActiveTab('operational')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'operational'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-heading hover:bg-surface-muted/50'
                        }`}
                >
                    <LuTruck className="w-4 h-4" />
                    <span>🚛 التبويب التشغيلي (Operational)</span>
                </button>

                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'expenses'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-heading hover:bg-surface-muted/50'
                        }`}
                >
                    <LuCoins className="w-4 h-4" />
                    <span>💸 تبويب المصروفات (Expenses)</span>
                </button>

                <button
                    onClick={() => setActiveTab('tax')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'tax'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-heading hover:bg-surface-muted/50'
                        }`}
                >
                    <LuShieldCheck className="w-4 h-4" />
                    <span>🏛️ التبويب الضريبي (ZATCA Tax)</span>
                </button>
            </div>

            {/* TAB CONTENT (With Tab-based Lazy Loading Skeleton) */}
            {isLoadingTab ? (
                <CompanyAnalyticsSkeleton />
            ) : (
                <div className="animate-in fade-in duration-200">

                    {/* ======================================================== */}
                    {/*  FINANCIAL (المالي) */}
                    {/* ======================================================== */}
                    {activeTab === 'financial' && (
                        <div className="space-y-6">
                            {/* Detailed Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">فواتير مدفوعة ومحصلة</span>
                                    <h4 className="text-xl font-extrabold text-emerald-600 font-latin">
                                        {(tabResponse?.data?.paidTotal || 0).toFixed(2)} ر.س
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">عدد {tabResponse?.data?.paidCount || 0} فاتورة</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">فواتير صادرة ومعلقة</span>
                                    <h4 className="text-xl font-extrabold text-sky-600 font-latin">
                                        {(tabResponse?.data?.issuedTotal || 0).toFixed(2)} ر.س
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">عدد {tabResponse?.data?.issuedCount || 0} فاتورة</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">فواتير متأخرة السداد</span>
                                    <h4 className="text-xl font-extrabold text-rose-600 font-latin">
                                        {(tabResponse?.data?.overdueTotal || 0).toFixed(2)} ر.س
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">عدد {tabResponse?.data?.overdueCount || 0} فاتورة</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">معدل التحصيل المالي</span>
                                    <h4 className="text-xl font-extrabold text-accent font-latin">
                                        {tabResponse?.data?.collectionRate || 0}%
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">متوسط الفاتورة: {(tabResponse?.data?.avgInvoiceValue || 0).toFixed(2)} ر.س</span>
                                </div>
                            </div>

                            {/* Monthly Revenue Chart */}
                            <div className="border border-border rounded-md p-5 bg-surface space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <h3 className="text-sm font-bold text-heading flex items-center gap-2">
                                        <LuChartLine className="w-4 h-4 text-accent" />
                                        نمو الإيرادات التحصيلية بالفترات (Monthly Revenue Chart)
                                    </h3>
                                    <span className="text-xs text-body">الإيراد الصافي</span>
                                </div>
                                <div className="h-72 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={tabResponse?.data?.monthlyRevenueChart || []}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(val: any) => [`${val} ر.س`, 'الإيراد']} />
                                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/*  OPERATIONAL (التشغيلي والأسطول) */}
                    {/* ======================================================== */}
                    {activeTab === 'operational' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">إجمالي الشحنات المنفذة</span>
                                    <h4 className="text-2xl font-extrabold text-heading font-latin">
                                        {tabResponse?.data?.totalShipments || 0} شحنة
                                    </h4>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">متوسط إيراد الشحنة الواحدة</span>
                                    <h4 className="text-2xl font-extrabold text-accent font-latin">
                                        {(tabResponse?.data?.avgRevPerShipment || 0).toFixed(2)} ر.س
                                    </h4>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">متوسط ربحية الشحنة الواحدة</span>
                                    <h4 className="text-2xl font-extrabold text-emerald-600 font-latin">
                                        {(tabResponse?.data?.avgProfitPerShipment || 0).toFixed(2)} ر.س
                                    </h4>
                                </div>
                            </div>

                            {/* Monthly Shipments Chart */}
                            <div className="border border-border rounded-md p-5 bg-surface space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-3">
                                    <h3 className="text-sm font-bold text-heading flex items-center gap-2">
                                        <LuChartBar className="w-4 h-4 text-accent" />
                                        معدل الشحنات المنفذة (Shipments Growth Chart)
                                    </h3>
                                    <span className="text-xs text-body">عدد الرحلات</span>
                                </div>
                                <div className="h-72 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={tabResponse?.data?.monthlyShipmentsChart || []}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(val: any) => [`${val} شحنة`, 'العدد']} />
                                            <Bar dataKey="shipmentsCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/*  EXPENSES (المصروفات) */}
                    {/* ======================================================== */}
                    {activeTab === 'expenses' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">إجمالي نفقات المصروفات</span>
                                    <h4 className="text-2xl font-extrabold text-rose-600 font-latin">
                                        {(tabResponse?.data?.totalExpensesSum || 0).toFixed(2)} ر.س
                                    </h4>
                                    <span className="text-xs text-body mt-1 block">عدد {tabResponse?.data?.totalExpensesCount || 0} سند صرف</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">أعلى تصنيف نفقات</span>
                                    <h4 className="text-xl font-extrabold text-heading">
                                        {tabResponse?.data?.topExpenseCategory || 'لا يوجد'}
                                    </h4>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface">
                                    <span className="text-xs text-body font-bold block mb-1">متوسط مصروف الشحنة</span>
                                    <h4 className="text-2xl font-extrabold text-amber-600 font-latin">
                                        {(tabResponse?.data?.avgExpensePerShipment || 0).toFixed(2)} ر.س
                                    </h4>
                                </div>
                            </div>

                            {/* Expenses Category Doughnut Chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 border border-border rounded-md p-5 bg-surface space-y-4">
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <h3 className="text-sm font-bold text-heading flex items-center gap-2">
                                            <LuChartPie className="w-4 h-4 text-rose-500" />
                                            توزيع المصروفات حسب التصنيف (Expenses Doughnut Chart)
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
                                                <Tooltip formatter={(val: any) => [`${val} ر.س`, 'المبلغ']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Side List of Categories */}
                                <div className="border border-border rounded-md p-5 bg-surface space-y-3">
                                    <h3 className="text-xs font-bold text-heading border-b border-border pb-2">
                                        تفاصيل النفقات
                                    </h3>
                                    <div className="space-y-2.5">
                                        {(tabResponse?.data?.categoriesChart || []).map((cat: any, i: number) => (
                                            <div key={cat.name} className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-2 font-bold text-heading">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                                                    {cat.name}
                                                </span>
                                                <span className="font-latin text-body font-bold">{cat.value.toFixed(2)} ر.س</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/*  TAX (ZATCA الإقرار الضريبي) */}
                    {/* ======================================================== */}
                    {activeTab === 'tax' && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-between text-xs text-heading">
                                <div className="flex items-center gap-2.5">
                                    <LuShieldCheck className="w-5 h-5 text-accent shrink-0" />
                                    <span>
                                        <strong>حالة التسجيل الضريبي بـ ZATCA: </strong>
                                        {tabResponse?.data?.taxNumber ? (
                                            <span className="text-emerald-600 font-bold">مسجل برقم ضريبي رسمي ({tabResponse?.data?.taxNumber})</span>
                                        ) : (
                                            <span className="text-amber-600 font-bold">نسبة إعفاء (0%) - {tabResponse?.data?.vatExemptionReason || 'غير مسجل رقم ضريبي'}</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                                    <span className="text-xs text-body font-bold">ضريبة المبيعات الصادرة (Output VAT)</span>
                                    <h4 className="text-2xl font-extrabold text-heading font-latin">
                                        {(tabResponse?.data?.outputVat || 0).toFixed(2)} ر.س
                                    </h4>
                                    <span className="text-[11px] text-body block">المجمعة من الفواتير ({tabResponse?.data?.vatRate}%)</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                                    <span className="text-xs text-body font-bold">ضريبة المشتريات المخصومة (Input VAT)</span>
                                    <h4 className="text-2xl font-extrabold text-emerald-600 font-latin">
                                        {(tabResponse?.data?.inputVat || 0).toFixed(2)} ر.س
                                    </h4>
                                    <span className="text-[11px] text-body block">المسددة في المصروفات والقابلة للاسترداد</span>
                                </div>

                                <div className="p-4 rounded-md border border-border bg-surface space-y-1">
                                    <span className="text-xs text-body font-bold">صافي الضريبة الواجب دفعها للهيئة</span>
                                    <h4 className="text-2xl font-extrabold text-accent font-latin">
                                        {(tabResponse?.data?.netPayableVat || 0).toFixed(2)} ر.س
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
