"use client";

import React, { useState } from 'react';
import { Payment, Invoice } from '@/types/data';
import { usePayments, useDeletePayment } from '@/hooks/payments/usePayments';
import AddPayments from './AddPayments';
import EditPayments from './EditPayments';
import DetailsPayments from './DetailsPayments';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import ErrorMessege from '@/components/ui/ErrorMessege';
import {
    LuCreditCard,
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
    LuReceipt,
    LuWallet
} from 'react-icons/lu';

export default function Payments() {
    // Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState<string>('all');

    // Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | null>(null);
    const [selectedPaymentForDetails, setSelectedPaymentForDetails] = useState<Payment | null>(null);
    const [selectedPaymentForDelete, setSelectedPaymentForDelete] = useState<Payment | null>(null);

    // React Query Hooks with server-side search & filtering
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = usePayments(page, limit, searchQuery, filterMethod);
    const { mutate: deletePayment, isPending: isDeleting } = useDeletePayment();

    // Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

    const paymentsList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Rule 1: Always setPage(1) on search/filter changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterMethod(e.target.value);
        setPage(1);
    };

    // Financial Stats Calculation from Server Response
    const serverStats = responseData?.stats as any;
    const totalAmount = serverStats?.totalAmount ?? 0;
    const bankTransferCount = serverStats?.bankTransferCount ?? 0;
    const cardCount = serverStats?.cardCount ?? 0;

    const handleDeleteConfirm = () => {
        if (!selectedPaymentForDelete) return;
        deletePayment(
            { id: selectedPaymentForDelete._id, hard: true },
            {
                onSuccess: () => {
                    setSelectedPaymentForDelete(null);
                },
            }
        );
    };

    const methodBadge = (method?: string) => {
        const map: Record<string, { label: string; bg: string }> = {
            bank_transfer: { label: 'Bank Transfer', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
            card: { label: 'Credit Card', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
            cash: { label: 'Cash', bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
            other: { label: 'Other Method', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
        };
        const st = map[method || 'bank_transfer'] || { label: method || '', bg: 'bg-surface-muted text-body border-border' };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${st.bg}`}>
                {st.label}
            </span>
        );
    };

    return (
        <div className="space-y-6 text-left">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-xs">
                            <LuCreditCard className="w-5 h-5" />
                        </span>
                        Payment Settlement & Financial Transactions
                    </h1>
                    <p className="text-xs text-body mt-1">Monitor and record payment and money transfer operations, and update invoices on the platform</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Refresh data"
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-accent' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>Record New Payment</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'Failed to fetch payment data from the server'} />
                </div>
            )}

            {/* KPI Stats Grid - Matching Standard Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Operations */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Collected Transactions</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{serverStats?.total ?? totalRecords}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Confirmed payments</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Total Amount Collected */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Amount Collected</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{totalAmount.toLocaleString()} <span className="text-xs font-normal">SAR</span></h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Total settled liquidity</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCoins className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Bank Transfers */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Bank Transfers</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{bankTransferCount}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Confirmed bank transfers</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuWallet className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Credit Cards */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Electronic Payment (Mada/Card)</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{cardCount}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Electronic payment transactions</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCreditCard className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by invoice number or amount..."
                        className="w-full pr-4 pl-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-md border border-border w-full md:w-auto">
                        <LuFilter className="w-4 h-4 text-body shrink-0" />
                        <select
                            value={filterMethod}
                            onChange={handleFilterMethodChange}
                            className="bg-transparent text-xs font-bold text-heading focus:outline-none cursor-pointer w-full"
                        >
                            <option value="all">All Payment Methods</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="card">Credit Card</option>
                            <option value="cash">Cash Payment</option>
                            <option value="other">Other Method</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {paymentsList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="No payments match the current search or filter options" icon={LuCreditCard} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">Invoice No.</th>
                                    <th className="py-3.5 px-4">Subscribed Company</th>
                                    <th className="py-3.5 px-4">Payment Amount</th>
                                    <th className="py-3.5 px-4">Payment Method</th>
                                    <th className="py-3.5 px-4">Payment Date</th>
                                    <th className="py-3.5 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {paymentsList.map((pmt) => {
                                    const invObj = typeof pmt.invoiceId === 'object' && pmt.invoiceId !== null
                                        ? (pmt.invoiceId as Invoice)
                                        : null;

                                    const invNum = invObj?.invoiceNumber || 'Unspecified';
                                    const compName = invObj && typeof invObj.companyId === 'object' && invObj.companyId !== null
                                        ? (invObj.companyId as any).companyName
                                        : 'Unspecified';

                                    return (
                                        <tr key={pmt._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 font-latin font-bold text-accent">
                                                {invNum}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <LuBuilding2 className="w-4 h-4 text-body shrink-0" />
                                                    <span className="font-bold text-heading text-xs">{compName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin font-bold text-emerald-600">
                                                {pmt.amount.toLocaleString()} SAR
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {methodBadge(pmt.method)}
                                            </td>

                                            <td className="py-3.5 px-4 text-xs text-body font-medium">
                                                {pmt.paidAt ? new Date(pmt.paidAt).toLocaleDateString('en-US') : 'Not specified'}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedPaymentForDetails(pmt)}
                                                        title="View details"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedPaymentForEdit(pmt)}
                                                        title="Edit payment"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedPaymentForDelete(pmt)}
                                                        title="Delete payment"
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
                            Showing page <b className="font-latin text-heading">{page}</b> of <b className="font-latin text-heading">{totalPages}</b> ({totalRecords} transactions total)
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
            <AddPayments
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditPayments
                isOpen={!!selectedPaymentForEdit}
                payment={selectedPaymentForEdit}
                onClose={() => setSelectedPaymentForEdit(null)}
            />

            <DetailsPayments
                isOpen={!!selectedPaymentForDetails}
                payment={selectedPaymentForDetails}
                onClose={() => setSelectedPaymentForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedPaymentForDelete}
                title="Confirm Payment Record Deletion"
                description={`Are you sure you want to delete the payment record for the amount (${selectedPaymentForDelete?.amount.toLocaleString()} SAR)? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedPaymentForDelete(null)}
            />

        </div>
    );
}