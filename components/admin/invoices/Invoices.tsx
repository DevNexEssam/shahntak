"use client";

import React, { useState } from 'react';
import { Invoice, Company } from '@/types/data';
import { useInvoices, useDeleteInvoice } from '@/hooks/invoices/useInvoices';
import AddInvoices from './AddInvoices';
import EditInvoices from './EditInvoices';
import DetailsInvoices from './DetailsInvoices';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import {
    LuReceipt,
    LuPlus,
    LuSearch,
    LuRefreshCw,
    LuPencil,
    LuEye,
    LuTrash2,
    LuChevronRight,
    LuChevronLeft,
    LuBuilding2,
    LuFilter,
    LuCoins,
    LuClock,
    LuCheck,
    LuFileText
} from 'react-icons/lu';

export default function Invoices() {
    // 1. Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // 2. Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);
    const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<Invoice | null>(null);
    const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState<Invoice | null>(null);

    // 3. React Query Hooks
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useInvoices(page, limit);
    const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

    // 4. Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

    const invoicesList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Rule 2: Always setPage(1) on search/filter changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value);
        setPage(1);
    };

    // Client side filtering over current page
    const filteredInvoices = invoicesList.filter((inv) => {
        const companyName = typeof inv.companyId === 'object' && inv.companyId !== null
            ? (inv.companyId as Company).companyName
            : '';

        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            companyName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Financial Stats Calculation
    const totalCollected = invoicesList
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.total || 0), 0);

    const totalPending = invoicesList
        .filter(i => i.status === 'issued' || i.status === 'overdue' || i.status === 'draft')
        .reduce((sum, i) => sum + (i.total || 0), 0);

    const handleDeleteConfirm = () => {
        if (!selectedInvoiceForDelete) return;
        deleteInvoice(
            { id: selectedInvoiceForDelete._id, hard: false },
            {
                onSuccess: () => {
                    setSelectedInvoiceForDelete(null);
                },
            }
        );
    };

    const statusBadge = (status?: string) => {
        const map = {
            draft: { label: 'مسودة', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
            issued: { label: 'صادرة / معلقة', bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
            paid: { label: 'مدفوعة ومحصلة', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
            overdue: { label: 'متأخرة السداد', bg: 'bg-rose-500/10 text-rose-600 border-rose-200' },
            cancelled: { label: 'ملغاة', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
        }[status || 'draft'] || { label: status, bg: 'bg-surface-muted text-body border-border' };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${map.bg}`}>
                {map.label}
            </span>
        );
    };

    return (
        <div className="space-y-6" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuReceipt className="w-5 h-5" />
                        </span>
                        البوالص والفواتير المالية
                    </h1>
                    <p className="text-xs text-body mt-1">متابعة الفواتير المفوترة ورسوم الاستهلاك والتحصيل المالي بالمنصة</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="إعادة جلب البيانات"
                        className="p-2.5 rounded-xl bg-surface border border-border text-body hover:text-heading hover:bg-surface-muted transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-accent' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إصدار فاتورة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center justify-between">
                    <span>تعذر جلب بيانات الفواتير: {(error as any)?.message || 'حدث خطأ في الاتصال بالخادم'}</span>
                    <button onClick={() => refetch()} className="underline text-xs cursor-pointer">إعادة المحاولة</button>
                </div>
            )}

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <LuReceipt className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">إجمالي الفواتير</span>
                        <span className="text-2xl font-extrabold text-heading font-latin">{totalRecords || invoicesList.length}</span>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <LuCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">المحصل بنجاح</span>
                        <span className="text-2xl font-extrabold text-emerald-600 font-latin">{totalCollected.toLocaleString()} <span className="text-xs font-normal">ر.س</span></span>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <LuClock className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">معلق بانتظار التحصيل</span>
                        <span className="text-2xl font-extrabold text-amber-600 font-latin">{totalPending.toLocaleString()} <span className="text-xs font-normal">ر.س</span></span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Controller Header */}
            <div className="bg-surface p-4 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث برقم الفاتورة، اسم الشركة..."
                        className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-2xl border border-border w-full md:w-auto">
                        <LuFilter className="w-4 h-4 text-body shrink-0" />
                        <select
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            className="bg-transparent text-sm text-heading font-bold focus:outline-none cursor-pointer w-full"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="issued">صادرة / معلقة (Issued)</option>
                            <option value="paid">مدفوعة (Paid)</option>
                            <option value="draft">مسودة (Draft)</option>
                            <option value="overdue">متأخرة (Overdue)</option>
                            <option value="cancelled">ملغاة (Cancelled)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">
                {filteredInvoices.length === 0 ? (
                    <div className="p-8">
                        <EmptyData message="لا توجد فواتير تطابق خيارات البحث أو التصفية الحالية" icon={LuReceipt} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-4 px-6">رقم الفاتورة</th>
                                    <th className="py-4 px-6">الشركة المفلتر لها</th>
                                    <th className="py-4 px-6">إجمالي المبلغ</th>
                                    <th className="py-4 px-6">تاريخ الاستحقاق</th>
                                    <th className="py-4 px-6">الحالة</th>
                                    <th className="py-4 px-6 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-sm">
                                {filteredInvoices.map((inv) => {
                                    const compName = typeof inv.companyId === 'object' && inv.companyId !== null
                                        ? (inv.companyId as Company).companyName
                                        : 'غير محددة';

                                    return (
                                        <tr key={inv._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-4 px-6 font-latin font-bold text-accent">
                                                {inv.invoiceNumber}
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <LuBuilding2 className="w-4 h-4 text-body shrink-0" />
                                                    <span className="font-bold text-heading text-xs">{compName}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 font-latin font-bold text-emerald-600">
                                                {inv.total} ر.س
                                            </td>

                                            <td className="py-4 px-6 text-xs text-body font-medium">
                                                {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                                            </td>

                                            <td className="py-4 px-6">
                                                {statusBadge(inv.status)}
                                            </td>

                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedInvoiceForDetails(inv)}
                                                        title="عرض التفاصيل"
                                                        className="p-2 rounded-xl bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedInvoiceForEdit(inv)}
                                                        title="تعديل الفاتورة"
                                                        className="p-2 rounded-xl bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedInvoiceForDelete(inv)}
                                                        title="حذف الفاتورة"
                                                        className="p-2 rounded-xl bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuTrash2 className="w-4 h-4" />
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs">
                        <span className="text-body font-medium">
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} فاتورة)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals Mounting */}
            <AddInvoices
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditInvoices
                isOpen={!!selectedInvoiceForEdit}
                invoice={selectedInvoiceForEdit}
                onClose={() => setSelectedInvoiceForEdit(null)}
            />

            <DetailsInvoices
                isOpen={!!selectedInvoiceForDetails}
                invoice={selectedInvoiceForDetails}
                onClose={() => setSelectedInvoiceForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedInvoiceForDelete}
                title="تأكيد حذف الفاتورة"
                description={`هل أنت تأكد من رغبتك في نقل الفاتورة رقم (${selectedInvoiceForDelete?.invoiceNumber}) لسلة المحذوفات؟`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedInvoiceForDelete(null)}
            />

        </div>
    );
}
