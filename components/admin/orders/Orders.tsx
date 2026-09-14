/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Order, Company } from '@/types/data';
import { useOrders, useDeleteOrder } from '@/hooks/orders/useOrders';
import AddOrders from './AddOrders';
import EditOrders from './EditOrders';
import DetailsOrders from './DetailsOrders';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import BulkImportAdminOrdersPopup from './BulkImportAdminOrdersPopup';
import {
    LuPackage,
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
    LuClock,
    LuCheck,
    LuTruck,
    LuMapPin,
    LuLayers,
    LuFileSpreadsheet,
    LuCalendar,
    LuDownload,
    LuLoader
} from 'react-icons/lu';
import AddShipments from '../shipments/AddShipments';
import { OrderPDFDocument } from '@/components/company/orders/OrderPDFDocument';

export default function Orders() {
    // Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Date Range Filter States (Default to TODAY's date)
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    // Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isGroupShipmentOpen, setIsGroupShipmentOpen] = useState(false);

    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
    const [selectedOrderForDelete, setSelectedOrderForDelete] = useState<Order | null>(null);
    const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

    // React Query Hooks with server-side search, filtering & dates
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useOrders(page, limit, searchQuery, filterStatus, startDate, endDate);
    const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

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

    if (isLoading) return <Loading />;

    const ordersList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value);
        setPage(1);
    };

    // Stats Calculation directly from backend API response stats
    const serverStats = responseData?.stats;
    const stats = {
        total: serverStats?.total ?? totalRecords,
        pending: serverStats?.pending ?? 0,
        shipped: (serverStats?.shipped ?? 0) + (serverStats?.grouped ?? 0),
        delivered: serverStats?.delivered ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedOrderForDelete) return;
        deleteOrder(
            { id: selectedOrderForDelete._id, hard: true },
            {
                onSuccess: () => {
                    setSelectedOrderForDelete(null);
                },
            }
        );
    };

    const handleDownloadOrderPdf = async (order: any) => {
        try {
            setDownloadingOrderId(order._id);
            toast.loading(`Preparing and downloading order document PDF (${order.orderNumber})...`, { id: 'order-pdf' });
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(<OrderPDFDocument orderData={order} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Order_${order.orderNumber || 'download'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`Order document (${order.orderNumber}) downloaded successfully!`, { id: 'order-pdf' });
        } catch (err) {
            console.error('Failed to generate Order PDF:', err);
            toast.error('An error occurred while generating the Order PDF', { id: 'order-pdf' });
        } finally {
            setDownloadingOrderId(null);
        }
    };

    const statusBadge = (status?: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Pending
                    </span>
                );
            case 'validated':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        Confirmed
                    </span>
                );
            case 'grouped':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        Grouped in Shipment
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        Shipped
                    </span>
                );
            case 'delivered':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Delivered
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Cancelled
                    </span>
                );
            case 'error':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        Data Error
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
                        {status || 'New'}
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
                            <LuPackage className="w-5 h-5" />
                        </span>
                        Orders & Shipments Log Management
                    </h1>
                    <p className="text-xs text-body mt-1">Live monitoring and comprehensive management of all orders and shipments on the Shahntak platform</p>
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
                        onClick={() => setIsBulkImportOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent/10 text-accent text-xs font-bold hover:bg-accent hover:text-white transition-all cursor-pointer border border-accent/20"
                    >
                        <LuFileSpreadsheet className="w-4 h-4" />
                        <span>Import from Excel</span>
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>Add New Order</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'Failed to fetch order data from the server'} />
                </div>
            )}

            {/* Date Range Selector Header Bar - Matching Company Orders */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-heading">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>Filter Order Date Ranges:</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Orders</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Registered on the platform</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuPackage className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Pending</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.pending}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Awaiting processing</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">In Transit / Grouped</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.shipped}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Out for delivery</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuTruck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Successfully Delivered</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.delivered}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Fully completed</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Action Bar when orders are selected */}
            {selectedOrderIds.length > 0 && (
                <div className="bg-accent/10 border border-accent/30 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent text-accent-foreground font-bold flex items-center justify-center text-xs font-latin">
                            {selectedOrderIds.length}
                        </span>
                        <span className="text-sm font-bold text-heading">orders selected for grouping</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedOrderIds([])}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-body hover:text-heading hover:bg-surface transition-all cursor-pointer"
                        >
                            Clear Selection
                        </button>

                        <button
                            onClick={() => setIsGroupShipmentOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                        >
                            <LuLayers className="w-4 h-4" />
                            <span>Group Selected Orders into One Shipment</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Filter and Search Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by order number, recipient name, phone, city..."
                        className="w-full pr-4 pl-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-md border border-border w-full md:w-auto">
                        <LuFilter className="w-4 h-4 text-body shrink-0" />
                        <select
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            className="bg-transparent text-xs font-bold text-heading focus:outline-none cursor-pointer w-full"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="validated">Confirmed</option>
                            <option value="grouped">Grouped in Shipment</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="error">Data Error</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {ordersList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="No orders match the current search or filter options" icon={LuPackage} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={ordersList.length > 0 && selectedOrderIds.length === ordersList.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedOrderIds(ordersList.map(o => o._id));
                                                } else {
                                                    setSelectedOrderIds([]);
                                                }
                                            }}
                                            className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                                        />
                                    </th>
                                    <th className="py-3.5 px-4">Order No.</th>
                                    <th className="py-3.5 px-4">Creating Company</th>
                                    <th className="py-3.5 px-4">Recipient & Phone</th>
                                    <th className="py-3.5 px-4">City & Address</th>
                                    <th className="py-3.5 px-4">Weight / Quantity</th>
                                    <th className="py-3.5 px-4">Value / COD</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {ordersList.map((ord) => {
                                    const compName = typeof ord.companyId === 'object' && ord.companyId !== null
                                        ? (ord.companyId as Company).companyName
                                        : 'Unspecified';

                                    return (
                                        <tr key={ord._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrderIds.includes(ord._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedOrderIds((prev) => [...prev, ord._id]);
                                                        } else {
                                                            setSelectedOrderIds((prev) => prev.filter((id) => id !== ord._id));
                                                        }
                                                    }}
                                                    className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-3.5 px-4 font-latin font-bold text-accent">
                                                {ord.orderNumber}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <LuBuilding2 className="w-4 h-4 text-body shrink-0" />
                                                    <span className="font-bold text-heading text-xs">{compName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <span className="font-bold text-heading block">{ord.recipientName}</span>
                                                    <span className="text-xs text-body font-latin">{ord.recipientPhone}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="text-xs">
                                                    <span className="font-bold text-heading flex items-center gap-1">
                                                        <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                                        {ord.recipientCity}
                                                    </span>
                                                    <span className="text-body text-[11px] truncate max-w-[150px] block">{ord.recipientAddress}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs font-semibold text-heading">
                                                <div>{ord.weight} kg</div>
                                                <div className="text-body text-[11px]">{ord.quantity || 1} package(s)</div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs">
                                                <div className="font-bold text-emerald-600">{ord.orderValue} SAR</div>
                                                {ord.codAmount ? (
                                                    <div className="text-amber-600 font-medium text-[11px]">COD: {ord.codAmount}</div>
                                                ) : null}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {statusBadge(ord.status)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleDownloadOrderPdf(ord)}
                                                        disabled={downloadingOrderId === ord._id}
                                                        title="Download order document as PDF"
                                                        className="p-2 rounded-md bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
                                                    >
                                                        {downloadingOrderId === ord._id ? (
                                                            <LuLoader className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <LuDownload className="w-4 h-4" />
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedOrderForDetails(ord)}
                                                        title="View details"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedOrderForEdit(ord)}
                                                        title="Edit data"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedOrderForDelete(ord)}
                                                        title="Delete order"
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
                            Showing page <b className="font-latin text-heading">{page}</b> of <b className="font-latin text-heading">{totalPages}</b> ({totalRecords} orders total)
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
            <AddOrders
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <BulkImportAdminOrdersPopup
                isOpen={isBulkImportOpen}
                onClose={() => {
                    setIsBulkImportOpen(false);
                    refetch();
                }}
            />

            {/* Calculate common company and destination for selected orders */}
            {(() => {
                const selectedOrders = ordersList.filter((o) => selectedOrderIds.includes(o._id));
                const commonCompanyId = selectedOrders.length > 0
                    ? (typeof selectedOrders[0].companyId === 'object' && selectedOrders[0].companyId !== null
                        ? (selectedOrders[0].companyId as Company)._id
                        : (selectedOrders[0].companyId as string))
                    : '';
                const commonDestination = selectedOrders.length > 0 ? selectedOrders[0].recipientCity : 'Jeddah';

                return (
                    <AddShipments
                        isOpen={isGroupShipmentOpen}
                        initialOrderIds={selectedOrderIds}
                        initialCompanyId={commonCompanyId}
                        initialDestination={commonDestination}
                        isGrouping={true}
                        onClose={() => {
                            setIsGroupShipmentOpen(false);
                            setSelectedOrderIds([]);
                            refetch();
                        }}
                    />
                );
            })()}

            <EditOrders
                isOpen={!!selectedOrderForEdit}
                order={selectedOrderForEdit}
                onClose={() => setSelectedOrderForEdit(null)}
            />

            <DetailsOrders
                isOpen={!!selectedOrderForDetails}
                order={selectedOrderForDetails}
                onClose={() => setSelectedOrderForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedOrderForDelete}
                title="Confirm Order Deletion"
                description={`Are you sure you want to delete order (${selectedOrderForDelete?.orderNumber})? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedOrderForDelete(null)}
            />

        </div>
    );
}