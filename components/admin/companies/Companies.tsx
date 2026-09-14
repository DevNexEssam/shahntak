"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Loading from "@/components/ui/loading";
import EmptyData from "@/components/ui/EmptyData";
import ConfirmDeletePopup from "@/components/ui/ConfirmDeletePopup";
import AddCompanies from "./AddCompanies";
import EditCompanies from "./EditCompanies";
import DetailsCompanies from "./DetailsCompanies";
import { Company } from "@/types/data";
import {
    useCompanies,
    useDeleteCompany,
    useApproveCompany,
    useUpdateCompanyStatus
} from "@/hooks/companies/useCompanies";
import {
    LuBuilding2,
    LuPlus,
    LuSearch,
    LuFilter,
    LuLayoutGrid,
    LuTable,
    LuPencil,
    LuTrash2,
    LuEye,
    LuExternalLink,
    LuRefreshCw,
    LuShieldCheck,
    LuMapPin,
    LuMail,
    LuPhone,
    LuChevronRight,
    LuChevronLeft,
    LuCheck,
    LuX,
    LuClock,
    LuTrendingUp
} from "react-icons/lu";

export default function Companies() {
    // Pagination & Search/Filter states
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const limit = 9;

    // Modals & Selection states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companyToDeleteId, setCompanyToDeleteId] = useState<string | null>(null);

    // Custom Hooks
    const { data: companiesRes, isLoading, isError, error, refetch, isFetching } = useCompanies(page, limit);
    const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();
    const { mutate: approveCompany, isPending: isApproving } = useApproveCompany();

    // Initial Loading State
    if (isLoading) return <Loading />;

    const companiesList = companiesRes?.data || [];
    const totalRecords = companiesRes?.total || 0;

    // Handlers for search/filter resetting page to 1
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (status: string) => {
        setFilterStatus(status);
        setPage(1);
    };

    // Client-side filtered list
    const filteredCompanies = companiesList.filter((comp) => {
        const matchesSearch =
            comp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            comp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            comp.phone.includes(searchQuery) ||
            (comp.city && comp.city.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = filterStatus === "all" || comp.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil((totalRecords || filteredCompanies.length || 1) / limit);

    // KPI Stats
    const stats = {
        total: totalRecords || companiesList.length,
        active: companiesList.filter(c => c.status === "active").length,
        inactive: companiesList.filter(c => c.status === "inactive").length,
        banned: companiesList.filter(c => c.status === "banned").length,
    };

    const getStatusBadge = (status: Company["status"]) => {
        switch (status) {
            case "active":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                        Active
                    </span>
                );
            case "inactive":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-200">
                        Inactive
                    </span>
                );
            case "archived":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-200">
                        Archived
                    </span>
                );
            case "banned":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-200">
                        Banned
                    </span>
                );
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface-muted text-body">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 text-left">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuBuilding2 className="w-5 h-5" />
                        </span>
                        Registered Companies Management
                    </h1>
                    <p className="text-xs text-body mt-1">
                        Monitor shipping company accounts, approval details, and updated records on the platform.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh data"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-accent" : ""}`} />
                    </button>

                    {/* View Toggle */}
                    <div className="bg-surface-muted p-1 rounded-2xl flex items-center gap-1 border border-border">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === "grid" ? "bg-accent text-accent-foreground shadow-xs" : "text-body hover:text-heading"
                                }`}
                            title="Card view"
                        >
                            <LuLayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === "table" ? "bg-accent text-accent-foreground shadow-xs" : "text-body hover:text-heading"
                                }`}
                            title="Compact table view"
                        >
                            <LuTable className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-all font-bold text-xs shadow-xs cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>Register Shipping Company</span>
                    </button>
                </div>
            </div>

            {/* Error Banner if any */}
            {isError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold flex items-center justify-between">
                    <span>An error occurred while fetching the companies list: {(error as Error)?.message || "Server connection error"}</span>
                    <button onClick={() => refetch()} className="underline text-xs cursor-pointer">Retry</button>
                </div>
            )}

            {/* KPI Stats Grid - Simple & Clean Design with Our Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Companies */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Companies</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Registered on the platform</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuBuilding2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Active Companies */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Active Companies</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.active}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Currently operating</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Inactive Companies */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Inactive Companies</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.inactive}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Need activation</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Banned Companies */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Banned Companies</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.banned}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Temporarily suspended</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuX className="w-5 h-5" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Filter and Search Bar */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by company name, email, phone, or city..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    <LuFilter className="w-4 h-4 text-body shrink-0 mr-1" />
                    <button
                        onClick={() => handleFilterStatusChange("all")}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${filterStatus === "all" ? "bg-accent text-accent-foreground shadow-xs" : "bg-surface-muted text-body hover:text-heading border border-border"
                            }`}
                    >
                        All ({totalRecords})
                    </button>
                    <button
                        onClick={() => handleFilterStatusChange("active")}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${filterStatus === "active" ? "bg-emerald-600 text-white shadow-xs" : "bg-surface-muted text-body hover:text-heading border border-border"
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => handleFilterStatusChange("inactive")}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${filterStatus === "inactive" ? "bg-amber-600 text-white shadow-xs" : "bg-surface-muted text-body hover:text-heading border border-border"
                            }`}
                    >
                        Inactive
                    </button>
                    <button
                        onClick={() => handleFilterStatusChange("banned")}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${filterStatus === "banned" ? "bg-rose-600 text-white shadow-xs" : "bg-surface-muted text-body hover:text-heading border border-border"
                            }`}
                    >
                        Banned
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {filteredCompanies.length === 0 ? (
                <div className="p-12 bg-surface border border-border rounded-3xl text-center shadow-xs">
                    <EmptyData message="No registered companies match the current search and status filters" icon={LuBuilding2} />
                </div>
            ) : (
                <>
                    {/* VIEW 1: Grid Cards */}
                    {viewMode === "grid" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredCompanies.map((comp) => (
                                <div
                                    key={comp._id}
                                    className="bg-surface rounded-3xl border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="p-5 space-y-4">

                                        {/* Logo & Basic Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent font-extrabold text-lg flex items-center justify-center shrink-0 border border-accent/20">
                                                    {comp.companyName ? comp.companyName.charAt(0) : "C"}
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-base text-heading leading-tight">
                                                        {comp.companyName}
                                                    </h3>
                                                    <span className="text-xs text-body flex items-center gap-1 mt-1 font-medium">
                                                        <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                                        {comp.city || "Not specified"}
                                                    </span>
                                                </div>
                                            </div>

                                            {getStatusBadge(comp.status)}
                                        </div>

                                        {/* Contact Details */}
                                        <div className="space-y-2 pt-3 border-t border-border text-xs">
                                            <div className="flex items-center justify-between text-body">
                                                <span className="flex items-center gap-1.5 text-body font-medium">
                                                    <LuMail className="w-3.5 h-3.5 text-body/60" />
                                                    Email:
                                                </span>
                                                <span className="font-mono font-bold text-heading dir-ltr">{comp.email}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-body">
                                                <span className="flex items-center gap-1.5 text-body font-medium">
                                                    <LuPhone className="w-3.5 h-3.5 text-body/60" />
                                                    Phone:
                                                </span>
                                                <span className="font-mono font-bold text-heading dir-ltr">{comp.phone}</span>
                                            </div>

                                            {comp.taxNumber && (
                                                <div className="flex items-center justify-between text-body">
                                                    <span className="text-body font-medium">Tax Number:</span>
                                                    <span className="font-mono font-bold text-heading">{comp.taxNumber}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Approval Status Card */}
                                        <div className="pt-2">
                                            {comp.approvedBy ? (
                                                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-2xl border border-emerald-200">
                                                    <LuShieldCheck className="w-4 h-4" />
                                                    <span>Approved by Admin</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => approveCompany({ id: comp._id, approvedBy: "SuperAdmin" })}
                                                    disabled={isApproving}
                                                    className="w-full py-2 px-3 rounded-2xl border border-amber-200 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <LuShieldCheck className="w-4 h-4" />
                                                    <span>Approve Company Now</span>
                                                </button>
                                            )}
                                        </div>

                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="px-5 py-3 bg-surface-muted/60 border-t border-border flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => {
                                                    setSelectedCompany(comp);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                                className="p-2 rounded-xl border border-border bg-surface hover:bg-accent-soft text-body hover:text-accent transition-all cursor-pointer"
                                                title="Quick preview (Modal)"
                                            >
                                                <LuEye className="w-4 h-4" />
                                            </button>

                                            <Link
                                                href={`/admin/dashboard/companies/${comp._id}`}
                                                className="p-2 rounded-xl border border-border bg-surface hover:bg-accent-soft text-body hover:text-accent transition-all cursor-pointer inline-flex items-center justify-center"
                                                title="View full details page"
                                            >
                                                <LuExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSelectedCompany(comp);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-2 rounded-xl border border-border bg-surface hover:bg-amber-500/10 text-body hover:text-amber-600 transition-all cursor-pointer"
                                            title="Edit"
                                        >
                                            <LuPencil className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => setCompanyToDeleteId(comp._id)}
                                            className="p-2 rounded-xl border border-border bg-surface hover:bg-rose-500/10 text-body hover:text-rose-600 transition-all cursor-pointer"
                                            title="Delete"
                                        >
                                            <LuTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* VIEW 2: Table View */}
                    {viewMode === "table" && (
                        <div className="bg-surface rounded-md border border-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-surface-muted/60 border-b border-border text-xs text-body font-bold">
                                        <tr>
                                            <th className="py-4 px-6">Company Name & Location</th>
                                            <th className="py-4 px-5">Contact Info</th>
                                            <th className="py-4 px-5">Tax Number</th>
                                            <th className="py-4 px-5">Status</th>
                                            <th className="py-4 px-5">Approval</th>
                                            <th className="py-4 px-6 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredCompanies.map((comp) => (
                                            <tr key={comp._id} className="hover:bg-surface-muted/40 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent font-extrabold flex items-center justify-center shrink-0 border border-accent/20">
                                                            {comp.companyName ? comp.companyName.charAt(0) : "C"}
                                                        </div>
                                                        <div>
                                                            <b className="text-heading block font-extrabold">{comp.companyName}</b>
                                                            <span className="text-xs text-body font-medium">{comp.city || "Not specified"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 text-xs font-mono">
                                                    <span className="block text-heading font-bold">{comp.email}</span>
                                                    <span className="text-body">{comp.phone}</span>
                                                </td>
                                                <td className="py-4 px-5 text-xs font-mono text-heading font-bold">
                                                    {comp.taxNumber || "—"}
                                                </td>
                                                <td className="py-4 px-5">
                                                    {getStatusBadge(comp.status)}
                                                </td>
                                                <td className="py-4 px-5">
                                                    {comp.approvedBy ? (
                                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200">
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => approveCompany({ id: comp._id, approvedBy: "SuperAdmin" })}
                                                            disabled={isApproving}
                                                            className="text-xs font-bold text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-200 transition-colors cursor-pointer"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCompany(comp);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                            title="Quick preview (Modal)"
                                                            className="p-2 rounded-xl bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                        >
                                                            <LuEye className="w-4 h-4" />
                                                        </button>
                                                        <Link
                                                            href={`/admin/dashboard/companies/${comp._id}`}
                                                            title="View full details page"
                                                            className="p-2 rounded-xl bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer inline-flex items-center justify-center"
                                                        >
                                                            <LuExternalLink className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCompany(comp);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            title="Edit"
                                                            className="p-2 rounded-xl bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                        >
                                                            <LuPencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setCompanyToDeleteId(comp._id)}
                                                            title="Delete"
                                                            className="p-2 rounded-xl bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
                                                        >
                                                            <LuTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs">
                            <span className="text-body font-medium">
                                Showing page <b className="font-latin text-heading">{page}</b> of <b className="font-latin text-heading">{totalPages}</b> ({totalRecords} companies total)
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="p-2 border rounded-xl border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                                >
                                    <LuChevronLeft className="w-4 h-4" />
                                    <span>Previous</span>
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={page >= totalPages}
                                    className="p-2 border rounded-xl border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Next</span>
                                    <LuChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <AddCompanies
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditCompanies
                isOpen={isEditModalOpen}
                company={selectedCompany}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCompany(null);
                }}
            />

            <DetailsCompanies
                isOpen={isDetailsModalOpen}
                company={selectedCompany}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCompany(null);
                }}
            />

            {/* Confirm Delete Modal */}
            <ConfirmDeletePopup
                isOpen={!!companyToDeleteId}
                onClose={() => setCompanyToDeleteId(null)}
                onConfirm={() => {
                    if (companyToDeleteId) {
                        deleteCompany(
                            { id: companyToDeleteId, hard: true },
                            {
                                onSuccess: () => setCompanyToDeleteId(null),
                            }
                        );
                    }
                }}
                isDeleting={isDeleting}
                title="Confirm Permanent Company Deletion"
                description="Are you sure you want to permanently delete this company? This action will completely erase all data associated with the company (employees, orders, shipments, invoices, and payments), and it cannot be undone."
            />
        </div>
    );
}