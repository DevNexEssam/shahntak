"use client";

import React, { useState } from 'react';
import { Route, Carrier } from '@/types/data';
import { useRoutes, useDeleteRoute } from '@/hooks/routes/useRoutes';
import AddRoutes from './AddRoutes';
import EditRoutes from './EditRoutes';
import DetailsRoutes from './DetailsRoutes';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import ErrorMessege from '@/components/ui/ErrorMessege';
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
    LuTruck,
    LuCoins,
    LuClock,
    LuFilter,
    LuCheck,
    LuX,
    LuBuilding2
} from 'react-icons/lu';

export default function Routes() {
    // Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    // Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedRouteForEdit, setSelectedRouteForEdit] = useState<Route | null>(null);
    const [selectedRouteForDetails, setSelectedRouteForDetails] = useState<Route | null>(null);
    const [selectedRouteForDelete, setSelectedRouteForDelete] = useState<Route | null>(null);

    // React Query Hooks with server-side search & filtering
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useRoutes(page, limit, searchQuery, filterStatus);
    const { mutate: deleteRoute, isPending: isDeleting } = useDeleteRoute();

    // Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

    const routesList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Rule 1: Always setPage(1) on search/filter changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value as 'all' | 'active' | 'inactive');
        setPage(1);
    };

    // Stats Calculation from server stats
    const serverStats = responseData?.stats;
    const stats = {
        total: serverStats?.total ?? totalRecords,
        active: serverStats?.active ?? 0,
        inactive: serverStats?.inactive ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedRouteForDelete) return;
        deleteRoute(
            { id: selectedRouteForDelete._id, hard: true },
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
                        <span className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuMapPin className="w-5 h-5" />
                        </span>
                        Routes & Logistics Lanes Management
                    </h1>
                    <p className="text-xs text-body mt-1">Define transport lanes, inter-city connections, default pricing, and shipping durations</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-all font-bold text-xs shadow-xs cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>Add New Route</span>
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
                    <ErrorMessege message={(error as any)?.message || 'Failed to fetch route data from the server'} />
                </div>
            )}

            {/* KPI Stats Grid - Matching Companies.tsx Design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Routes</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Registered in the system</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">Active Routes</span>
                            <h3 className="text-2xl font-bold text-emerald-600 my-1 font-latin">{stats.active}</h3>
                            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-2">
                                <span>Active and available</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">Suspended Routes</span>
                            <h3 className="text-2xl font-bold text-rose-600 my-1 font-latin">{stats.inactive}</h3>
                            <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-2">
                                <span>Temporarily suspended</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuX className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Status Filter Tabs & Search Controller Header */}
            <div className="space-y-4">
                <div className="border-b border-border flex items-center gap-2 overflow-x-auto">
                    {[
                        { key: 'all', label: 'All Routes', count: stats.total },
                        { key: 'active', label: 'Active Routes', count: stats.active },
                        { key: 'inactive', label: 'Suspended Routes', count: stats.inactive },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setFilterStatus(tab.key as any);
                                setPage(1);
                            }}
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
                            placeholder="Search by origin, destination, vehicle type..."
                            className="w-full pr-4 pl-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {routesList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="No logistics routes match the current search or filter options" icon={LuMapPin} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">Route Lane</th>
                                    <th className="py-3.5 px-4">Vehicle Type</th>
                                    <th className="py-3.5 px-4">Base Price</th>
                                    <th className="py-3.5 px-4">Estimated Transit</th>
                                    <th className="py-3.5 px-4">Assigned Carrier</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {routesList.map((rt) => {
                                    const carrierName = typeof rt.carrierId === 'object' && rt.carrierId !== null
                                        ? (rt.carrierId as Carrier).name
                                        : 'All Carriers';

                                    return (
                                        <tr key={rt._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-heading">
                                                <div className="flex items-center gap-2">
                                                    <span>{rt.origin}</span>
                                                    <span className="text-accent text-xs">→</span>
                                                    <span>{rt.destination}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-semibold text-heading">
                                                <div className="flex items-center gap-1.5">
                                                    <LuTruck className="w-3.5 h-3.5 text-accent shrink-0" />
                                                    <span>{rt.vehicleType}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin font-bold text-emerald-600">
                                                {rt.basePrice} SAR
                                            </td>

                                            <td className="py-3.5 px-4 text-xs text-body font-medium">
                                                <div className="flex items-center gap-1">
                                                    <LuClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                    <span>{rt.estimatedTransitTime || 'Not specified'}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-medium text-heading">
                                                <div className="flex items-center gap-1.5">
                                                    <LuBuilding2 className="w-3.5 h-3.5 text-body shrink-0" />
                                                    <span>{carrierName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${rt.isActive !== false
                                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                                        : 'bg-rose-500/10 text-rose-600 border-rose-200'
                                                    }`}>
                                                    {rt.isActive !== false ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedRouteForDetails(rt)}
                                                        title="View details"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedRouteForEdit(rt)}
                                                        title="Edit route"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedRouteForDelete(rt)}
                                                        title="Delete route"
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
                            Showing page <b className="font-latin text-heading">{page}</b> of <b className="font-latin text-heading">{totalPages}</b> ({totalRecords} routes total)
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
            <AddRoutes
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditRoutes
                isOpen={!!selectedRouteForEdit}
                route={selectedRouteForEdit}
                onClose={() => setSelectedRouteForEdit(null)}
            />

            <DetailsRoutes
                isOpen={!!selectedRouteForDetails}
                route={selectedRouteForDetails}
                onClose={() => setSelectedRouteForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedRouteForDelete}
                title="Confirm Route Deletion"
                description={`Are you sure you want to delete the route (${selectedRouteForDelete?.origin} → ${selectedRouteForDelete?.destination})? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedRouteForDelete(null)}
            />

        </div>
    );
}