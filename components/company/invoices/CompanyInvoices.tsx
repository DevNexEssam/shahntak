/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyInvoices } from '@/hooks/company/useCompanyInvoice';
import DetailsCompanyInvoicePopup from './DetailsCompanyInvoicePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
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
    LuFileText
} from 'react-icons/lu';

export default function CompanyInvoices() {
    // 1. Pagination & Search States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // 2. Control States
    const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<any | null>(null);

    // 3. Custom React Query Hook for Company Invoices
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCompanyInvoices(page, limit, searchQuery);

    if (isLoading) return <Loading />;

    const invoicesList = responseData?.data || [];
    const pagination = responseData?.pagination;
    const totalRecords = pagination?.totalRecords || responseData?.count || 0;
    const totalPages = pagination?.totalPages || Math.ceil(totalRecords / limit) || 1;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const serverStats = responseData?.stats;
    const stats = {
        total: serverStats?.total ?? totalRecords,
        paid: serverStats?.paid ?? 0,
        issued: serverStats?.issued ?? 0,
        overdue: serverStats?.overdue ?? 0,
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
                            <LuReceipt className="w-5 h-5" />
                        </span>
                        البوالص والفواتير المالية
                    </h1>
                    <p className="text-xs text-body mt-1">عرض وتتبع الفواتير اللوجستية والضريبية والتحصيلات الصادرة لشركتك</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="تحديث البيانات"
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`text-sm font-bold ${isFetching ? 'animate-spin text-accent' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error Notification */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'تعذر جلب بيانات الفواتير من الخادم'} />
                </div>
            )}

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الفواتير</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>مسجلة لشركتك</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">فواتير مدفوعة ومحصلة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.paid}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تم سدادها بنجاح</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">صادرة ومعلقة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.issued}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>في انتظار التحصيل</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuFileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">متأخرة السداد</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.overdue}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تستوجب المتابعة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث برقم الفاتورة..."
                        className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {invoicesList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا توجد فواتير مسجلة للشركة تطابق خيارات البحث الحالية" icon={LuReceipt} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">رقم الفاتورة</th>
                                    <th className="py-3.5 px-4">تاريخ الإصدار</th>
                                    <th className="py-3.5 px-4">المبلغ قبل الضريبة</th>
                                    <th className="py-3.5 px-4">الضريبة (VAT 15%)</th>
                                    <th className="py-3.5 px-4">الإجمالي الكلي</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {invoicesList.map((inv: any) => {
                                    const subtotal = Number(inv.total ?? inv.amount ?? inv.totalAmount ?? 0);
                                    const vat = inv.taxAmount ?? (subtotal * 0.15);
                                    const grand = inv.grandTotal ?? (subtotal + vat);

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
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs font-bold text-body">
                        <span className="text-body font-medium">
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} فاتورة)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronRight className="w-4 h-4" />
                                <span>السابق</span>
                            </button>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <span>التالي</span>
                                <LuChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <DetailsCompanyInvoicePopup
                isOpen={!!selectedInvoiceForDetails}
                invoiceData={selectedInvoiceForDetails}
                onClose={() => setSelectedInvoiceForDetails(null)}
            />

        </div>
    );
}
