/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyInvoices } from '@/hooks/company/useCompanyInvoice';
import { useCompanyExpenses } from '@/hooks/company/useCompanyExpenses';
import DetailsCompanyInvoicePopup from './DetailsCompanyInvoicePopup';
import EditCompanyInvoicePopup from './EditCompanyInvoicePopup';
import AddCompanyInvoicePopup from './AddCompanyInvoicePopup';
import AddExpensePopup from './AddExpensePopup';
import EditExpensePopup from './EditExpensePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import { defaultExpenseCategories } from '@/lib/validations/expense.schema';
import toast from 'react-hot-toast';
import {
    LuReceipt,
    LuSearch,
    LuRefreshCw,
    LuEye,
    LuChevronRight,
    LuChevronLeft,
    LuCheck,
    LuClock,
    LuCoins,
    LuPrinter,
    LuFileText,
    LuPencil,
    LuPlus,
    LuWallet,
    LuTrendingUp,
    LuTrendingDown,
    LuTag,
    LuCalendar,
    LuFilter
} from 'react-icons/lu';

export default function CompanyInvoices() {
    // 0. Active Tab State ('invoices' | 'expenses')
    const [activeTab, setActiveTab] = useState<'invoices' | 'expenses'>('invoices');

    // 1. Date Range Filter States (Default to TODAY's date)
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    // 2. Invoices States
    const [invoicePage, setInvoicePage] = useState(1);
    const limit = 10;
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<any | null>(null);
    const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<any | null>(null);
    const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);

    // 3. Expenses States
    const [expensePage, setExpensePage] = useState(1);
    const [expenseSearch, setExpenseSearch] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
    const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<any | null>(null);
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

    // 4. React Query Hooks with Date Range Filtering
    const {
        data: invoicesResponse,
        isLoading: isLoadingInvoices,
        isError: isErrorInvoices,
        error: invoiceError,
        isFetching: isFetchingInvoices,
        refetch: refetchInvoices,
    } = useCompanyInvoices(invoicePage, limit, invoiceSearch, startDate, endDate);

    const {
        data: expensesResponse,
        isLoading: isLoadingExpenses,
        isError: isErrorExpenses,
        error: expenseError,
        isFetching: isFetchingExpenses,
        refetch: refetchExpenses,
    } = useCompanyExpenses(expensePage, limit, expenseSearch, selectedCategoryFilter, startDate, endDate);

    if (isLoadingInvoices || isLoadingExpenses) return <Loading />;

    // --- Invoices Data ---
    const invoicesList = invoicesResponse?.data || [];
    const invoicePagination = invoicesResponse?.pagination;
    const totalInvoiceRecords = invoicePagination?.totalRecords || invoicesResponse?.count || 0;
    const totalInvoicePages = invoicePagination?.totalPages || Math.ceil(totalInvoiceRecords / limit) || 1;
    const invoiceServerStats = invoicesResponse?.stats;

    // --- Expenses Data ---
    const expensesList = expensesResponse?.data || [];
    const expensePagination = expensesResponse?.pagination;
    const totalExpenseRecords = expensePagination?.totalRecords || expensesResponse?.count || 0;
    const totalExpensePages = expensePagination?.totalPages || Math.ceil(totalExpenseRecords / limit) || 1;
    const totalExpensesAmount = Number(expensesResponse?.stats?.totalExpensesAmount || 0);

    // Calculate Invoices Revenue
    const totalInvoicesRevenue = invoicesList.reduce((acc: number, inv: any) => {
        return acc + Number(inv.total ?? inv.amount ?? inv.totalAmount ?? 0);
    }, 0);

    const netBalance = totalInvoicesRevenue - totalExpensesAmount;

    // Date Preset Handlers
    const handlePresetToday = () => {
        setStartDate(todayStr);
        setEndDate(todayStr);
        setDatePreset('today');
        setInvoicePage(1);
        setExpensePage(1);
    };

    const handlePresetMonth = () => {
        const now = new Date();
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        setStartDate(firstDay);
        setEndDate(todayStr);
        setDatePreset('month');
        setInvoicePage(1);
        setExpensePage(1);
    };

    const handlePresetAll = () => {
        setStartDate('');
        setEndDate('');
        setDatePreset('all');
        setInvoicePage(1);
        setExpensePage(1);
    };

    const handleInvoiceSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoiceSearch(e.target.value);
        setInvoicePage(1);
    };

    const handleExpenseSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpenseSearch(e.target.value);
        setExpensePage(1);
    };

    const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategoryFilter(e.target.value);
        setExpensePage(1);
    };

    const statusBadge = (status?: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        مسدد ومحصل
                    </span>
                );
            case 'issued':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        صادرة ومعلقة
                    </span>
                );
            case 'overdue':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        متأخرة السداد
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        مسودة
                    </span>
                );
        }
    };

    const handlePrintInvoice = (inv: any) => {
        toast.success(`جاري طباعة الفاتورة (${inv.invoiceNumber})...`);
        window.print();
    };

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuWallet className="w-5 h-5" />
                        </span>
                        المعاملات المالية والمصروفات
                    </h1>
                    <p className="text-xs text-body mt-1">إدارة فواتير المبيعات اللوجستية وتتبع نفقات الشحن والمصروفات التشغيلية لشركتك</p>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === 'invoices' ? (
                        <button
                            onClick={() => setIsAddInvoiceOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-all font-bold text-xs shadow-xs cursor-pointer"
                        >
                            <LuPlus className="w-4 h-4" />
                            <span>إنشاء فاتورة جديدة</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsAddExpenseOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-all font-bold text-xs shadow-xs cursor-pointer"
                        >
                            <LuPlus className="w-4 h-4" />
                            <span>تسجيل مصروف جديد</span>
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (activeTab === 'invoices') refetchInvoices();
                            else refetchExpenses();
                        }}
                        disabled={isFetchingInvoices || isFetchingExpenses}
                        title="تحديث البيانات"
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`text-sm font-bold ${(isFetchingInvoices || isFetchingExpenses) ? 'animate-spin text-accent' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {isErrorInvoices && (
                <div className="mb-4">
                    <ErrorMessege message={(invoiceError as any)?.message || 'تعذر جلب بيانات الفواتير من الخادم'} />
                </div>
            )}
            {isErrorExpenses && (
                <div className="mb-4">
                    <ErrorMessege message={(expenseError as any)?.message || 'تعذر جلب بيانات المصروفات من الخادم'} />
                </div>
            )}

            {/* Date Range Selector Header Bar */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-heading">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>تصفية الفترات المالية:</span>
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

                    {/* Date Inputs */}
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

            {/* KPI Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Invoices Revenue */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الفواتير الصادرة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{totalInvoiceRecords}</h3>
                            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-2">
                                <LuTrendingUp className="w-3.5 h-3.5" />
                                <span>{totalInvoicesRevenue.toFixed(2)} ر.س إيرادات</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Total Expenses Amount */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي المصروفات التشغيلية</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{totalExpenseRecords}</h3>
                            <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-2">
                                <LuTrendingDown className="w-3.5 h-3.5" />
                                <span>-{totalExpensesAmount.toFixed(2)} ر.س نفقات</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuCoins className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Net Operational Balance */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">صافي الرصيد التشغيلي</span>
                            <h3 className={`text-2xl font-extrabold my-1 font-latin ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {netBalance.toFixed(2)} ر.س
                            </h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>(الإيرادات - المصروفات)</span>
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${netBalance >= 0 ? 'bg-accent/10 text-accent' : 'bg-rose-500/10 text-rose-600'}`}>
                            <LuWallet className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Paid Invoices Count */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">فواتير محصلة ومسددة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{invoiceServerStats?.paid ?? 0}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تم تحصيلها بنجاح</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Navigation Tabs Header */}
            <div className="border-b border-border flex items-center gap-2">
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'invoices'
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-transparent text-body hover:text-heading hover:bg-surface-muted/50'
                        }`}
                >
                    <LuReceipt className="w-4 h-4" />
                    <span>فواتير الإيرادات</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent font-latin font-bold">
                        {totalInvoiceRecords}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`flex items-center gap-2.5 px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${activeTab === 'expenses'
                        ? 'border-rose-600 text-rose-600 bg-rose-500/5'
                        : 'border-transparent text-body hover:text-heading hover:bg-surface-muted/50'
                        }`}
                >
                    <LuCoins className="w-4 h-4" />
                    <span>سجل المصروفات</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-600 font-latin font-bold">
                        {totalExpenseRecords}
                    </span>
                </button>
            </div>

            {/* INVOICES TAB */}
            {activeTab === 'invoices' && (
                <div className="space-y-4 animate-in fade-in duration-150">

                    {/* Controller Header */}
                    <div className="bg-surface p-4 rounded-md border border-border flex items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                            <input
                                type="text"
                                value={invoiceSearch}
                                onChange={handleInvoiceSearch}
                                placeholder="بحث برقم الفاتورة..."
                                className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>

                    {/* Data Table View */}
                    <div className="bg-surface rounded-md border border-border overflow-hidden">
                        {invoicesList.length === 0 ? (
                            <div className="p-12 text-center">
                                <EmptyData message="لا توجد فواتير مسجلة للشركة تطابق خيارات البحث والتاريخ الحالية" icon={LuReceipt} />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                            <th className="py-3.5 px-4">رقم الفاتورة</th>
                                            <th className="py-3.5 px-4">تاريخ الإصدار</th>
                                            <th className="py-3.5 px-4">المبلغ قبل الضريبة</th>
                                            <th className="py-3.5 px-4">الضريبة (VAT)</th>
                                            <th className="py-3.5 px-4">الإجمالي الكلي</th>
                                            <th className="py-3.5 px-4">الحالة</th>
                                            <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border font-medium">
                                        {invoicesList.map((inv: any) => {
                                            const grand = Number(inv.total ?? inv.amount ?? inv.totalAmount ?? 0);
                                            const snapshot = inv.taxRateSnapshot !== undefined ? Number(inv.taxRateSnapshot) : 15;
                                            const subtotal = inv.subtotal ?? (grand / (1 + snapshot / 100));
                                            const vat = inv.vatAmount ?? (grand - subtotal);

                                            return (
                                                <tr key={inv._id} className="hover:bg-surface-muted/40 transition-colors">
                                                    <td className="py-3.5 px-4 font-latin font-bold text-accent">
                                                        {inv.invoiceNumber}
                                                    </td>

                                                    <td className="py-3.5 px-4 font-latin text-xs text-heading">
                                                        {new Date(inv.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                                                    </td>

                                                    <td className="py-3.5 px-4 font-latin text-xs font-bold text-heading">
                                                        {subtotal.toFixed(2)} ر.س
                                                    </td>

                                                    <td className="py-3.5 px-4 font-latin text-xs text-amber-600 font-bold">
                                                        {vat.toFixed(2)} ر.س
                                                        <span className="text-[10px] text-body mr-1">({snapshot}%)</span>
                                                    </td>

                                                    <td className="py-3.5 px-4 font-latin text-xs font-extrabold text-emerald-600">
                                                        {grand.toFixed(2)} ر.س
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        {statusBadge(inv.status)}
                                                    </td>

                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => handlePrintInvoice(inv)}
                                                                title="طباعة الفاتورة"
                                                                className="p-2 rounded-md bg-accent-soft hover:bg-accent hover:text-white text-accent border border-accent/20 transition-all cursor-pointer"
                                                            >
                                                                <LuPrinter className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                onClick={() => setSelectedInvoiceForDetails(inv)}
                                                                title="عرض التفاصيل"
                                                                className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                            >
                                                                <LuEye className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                onClick={() => setSelectedInvoiceForEdit(inv)}
                                                                title={inv.status === 'paid' ? 'فاتورة محصلة لا يمكن تعديلها' : 'تعديل الفاتورة'}
                                                                className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer disabled:opacity-40"
                                                            >
                                                                <LuPencil className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Invoice Pagination */}
                        {totalInvoicePages > 1 && (
                            <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs font-bold text-body">
                                <span className="text-body font-medium">
                                    عرض الصفحة <b className="font-latin text-heading">{invoicePage}</b> من <b className="font-latin text-heading">{totalInvoicePages}</b> (إجمالي {totalInvoiceRecords} فاتورة)
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setInvoicePage((p) => Math.max(p - 1, 1))}
                                        disabled={invoicePage === 1}
                                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        <LuChevronRight className="w-4 h-4" />
                                        <span>السابق</span>
                                    </button>

                                    <button
                                        onClick={() => setInvoicePage((p) => Math.min(p + 1, totalInvoicePages))}
                                        disabled={invoicePage === totalInvoicePages}
                                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        <span>التالي</span>
                                        <LuChevronLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/*  EXPENSES TAB */}
            {activeTab === 'expenses' && (
                <div className="space-y-4 animate-in fade-in duration-150">

                    {/* Controller Header */}
                    <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="relative w-full md:w-80">
                            <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                            <input
                                type="text"
                                value={expenseSearch}
                                onChange={handleExpenseSearch}
                                placeholder="بحث بعنوان المصروف أو الرقم..."
                                className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-rose-500"
                            />
                        </div>

                        {/* Category Filter Dropdown */}
                        <div className="flex items-center gap-2">
                            <LuTag className="w-4 h-4 text-rose-500 shrink-0" />
                            <span className="text-xs font-bold text-heading whitespace-nowrap">التصنيف:</span>
                            <select
                                value={selectedCategoryFilter}
                                onChange={handleCategoryFilterChange}
                                className="px-3 py-2 rounded-md bg-surface-muted border border-border text-xs font-bold text-heading focus:outline-none focus:border-rose-500 cursor-pointer"
                            >
                                <option value="all">كل التصنيفات</option>
                                {defaultExpenseCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Expenses Table */}
                    <div className="bg-surface rounded-md border border-border overflow-hidden">
                        {expensesList.length === 0 ? (
                            <div className="p-12 text-center">
                                <EmptyData message="لا توجد مصروفات مسجلة تطابق خيارات البحث والتصنيف والتاريخ الحالية" icon={LuCoins} />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                            <th className="py-3.5 px-4">عنوان / بيان المصروف</th>
                                            <th className="py-3.5 px-4">التصنيف</th>
                                            <th className="py-3.5 px-4">رقم الإيصال</th>
                                            <th className="py-3.5 px-4">التاريخ</th>
                                            <th className="py-3.5 px-4">المبلغ (ر.س)</th>
                                            <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border font-medium">
                                        {expensesList.map((exp: any) => (
                                            <tr key={exp._id} className="hover:bg-surface-muted/40 transition-colors">
                                                <td className="py-3.5 px-4 font-bold text-heading">
                                                    <div>{exp.title}</div>
                                                    {exp.notes && (
                                                        <div className="text-[11px] font-normal text-body mt-0.5 truncate max-w-xs">
                                                            {exp.notes}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-surface-muted border border-border text-heading">
                                                        {exp.category}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 font-latin text-xs text-body">
                                                    {exp.receiptNumber || '—'}
                                                </td>

                                                <td className="py-3.5 px-4 font-latin text-xs text-heading">
                                                    {new Date(exp.expenseDate || exp.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                                                </td>

                                                <td className="py-3.5 px-4 font-latin text-sm font-extrabold text-rose-600">
                                                    {Number(exp.amount || 0).toFixed(2)} ر.س
                                                </td>

                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        onClick={() => setSelectedExpenseForEdit(exp)}
                                                        title="تعديل أو حذف المصروف"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Expense Pagination */}
                        {totalExpensePages > 1 && (
                            <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs font-bold text-body">
                                <span className="text-body font-medium">
                                    عرض الصفحة <b className="font-latin text-heading">{expensePage}</b> من <b className="font-latin text-heading">{totalExpensePages}</b> (إجمالي {totalExpenseRecords} مصروف)
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setExpensePage((p) => Math.max(p - 1, 1))}
                                        disabled={expensePage === 1}
                                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        <LuChevronRight className="w-4 h-4" />
                                        <span>السابق</span>
                                    </button>

                                    <button
                                        onClick={() => setExpensePage((p) => Math.min(p + 1, totalExpensePages))}
                                        disabled={expensePage === totalExpensePages}
                                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        <span>التالي</span>
                                        <LuChevronLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* Invoices Modals */}
            <AddCompanyInvoicePopup
                isOpen={isAddInvoiceOpen}
                onClose={() => setIsAddInvoiceOpen(false)}
            />

            <DetailsCompanyInvoicePopup
                isOpen={!!selectedInvoiceForDetails}
                invoiceData={selectedInvoiceForDetails}
                onClose={() => setSelectedInvoiceForDetails(null)}
            />

            <EditCompanyInvoicePopup
                isOpen={!!selectedInvoiceForEdit}
                invoiceData={selectedInvoiceForEdit}
                onClose={() => setSelectedInvoiceForEdit(null)}
            />

            {/* Expenses Modals */}
            <AddExpensePopup
                isOpen={isAddExpenseOpen}
                onClose={() => setIsAddExpenseOpen(false)}
            />

            <EditExpensePopup
                isOpen={!!selectedExpenseForEdit}
                expenseData={selectedExpenseForEdit}
                onClose={() => setSelectedExpenseForEdit(null)}
            />

        </div>
    );
}
