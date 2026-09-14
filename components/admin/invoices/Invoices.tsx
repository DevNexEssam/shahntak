/* eslint-disable @typescript-eslint/no-explicit-any */
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
import ErrorMessege from '@/components/ui/ErrorMessege';
import toast from 'react-hot-toast';
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
    LuCalendar,
    LuDownload,
    LuLoader
} from 'react-icons/lu';
import { InvoicePDFDocument } from '@/components/company/invoices/InvoicePDFDocument';

export default function Invoices() {
    // Date Range Filter States (Default to TODAY's date)
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    // Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Modals & PDF Download Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);
    const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<Invoice | null>(null);
    const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState<Invoice | null>(null);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

    // React Query Hooks with server-side search & date range filtering
    const {
        data: responseData,
        isLoading,
        isError,
        error,
        isFetching,
        refetch
    } = useInvoices(page, limit, searchQuery, filterStatus, startDate, endDate);
    const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

    // Initial Loading Check
    if (isLoading) return <Loading />;

    const invoicesList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Reset pagination on filter changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (status: string) => {
        setFilterStatus(status);
        setPage(1);
    };

    // Date Preset Handlers
    const handlePresetToday = () => {
        setStartDate(todayStr);
        setEndDate(todayStr);
        setDatePreset('today');
        setPage(1);
    };

    const handlePresetMonth = () => {
        const now = new Date();
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        setStartDate(firstDay);
        setEndDate(todayStr);
        setDatePreset('month');
        setPage(1);
    };

    const handlePresetAll = () => {
        setStartDate('');
        setEndDate('');
        setDatePreset('all');
        setPage(1);
    };

    // Direct PDF Download Handler
    const handleDownloadPdf = async (inv: any) => {
        try {
            setDownloadingInvoiceId(inv._id);
            toast.loading(`Preparing and downloading ZATCA tax invoice PDF (${inv.invoiceNumber})...`, { id: 'pdf-toast' });
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(<InvoicePDFDocument invoiceData={inv} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ZATCA_Invoice_${inv.invoiceNumber || 'download'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`Invoice (${inv.invoiceNumber}) downloaded successfully!`, { id: 'pdf-toast' });
        } catch (err) {
            console.error('Failed to generate PDF:', err);
            toast.error('An error occurred while generating the PDF file', { id: 'pdf-toast' });
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    // Financial Stats Calculation from Server Response
    const serverStats = responseData?.stats;
    const totalCollected = serverStats?.totalCollected ?? 0;
    const totalPending = serverStats?.totalPending ?? 0;

    const handleDeleteConfirm = () => {
        if (!selectedInvoiceForDelete) return;
        deleteInvoice(
            { id: selectedInvoiceForDelete._id, hard: true },
            {
                onSuccess: () => {
                    setSelectedInvoiceForDelete(null);
                },
            }
        );
    };

    const statusBadge = (status?: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Paid & Collected
                    </span>
                );
            case 'issued':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        Issued & Pending
                    </span>
                );
            case 'overdue':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Overdue
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Draft
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 text-left">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuReceipt className="w-5 h-5" />
                        </span>
                        Admin Invoices & ZATCA Financial Compliance
                    </h1>
                    <p className="text-xs text-body mt-1">Monitor and issue tax invoices, track financial collection, and manage 15% VAT calculations</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-all font-bold text-xs shadow-xs cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>Issue New Invoice</span>
                    </button>

                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Refresh data"
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-accent' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'Failed to fetch invoice data from the server'} />
                </div>
            )}

            {/* Date Range Selector Header Bar */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-heading">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>Filter Financial Periods:</span>
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
                            Today (Auto)
                        </button>
                        <button
                            onClick={handlePresetMonth}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'month'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-heading'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={handlePresetAll}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'all'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-heading'
                                }`}
                        >
                            All Periods
                        </button>
                    </div>

                    {/* Date Inputs */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-body">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setDatePreset('all');
                                setPage(1);
                            }}
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs font-latin text-heading focus:outline-none focus:border-accent"
                        />
                        <span className="text-xs text-body">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setDatePreset('all');
                                setPage(1);
                            }}
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs font-latin text-heading focus:outline-none focus:border-accent"
                        />
                    </div>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Invoices</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{serverStats?.total ?? totalRecords}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Issued in period</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">Collected & Paid</span>
                            <h3 className="text-2xl font-bold text-emerald-600 my-1 font-latin">
                                {totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">SAR</span>
                            </h3>
                            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-2">
                                <span>Successfully collected invoices</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Pending Collection</span>
                            <h3 className="text-2xl font-bold text-amber-600 my-1 font-latin">
                                {totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">SAR</span>
                            </h3>
                            <p className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-2">
                                <span>Outstanding receivables</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Status Filter Tabs & Search Controller Header */}
            <div className="space-y-4">
                <div className="border-b border-border flex items-center gap-2 overflow-x-auto">
                    {[
                        { key: 'all', label: 'All Invoices', count: serverStats?.total ?? totalRecords },
                        { key: 'paid', label: 'Paid & Collected', count: serverStats?.paid ?? 0 },
                        { key: 'issued', label: 'Issued & Pending', count: serverStats?.issued ?? 0 },
                        { key: 'draft', label: 'Draft', count: serverStats?.draft ?? 0 },
                        { key: 'overdue', label: 'Overdue', count: serverStats?.overdue ?? 0 },
                        { key: 'cancelled', label: 'Cancelled', count: serverStats?.cancelled ?? 0 },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterStatusChange(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${filterStatus === tab.key
                                ? 'border-accent text-accent bg-accent/5'
                                : 'border-transparent text-body hover:text-heading hover:bg-surface-muted/50'
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-latin font-bold ${filterStatus === tab.key ? 'bg-accent/10 text-accent' : 'bg-surface-muted text-body'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="bg-surface p-4 rounded-md border border-border flex items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <LuSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by invoice number..."
                            className="w-full pr-4 pl-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {invoicesList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="No invoices match the current search, date range, or filter options" icon={LuReceipt} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">Invoice No.</th>
                                    <th className="py-3.5 px-4">Mapped Company</th>
                                    <th className="py-3.5 px-4">Issue Date</th>
                                    <th className="py-3.5 px-4">Subtotal (Pre-Tax)</th>
                                    <th className="py-3.5 px-4">VAT</th>
                                    <th className="py-3.5 px-4">Grand Total</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {invoicesList.map((inv: any) => {
                                    const compName = typeof inv.companyId === 'object' && inv.companyId !== null
                                        ? (inv.companyId as Company).companyName
                                        : 'General Company';

                                    const grand = Number(inv.total ?? inv.amount ?? inv.totalAmount ?? 0);
                                    const snapshot = inv.taxRateSnapshot !== undefined ? Number(inv.taxRateSnapshot) : 15;
                                    const subtotal = inv.subtotal ?? (grand / (1 + snapshot / 100));
                                    const vat = inv.vatAmount ?? (grand - subtotal);

                                    return (
                                        <tr key={inv._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 font-latin font-bold text-accent">
                                                {inv.invoiceNumber}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <LuBuilding2 className="w-4 h-4 text-body shrink-0" />
                                                    <span className="font-bold text-heading text-xs">{compName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs text-heading">
                                                {new Date(inv.createdAt || Date.now()).toLocaleDateString('en-US')}
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs font-bold text-heading">
                                                {subtotal.toFixed(2)} SAR
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs text-amber-600 font-bold">
                                                {vat.toFixed(2)} SAR
                                                <span className="text-[10px] text-body ml-1">({snapshot}%)</span>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs font-extrabold text-emerald-600">
                                                {grand.toFixed(2)} SAR
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {statusBadge(inv.status)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleDownloadPdf(inv)}
                                                        disabled={downloadingInvoiceId === inv._id}
                                                        title="Download invoice as PDF"
                                                        className="p-2 rounded-md bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                                                    >
                                                        {downloadingInvoiceId === inv._id ? (
                                                            <LuLoader className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <LuDownload className="w-4 h-4" />
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedInvoiceForDetails(inv)}
                                                        title="View details"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedInvoiceForEdit(inv)}
                                                        title={inv.status === 'paid' ? 'Collected invoice cannot be edited' : 'Edit invoice'}
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer disabled:opacity-40"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedInvoiceForDelete(inv)}
                                                        title="Delete invoice"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
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
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs font-bold text-body">
                        <span className="text-body font-medium">
                            Showing page <b className="font-latin text-heading">{page}</b> of <b className="font-latin text-heading">{totalPages}</b> ({totalRecords} invoices total)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                            </button>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <span>Next</span>
                                <LuChevronRight className="w-4 h-4" />
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
                title="Confirm Invoice Deletion"
                description={`Are you sure you want to delete invoice number (${selectedInvoiceForDelete?.invoiceNumber})? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedInvoiceForDelete(null)}
            />

        </div>
    );
}