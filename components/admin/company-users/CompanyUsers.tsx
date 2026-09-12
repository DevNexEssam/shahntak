"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCompanyUsers, useDeleteCompanyUser } from '@/hooks/companyUsers/useCompanyUsers';
import { CompanyUser, Company } from '@/types/data';
import AddCompanyUsers from './AddCompanyUsers';
import EditCompanyUsers from './EditCompanyUsers';
import DetailsCompanyUsers from './DetailsCompanyUsers';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import {
    LuUserCheck,
    LuUsers,
    LuPlus,
    LuSearch,
    LuRefreshCw,
    LuPencil,
    LuEye,
    LuExternalLink,
    LuTrash2,
    LuChevronRight,
    LuChevronLeft,
    LuBuilding2,
    LuShieldCheck,
    LuUserPlus,
    LuFilter
} from 'react-icons/lu';

export default function CompanyUsers() {
    // Pagination & Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'owner' | 'manager' | 'staff'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    // Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<CompanyUser | null>(null);
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<CompanyUser | null>(null);
    const [selectedUserForDelete, setSelectedUserForDelete] = useState<CompanyUser | null>(null);

    // React Query Hooks
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCompanyUsers(page, limit);
    const { mutate: deleteCompanyUser, isPending: isDeleting } = useDeleteCompanyUser();

    // Initial Loading Check (Standardized Rule)
    if (isLoading) return <Loading />;

    const companyUsersList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const stats = responseData?.stats || { active: 0, inactive: 0, total: 0 };

    // Rule 2: Always setPage(1) on search/filter changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterRole(e.target.value as 'all' | 'owner' | 'manager' | 'staff');
        setPage(1);
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value as 'all' | 'active' | 'inactive');
        setPage(1);
    };

    // Client-side search and role filtering
    const filteredUsers = companyUsersList.filter((user) => {
        const companyName = typeof user.companyId === 'object' && user.companyId !== null
            ? (user.companyId as Company).companyName
            : '';
        const matchesSearch =
            user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone?.includes(searchQuery) ||
            companyName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === 'all' || user.userRole === filterRole;
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' ? user.userIsActive : !user.userIsActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Rule 3: Cleanup selected item on close
    const handleCloseEdit = () => setSelectedUserForEdit(null);
    const handleCloseDetails = () => setSelectedUserForDetails(null);
    const handleCloseDelete = () => setSelectedUserForDelete(null);

    const handleConfirmDelete = () => {
        if (!selectedUserForDelete) return;
        deleteCompanyUser(
            { id: selectedUserForDelete._id },
            {
                onSuccess: () => {
                    handleCloseDelete();
                },
            }
        );
    };

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-xs">
                            <LuUsers className="w-5 h-5" />
                        </span>
                        إدارة موظفي الشركات
                    </h1>
                    <p className="text-xs text-body mt-1">
                        متابعة وتعيين موظفي الشركات والشركاء اللوجستيين وتحديث صلاحياتهم على المنصة.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                        title="تحديث البيانات"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-accent" : ""}`} />
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إضافة موظف شركة جديد</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {isError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold flex items-center justify-between">
                    <span>حدث خطأ في تحميل بيانات موظفي الشركات: {(error as Error)?.message || "خطأ في الاتصال بالخادم"}</span>
                    <button onClick={() => refetch()} className="underline text-xs cursor-pointer">إعادة المحاولة</button>
                </div>
            )}

            {/* KPI Stats Cards - Matching Companies.tsx Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Employees */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الموظفين</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.total || totalRecords}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>المسجلين بالمنصة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuUsers className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Active Accounts */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الحسابات النشطة</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.active}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>حسابات مفعلة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuUserCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Owners */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">مالكو الشركات</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{companyUsersList.filter(u => u.userRole === 'owner').length}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>صلاحيات المالك</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuShieldCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Managers */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">المديرون والتشغيليون</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{companyUsersList.filter(u => u.userRole === 'manager').length}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>إدارة العمليات</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuUserPlus className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 text-body absolute right-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="ابحث بالاسم، البريد، الجوال، أو الشركة..."
                        className="w-full pr-10 pl-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-md border border-border">
                        <LuFilter className="w-4 h-4 text-body" />
                        <span className="text-xs font-bold text-heading">الدور:</span>
                        <select
                            value={filterRole}
                            onChange={handleRoleFilterChange}
                            className="bg-transparent text-xs font-bold text-heading focus:outline-none cursor-pointer"
                        >
                            <option value="all">الكل</option>
                            <option value="owner">مالك</option>
                            <option value="manager">مدير</option>
                            <option value="staff">موظف</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-md border border-border">
                        <span className="text-xs font-bold text-heading">الحالة:</span>
                        <select
                            value={filterStatus}
                            onChange={handleStatusFilterChange}
                            className="bg-transparent text-xs font-bold text-heading focus:outline-none cursor-pointer"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا يوجد موظفون يطابقون خيارات البحث أو التصفية الحالية" icon={LuUsers} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">الموظف</th>
                                    <th className="py-3.5 px-4">الشركة التابع لها</th>
                                    <th className="py-3.5 px-4">رقم الجوال</th>
                                    <th className="py-3.5 px-4">الدور</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {filteredUsers.map((user) => {
                                    const companyName = typeof user.companyId === 'object' && user.companyId !== null
                                        ? (user.companyId as Company).companyName
                                        : 'شركة غير محددة';

                                    const roleBadgeClass = {
                                        owner: 'bg-purple-500/10 text-purple-600 border-purple-200',
                                        manager: 'bg-blue-500/10 text-blue-600 border-blue-200',
                                        staff: 'bg-slate-500/10 text-slate-600 border-slate-200',
                                    }[user.userRole || 'staff'];

                                    const roleLabel = {
                                        owner: 'مالك شركة',
                                        manager: 'مدير تشغيلي',
                                        staff: 'موظف',
                                    }[user.userRole || 'staff'];

                                    return (
                                        <tr key={user._id} className="hover:bg-surface-muted/40 transition-colors">
                                            {/* User Info */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-md bg-accent/10 text-accent font-extrabold flex items-center justify-center shrink-0 border border-accent/20">
                                                        {user.userName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-heading block">{user.userName}</span>
                                                        <span className="text-xs text-body font-latin">{user.userEmail}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Company */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2 text-heading font-bold">
                                                    <LuBuilding2 className="w-4 h-4 text-accent" />
                                                    <span>{companyName}</span>
                                                </div>
                                            </td>

                                            {/* Phone */}
                                            <td className="py-3.5 px-4 font-latin text-body">
                                                {user.phone || '-'}
                                            </td>

                                            {/* Role */}
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleBadgeClass}`}>
                                                    {roleLabel}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                {user.userIsActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        نشط
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        غير نشط
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedUserForDetails(user)}
                                                        title="معاينة سريعة (Popup)"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-colors cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <Link
                                                        href={`/admin/dashboard/company-users/${user._id}`}
                                                        title="عرض الصفحة التفصيلية الكاملة"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-colors cursor-pointer inline-flex items-center justify-center"
                                                    >
                                                        <LuExternalLink className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        onClick={() => setSelectedUserForEdit(user)}
                                                        title="تعديل"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-colors cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedUserForDelete(user)}
                                                        title="حذف"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-colors cursor-pointer"
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

                {/* Pagination Footer */}
                {totalRecords > 0 && (
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between flex-wrap gap-4 text-xs font-bold text-body">
                        <div>
                            عرض الصفحات: <span className="text-heading font-latin">{page}</span> من <span className="text-heading font-latin">{totalPages}</span> (إجمالي <span className="text-heading font-latin">{totalRecords}</span> موظف)
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-40"
                            >
                                <LuChevronRight className="w-4 h-4" />
                                <span>السابق</span>
                            </button>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page >= totalPages}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-40"
                            >
                                <span>التالي</span>
                                <LuChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddCompanyUsers
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditCompanyUsers
                isOpen={!!selectedUserForEdit}
                user={selectedUserForEdit}
                onClose={handleCloseEdit}
            />

            <DetailsCompanyUsers
                isOpen={!!selectedUserForDetails}
                user={selectedUserForDetails}
                onClose={handleCloseDetails}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedUserForDelete}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title="تأكيد حذف الموظف"
                description={`هل أنت تأكد من رغبتك في حذف الموظف "${selectedUserForDelete?.userName}"؟ سيتم تعطيل حسابه مؤقتاً بالمنصة.`}
            />

        </div>
    );
}
