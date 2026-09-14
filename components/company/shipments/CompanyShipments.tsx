/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyShipments, useDeleteCompanyShipment } from '@/hooks/company/useCompanyShipment';
import AddCompanyShipmentPopup from './AddCompanyShipmentPopup';
import EditCompanyShipmentPopup from './EditCompanyShipmentPopup';
import DetailsCompanyShipmentPopup from './DetailsCompanyShipmentPopup';
import BulkImportShipmentsPopup from './BulkImportShipmentsPopup';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import {
    LuTruck,
    LuPlus,
    LuSearch,
    LuRefreshCw,
    LuPencil,
    LuEye,
    LuTrash2,
    LuChevronRight,
    LuChevronLeft,
    LuClock,
    LuCheck,
    LuMapPin,
    LuBox,
    LuCalendar,
    LuUpload,
    LuDownload,
    LuLoader
} from 'react-icons/lu';
import { WaybillPDFDocument } from './WaybillPDFDocument';

export default function CompanyShipments() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [selectedShipmentForEdit, setSelectedShipmentForEdit] = useState<any | null>(null);
    const [selectedShipmentForDetails, setSelectedShipmentForDetails] = useState<any | null>(null);
    const [selectedShipmentForDelete, setSelectedShipmentForDelete] = useState<any | null>(null);
    const [downloadingShipmentId, setDownloadingShipmentId] = useState<string | null>(null);

    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCompanyShipments(page, limit, searchQuery, startDate, endDate);
    const { mutate: deleteShipment, isPending: isDeleting } = useDeleteCompanyShipment();

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

    const shipmentsList = responseData?.data || [];
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
        created: serverStats?.created ?? 0,
        in_transit: serverStats?.in_transit ?? 0,
        delivered: serverStats?.delivered ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedShipmentForDelete) return;
        deleteShipment(
            { id: selectedShipmentForDelete._id },
            {
                onSuccess: () => {
                    setSelectedShipmentForDelete(null);
                },
            }
        );
    };

    const handleDownloadWaybillPdf = async (shipment: any) => {
        if (shipment?.status === 'cancelled') {
            toast.error('Waybill integrity notice: Cannot download a waybill for a cancelled shipment');
            return;
        }
        try {
            setDownloadingShipmentId(shipment._id);
            toast.loading(`Preparing and downloading Waybill PDF (${shipment.waybillNumber || shipment.shipmentNumber})...`, { id: 'waybill-pdf' });
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(<WaybillPDFDocument shipmentData={shipment} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Waybill_${shipment.waybillNumber || shipment.shipmentNumber || 'download'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`Waybill (${shipment.waybillNumber || shipment.shipmentNumber}) downloaded successfully!`, { id: 'waybill-pdf' });
        } catch (err) {
            console.error('Failed to generate Waybill PDF:', err);
            toast.error('An error occurred while generating the Waybill PDF', { id: 'waybill-pdf' });
        } finally {
            setDownloadingShipmentId(null);
        }
    };

    const statusBadge = (status?: string) => {
        switch (status) {
            case 'created':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        New
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        Confirmed
                    </span>
                );
            case 'assigned':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        Assigned to Carrier
                    </span>
                );
            case 'ready_for_pickup':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        Ready for Pickup
                    </span>
                );
            case 'picked_up':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
                        Picked Up
                    </span>
                );
            case 'in_transit':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        In Transit
                    </span>
                );
            case 'arrived':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                        Arrived at Facility
                    </span>
                );
            case 'out_for_delivery':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                        Out for Delivery
                    </span>
                );
            case 'delivered':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Delivered
                    </span>
                );
            case 'delivery_failed':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Delivery Failed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Cancelled
                    </span>
                );
            case 'returned':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-600 border border-gray-500/20">
                        Returned
                    </span>
                );
            case 'exception':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        Exception
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

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'ftl': return 'Full Truckload (FTL)';
            case 'ltl': return 'Less Than Truckload (LTL)';
            default: return 'Local Delivery';
        }
    };

    return (
        <div className="space-y-6 text-left">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuTruck className="w-5 h-5" />
                        </span>
                        Shipments & Resource Allocation
                    </h1>
                    <p className="text-xs text-body mt-1">Monitor grouped shipments, routes, assign carriers & vehicles, and print waybills</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Refresh Data"
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`text-sm font-bold ${isFetching ? 'animate-spin text-accent' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsBulkImportOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
                    >
                        <LuUpload className="w-4 h-4" />
                        <span>Import Shipments from Excel</span>
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>Create New Shipment</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'Failed to fetch shipments data from server'} />
                </div>
            )}

            {/* Date Range Selector Header Bar */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-heading">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>Filter Shipment Date Ranges:</span>
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
                            Today (Default)
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
                            All Time
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
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs text-heading focus:outline-none focus:border-accent"
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
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs text-heading focus:outline-none focus:border-accent"
                        />
                    </div>

                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Shipments</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Registered for company</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">New Shipments</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.created}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Recently grouped</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">In Transit</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.in_transit}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Moving & in transit</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuBox className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Delivered</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.delivered}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Completed & delivered</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by shipment number, waybill, tracking, destination..."
                        className="w-full pr-4 pl-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {shipmentsList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="No registered company shipments matching the current search criteria" icon={LuTruck} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">Shipment Number</th>
                                    <th className="py-3.5 px-4">Service & Route</th>
                                    <th className="py-3.5 px-4">Waybill & Tracking</th>
                                    <th className="py-3.5 px-4">Orders / Assigned Vehicle</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {shipmentsList.map((shp: any) => {
                                    const vehicleName = typeof shp.vehicleId === 'object' && shp.vehicleId !== null
                                        ? shp.vehicleId.type
                                        : 'Not assigned';

                                    return (
                                        <tr key={shp._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-accent">
                                                {shp.shipmentNumber}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <span className="font-bold text-heading flex items-center gap-1">
                                                        <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                                        {shp.origin} → {shp.destination}
                                                    </span>
                                                    <span className="text-[11px] text-body block mt-0.5">{getTypeBadge(shp.type)}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs">
                                                <div className="font-extrabold text-heading">{shp.waybillNumber || 'WB-XXXX'}</div>
                                                <div className="text-[11px] text-body">{shp.trackingNumber || 'TRK-XXXX'}</div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-semibold text-heading">
                                                <div>{shp.ordersCount || 1} Attached Orders</div>
                                                <div className="text-body text-[11px]">Vehicle: {vehicleName}</div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {statusBadge(shp.status)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleDownloadWaybillPdf(shp)}
                                                        disabled={downloadingShipmentId === shp._id || shp.status === 'cancelled'}
                                                        title={shp.status === 'cancelled' ? 'Waybill Cancelled' : 'Download Waybill PDF'}
                                                        className="p-2 rounded-md bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        {downloadingShipmentId === shp._id ? (
                                                            <LuLoader className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <LuDownload className="w-4 h-4" />
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedShipmentForDetails(shp)}
                                                        title="View Details"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedShipmentForEdit(shp)}
                                                        title="Edit Details & Assign Resources"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedShipmentForDelete(shp)}
                                                        title="Delete Shipment"
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs font-bold text-body">
                        <span className="text-body font-medium">
                            Showing page <b className="text-heading">{page}</b> of <b className="text-heading">{totalPages}</b> (Total {totalRecords} shipments)
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

            {/* Modals */}
            <AddCompanyShipmentPopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <BulkImportShipmentsPopup
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
            />

            <EditCompanyShipmentPopup
                isOpen={!!selectedShipmentForEdit}
                shipmentData={selectedShipmentForEdit}
                onClose={() => setSelectedShipmentForEdit(null)}
            />

            <DetailsCompanyShipmentPopup
                isOpen={!!selectedShipmentForDetails}
                shipmentData={selectedShipmentForDetails}
                onClose={() => setSelectedShipmentForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedShipmentForDelete}
                title="Confirm Delete Shipment"
                description={`Are you sure you want to delete shipment (${selectedShipmentForDelete?.shipmentNumber})? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedShipmentForDelete(null)}
            />

        </div>
    );
}

