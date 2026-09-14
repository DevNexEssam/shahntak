"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import Loading from "@/components/ui/loading";
import ErrorMessege from "@/components/ui/ErrorMessege";
import EditCompanyUsers from "@/components/admin/company-users/EditCompanyUsers";
import EditPermissionsModal from "@/components/admin/company-users/EditPermissionsModal";
import {
    useCompanyUserFullDetails,
    useToggleCompanyUserStatus
} from "@/hooks/companyUsers/useCompanyUsers";
import { Company, CompanyUser, Order } from "@/types/data";
import {
    LuUser,
    LuArrowRight,
    LuRefreshCw,
    LuShieldCheck,
    LuBuilding2,
    LuMail,
    LuPhone,
    LuPackage,
    LuCalendar,
    LuCheck,
    LuX,
    LuExternalLink,
    LuUserCheck,
    LuClock,
    LuKey,
    LuPencil,
    LuLock,
    LuPower
} from "react-icons/lu";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CompanyUserDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const userId = resolvedParams.id;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

    const { data: res, isLoading, isError, error, refetch, isFetching } = useCompanyUserFullDetails(userId);
    const { mutate: toggleStatus, isPending: isToggling } = useToggleCompanyUserStatus();

    if (isLoading) return <Loading />;

    if (isError || !res || !res.companyUser) {
        return (
            <div className="space-y-6 text-left p-4">
                <Link
                    href="/admin/dashboard/company-users"
                    className="inline-flex items-center gap-2 text-xs font-bold text-body hover:text-heading transition-colors"
                >
                    <LuArrowRight className="w-4 h-4" />
                    <span>Back to Company Staff List</span>
                </Link>
                <ErrorMessege message={(error as any)?.message || res?.message || "Employee not found or failed to load their data"} />
            </div>
        );
    }

    const { companyUser, ordersCount, recentOrders, createdByDetails } = res;

    const targetCompany = typeof companyUser.companyId === 'object' && companyUser.companyId !== null
        ? (companyUser.companyId as Company)
        : null;

    const roleBadge = {
        owner: { label: "Company Owner", bg: "bg-purple-500/10 text-purple-600 border-purple-200" },
        manager: { label: "Operations Manager", bg: "bg-blue-500/10 text-blue-600 border-blue-200" },
        staff: { label: "Staff", bg: "bg-slate-500/10 text-slate-600 border-slate-200" },
    }[(companyUser.userRole || "staff") as "owner" | "manager" | "staff"];

    const getOrderStatusBadge = (status: Order["status"]) => {
        switch (status) {
            case "delivered":
                return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200">Delivered</span>;
            case "shipped":
                return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-accent-soft text-accent border border-accent/20">Shipped</span>;
            case "grouped":
                return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-600 border border-blue-200">Grouped in Shipment</span>;
            case "validated":
                return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-200">Validated</span>;
            case "pending":
                return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-200">Pending</span>;
            case "cancelled":
                return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-500/10 text-rose-600 border border-rose-200">Cancelled</span>;
            default:
                return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-surface-muted text-body">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 text-left">

            {/* Top Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Link
                        href="/admin/dashboard/company-users"
                        className="inline-flex items-center gap-2 text-xs font-bold text-body hover:text-heading transition-colors mb-2"
                    >
                        <LuArrowRight className="w-4 h-4" />
                        <span>Back to Company Staff List</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent font-extrabold text-xl flex items-center justify-center border border-accent/20 shadow-xs shrink-0">
                            {companyUser.userName ? companyUser.userName.charAt(0) : "U"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-extrabold text-heading">{companyUser.userName}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.bg}`}>
                                    {roleBadge.label}
                                </span>
                                {companyUser.userIsActive ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                                        <LuCheck className="w-3.5 h-3.5" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-200">
                                        <LuX className="w-3.5 h-3.5" />
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-body mt-0.5 font-latin">
                                {companyUser.userEmail} | Phone: <span className="font-bold text-heading">{companyUser.phone || "Not registered"}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh data"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-accent" : ""}`} />
                    </button>

                    <button
                        onClick={() => toggleStatus({ id: companyUser._id, userIsActive: !companyUser.userIsActive })}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer disabled:opacity-50 ${companyUser.userIsActive
                            ? "bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
                            }`}
                    >
                        <LuPower className="w-4 h-4" />
                        <span>{companyUser.userIsActive ? "Deactivate Account" : "Activate Account"}</span>
                    </button>

                    <button
                        onClick={() => setIsPermissionsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-heading font-bold text-xs transition-all cursor-pointer"
                    >
                        <LuLock className="w-4 h-4 text-accent" />
                        <span>Edit Permissions</span>
                    </button>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPencil className="w-4 h-4" />
                        <span>Edit Data</span>
                    </button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Total Orders Created */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Orders Created</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{ordersCount} <span className="text-xs font-normal text-body">orders</span></h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>By this employee</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuPackage className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Company Membership */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Associated Company</span>
                            <h3 className="text-lg font-bold text-heading my-1 truncate max-w-[180px]">
                                {targetCompany?.companyName || "Unspecified"}
                            </h3>
                            {targetCompany?._id && (
                                <Link
                                    href={`/admin/dashboard/companies/${targetCompany._id}`}
                                    className="text-xs text-accent font-bold flex items-center gap-1 mt-2 hover:underline cursor-pointer"
                                >
                                    <span>Go to Company Page</span>
                                    <LuExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                            <LuBuilding2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Role & Privileges */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Role & Assigned Permissions</span>
                            <h3 className="text-lg font-bold text-heading my-1 font-latin">
                                {companyUser.permissions?.length || 0} <span className="text-xs font-normal text-body">custom permissions</span>
                            </h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Role: {roleBadge.label}</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                            <LuShieldCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Grid Sections: CompanyUser Attributes & Audit Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Personal & Account Information */}
                <div className="bg-surface rounded-md border border-border p-6 space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-bold">
                                <LuUser className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-extrabold text-heading">Account & Employee Information</h2>
                        </div>

                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <LuPencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                        </button>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuUser className="w-4 h-4 text-body/60" />
                                Full Employee Name:
                            </span>
                            <span className="font-bold text-heading">{companyUser.userName}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuMail className="w-4 h-4 text-body/60" />
                                Email Address:
                            </span>
                            <span className="font-latin font-bold text-heading">{companyUser.userEmail}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuPhone className="w-4 h-4 text-body/60" />
                                Phone Number:
                            </span>
                            <span className="font-latin font-bold text-heading">{companyUser.phone || "Not registered"}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuUserCheck className="w-4 h-4 text-body/60" />
                                Role in Organization:
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs border ${roleBadge.bg}`}>
                                {roleBadge.label}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <span className="text-body font-medium flex items-center gap-2">
                                Account Status:
                            </span>
                            {companyUser.userIsActive ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <LuCheck className="w-3.5 h-3.5" />
                                    Active & Enabled
                                </span>
                            ) : (
                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                    <LuX className="w-3.5 h-3.5" />
                                    Temporarily Disabled
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Audit & Creator Information */}
                <div className="bg-surface rounded-md border border-border p-6 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                        <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-bold">
                            <LuShieldCheck className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-extrabold text-heading">Creation & Audit Information</h2>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                Created by:
                            </span>
                            <span className="font-bold text-heading">
                                {createdByDetails ? (
                                    <span className="flex items-center gap-1.5">
                                        <b className="text-heading font-extrabold">{createdByDetails.name}</b>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-muted border border-border text-body">
                                            {createdByDetails.type === "company_user" ? "Company Owner/Employee" : "System Admin"}
                                        </span>
                                    </span>
                                ) : (
                                    <span className="text-heading font-bold">System Admin</span>
                                )}
                            </span>
                        </div>

                        {createdByDetails?.email && (
                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                <span className="text-body font-medium flex items-center gap-2">
                                    <LuMail className="w-4 h-4 text-body/60" />
                                    Admin Account Email:
                                </span>
                                <span className="font-latin text-heading font-semibold">{createdByDetails.email}</span>
                            </div>
                        )}

                        {companyUser.createdAt && (
                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                <span className="text-body font-medium flex items-center gap-2">
                                    <LuCalendar className="w-4 h-4 text-body/60" />
                                    Account Creation Date:
                                </span>
                                <span className="font-latin text-heading font-semibold">
                                    {new Date(companyUser.createdAt).toLocaleDateString('en-US')} ({new Date(companyUser.createdAt).toLocaleTimeString('en-US')})
                                </span>
                            </div>
                        )}

                        {companyUser.updatedAt && (
                            <div className="flex items-center justify-between py-2">
                                <span className="text-body font-medium flex items-center gap-2">
                                    <LuClock className="w-4 h-4 text-body/60" />
                                    Last Profile Update:
                                </span>
                                <span className="font-latin text-heading font-semibold">
                                    {new Date(companyUser.updatedAt).toLocaleDateString('en-US')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Permissions Section */}
            <div className="bg-surface rounded-md border border-border p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-bold">
                            <LuLock className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-extrabold text-heading">
                            Assigned Employee Permissions ({companyUser.permissions?.length || 0})
                        </h2>
                    </div>

                    <button
                        onClick={() => setIsPermissionsModalOpen(true)}
                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <LuPencil className="w-3.5 h-3.5" />
                        <span>Edit Permissions</span>
                    </button>
                </div>

                {companyUser.permissions && companyUser.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                        {companyUser.permissions.map((perm, idx) => (
                            <span
                                key={idx}
                                className="px-3.5 py-1.5 rounded-xl bg-surface-muted border border-border text-xs font-bold text-heading shadow-xs flex items-center gap-1.5"
                            >
                                <LuCheck className="w-3.5 h-3.5 text-accent" />
                                <span>{perm}</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-body italic p-4 bg-surface-muted/50 rounded-2xl border border-border">
                        No additional custom permissions assigned to this employee (standard automatic permissions apply based on the {roleBadge.label} role).
                    </p>
                )}
            </div>

            {/* Recent Orders Created Tab / Section */}
            <div className="bg-surface rounded-md border border-border overflow-hidden space-y-4 p-6">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-bold">
                            <LuPackage className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-extrabold text-heading">
                            Recent Orders Created by Employee ({recentOrders?.length || 0})
                        </h2>
                    </div>

                    <Link
                        href="/admin/dashboard/orders"
                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <span>View All Orders</span>
                        <LuExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentOrders && recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border font-bold text-body">
                                    <th className="py-3 px-4">Order No.</th>
                                    <th className="py-3 px-4">Recipient & City</th>
                                    <th className="py-3 px-4">Quantity & Weight</th>
                                    <th className="py-3 px-4">Order Value</th>
                                    <th className="py-3 px-4">Order Status</th>
                                    <th className="py-3 px-4">Creation Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-surface-muted/40 transition-colors">
                                        <td className="py-3 px-4 font-mono font-bold text-accent">
                                            {order.orderNumber}
                                        </td>
                                        <td className="py-3 px-4">
                                            <b className="text-heading block">{order.recipientName}</b>
                                            <span className="text-[11px] text-body">{order.recipientCity}</span>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-heading font-bold">
                                            {order.quantity} pcs ({order.weight} kg)
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-heading">
                                            {order.orderValue?.toLocaleString()} SAR
                                        </td>
                                        <td className="py-3 px-4">
                                            {getOrderStatusBadge(order.status)}
                                        </td>
                                        <td className="py-3 px-4 font-latin text-body">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US') : 'Not specified'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center bg-surface-muted/50 rounded-2xl border border-border">
                        <p className="text-xs text-body font-bold">This employee hasn't created or submitted any orders yet.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <EditCompanyUsers
                isOpen={isEditModalOpen}
                user={companyUser}
                onClose={() => {
                    setIsEditModalOpen(false);
                    refetch();
                }}
            />

            <EditPermissionsModal
                isOpen={isPermissionsModalOpen}
                user={companyUser}
                onClose={() => {
                    setIsPermissionsModalOpen(false);
                    refetch();
                }}
            />

        </div>
    );
}