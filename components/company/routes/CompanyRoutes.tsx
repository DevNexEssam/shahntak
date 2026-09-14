/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyRoutes, useDeleteCompanyRoute } from '@/hooks/company/useCompanyRoute';
import AddCompanyRoutePopup from './AddCompanyRoutePopup';
import EditCompanyRoutePopup from './EditCompanyRoutePopup';
import DetailsCompanyRoutePopup from './DetailsCompanyRoutePopup';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import {
    LuMapPin,
    LuPlus,
    LuSearch,
    LuRefreshCw,
    LuPencil,
    LuEye,
    LuTrash2,
    LuChevronRight,
    LuChevronLeft,
    LuCheck,
    LuTruck,
    LuCalendar,
    LuClock
} from 'react-icons/lu';

export default function CompanyRoutes() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedRouteForEdit, setSelectedRouteForEdit] = useState<any | null>(null);
    const [selectedRouteForDetails, setSelectedRouteForDetails] = useState<any | null>(null);
    const [selectedRouteForDelete, setSelectedRouteForDelete] = useState<any | null>(null);

    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCompanyRoutes(page, limit, searchQuery, startDate, endDate);
    const { mutate: deleteRoute, isPending: isDeleting } = useDeleteCompanyRoute();

    if (isLoading) return <Loading />;

    const routesList = responseData?.data || [];
    const pagination = responseData?.pagination;
    const totalRecords = pagination?.totalRecords || responseData?.count || 0;
    const totalPages = pagination?.totalPages || Math.ceil(totalRecords / limit) || 1;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

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

    const serverStats = responseData?.stats;
    const stats = {
        total: serverStats?.total ?? totalRecords,
        active: serverStats?.active ?? 0,
        inactive: serverStats?.inactive ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedRouteForDelete) return;
        deleteRoute(
            { id: selectedRouteForDelete._id },
            {
                onSuccess: () => {
                    setSelectedRouteForDelete(null);
                },
            }
        );
    };

    return (
        <div className="space-y-6 text-left">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuMapPin className="w-5 h-5" />
                        </span>
                        Route & Logistics Management
                    </h1>
                    <p className="text-xs text-body mt-1">Manage transport routes, city connections, base pricing, and estimated transit times</p>
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
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>Add New Route</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'Failed to fetch routes data from server'} />
                </div>
            )}

            {/* Date Range Selector Header Bar */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-heading">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>Filter Route Date Ranges:</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Registered Routes</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Configured company routes</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuMapPin className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Active Operational Routes</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.active}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Ready for shipment booking</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">Inactive / Suspended Routes</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.inactive}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Temporarily suspended</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by origin, destination, vehicle type..."
                        className="w-full pr-4 pl-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {routesList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="No registered logistics routes matching the current search criteria" icon={LuMapPin} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">Route & Direction</th>
                                    <th className="py-3.5 px-4">Vehicle Type</th>
                                    <th className="py-3.5 px-4">Base Price</th>
                                    <th className="py-3.5 px-4">Est. Transit Time</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {routesList.map((route: any) => {
                                    return (
                                        <tr key={route._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-heading">
                                                <div className="flex items-center gap-1.5 text-accent">
                                                    <LuMapPin className="w-4 h-4" />
                                                    <span>{route.origin} → {route.destination}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-semibold text-heading">
                                                <span className="inline-flex items-center gap-1">
                                                    <LuTruck className="w-3.5 h-3.5 text-body" />
                                                    {route.vehicleType}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-extrabold text-emerald-600">
                                                {Number(route.basePrice || 0).toFixed(2)} SAR
                                            </td>

                                            <td className="py-3.5 px-4 text-xs text-body">
                                                {route.estimatedTransitTime || '—'}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {route.isActive ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedRouteForDetails(route)}
                                                        title="View Details"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedRouteForEdit(route)}
                                                        title="Edit Route"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedRouteForDelete(route)}
                                                        title="Delete Route"
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
                            Showing page <b className="text-heading">{page}</b> of <b className="text-heading">{totalPages}</b> (Total {totalRecords} routes)
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
            <AddCompanyRoutePopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditCompanyRoutePopup
                isOpen={!!selectedRouteForEdit}
                routeData={selectedRouteForEdit}
                onClose={() => setSelectedRouteForEdit(null)}
            />

            <DetailsCompanyRoutePopup
                isOpen={!!selectedRouteForDetails}
                routeData={selectedRouteForDetails}
                onClose={() => setSelectedRouteForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedRouteForDelete}
                title="Confirm Delete Logistics Route"
                description={`Are you sure you want to delete the route (${selectedRouteForDelete?.origin} → ${selectedRouteForDelete?.destination})? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedRouteForDelete(null)}
            />

        </div>
    );
}

