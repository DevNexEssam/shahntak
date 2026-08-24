"use client";

import React, { useState, useMemo } from "react";
import { useUsers, useDeleteUser } from "@/hooks/users/useUsers";
import { User } from "@/types/data";
import AddUsers from "./AddUsers";
import EditUsers from "./EditUsers";
import DetailsUsers from "./DetailsUsers";
import ConfirmDeletePopup from "@/components/ui/ConfirmDeletePopup";
import EmptyData from "@/components/ui/EmptyData";
import {
    LuUser,
    LuPlus,
    LuPencil,
    LuSearch,
    LuFilter,
    LuUserCheck,
    LuUserX,
    LuEye,
    LuTrash2,
    LuChevronRight,
    LuChevronLeft,
    LuRefreshCw,
    LuShieldCheck
} from "react-icons/lu";

export default function Users() {
    // 1. Pagination & Search/Filter states
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const limit = 10;

    // 2. Modal Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);

    // 3. React Query Hooks
    const { data: res, isLoading, isError, error, refetch, isFetching } = useUsers(page, limit, searchQuery, filterStatus);
    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

    // 4. Handlers for search/filter resetting page to 1
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value);
        setPage(1);
    };

    // 5. Calculated Stats
    const stats = useMemo(() => {
        const list = res?.data || [];
        const total = res?.total ?? list.length;
        const active = res?.stats?.active ?? list.filter((u) => u.status === "active").length;
        const inactive = res?.stats?.inactive ?? list.filter((u) => u.status === "inactive").length;
        return { total, active, inactive };
    }, [res]);

    const usersList: User[] = res?.data || [];
    const totalPages = Math.ceil((res?.total || usersList.length || 1) / limit);

    // 6. Delete Action Handler
    const handleDeleteConfirm = () => {
        if (!userToDeleteId) return;
        deleteUser(userToDeleteId, {
            onSuccess: () => {
                setUserToDeleteId(null);
            },
        });
    };

    return (
        <section className="space-y-6 text-right" dir="rtl">
            {/* Error Banner */}
            {isError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
                    حدث خطأ في تحميل بيانات المستخدمين: {(error as Error)?.message || "خطأ في الاتصال بالخادم"}
                </div>
            )}

            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-2">
                        <LuUser className="w-7 h-7 text-accent" />
                        إدارة المستخدمين والمدراء
                    </h1>
                    <p className="text-sm text-body mt-0.5">إدارة فريق عمل منصة شحنتك وتخصيص صلاحيات الوصول.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-heading transition-colors disabled:opacity-50"
                        title="تحديث البيانات"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-accent" : ""}`} />
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إضافة مستخدم جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface p-5 rounded-2xl border border-border flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-bold text-body block mb-1">إجمالي المستخدمين</span>
                        <b className="font-latin text-2xl font-extrabold text-heading">{stats.total}</b>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-bold text-xl">
                        <LuUser className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-2xl border border-border flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-bold text-body block mb-1">المستخدمون النشطون</span>
                        <b className="font-latin text-2xl font-extrabold text-success">{stats.active}</b>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-success-soft text-success flex items-center justify-center font-bold text-xl">
                        <LuUserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-2xl border border-border flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs font-bold text-body block mb-1">غير النشطين</span>
                        <b className="font-latin text-2xl font-extrabold text-rose-500">{stats.inactive}</b>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xl">
                        <LuUserX className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث بالاسم، البريد، أو رقم الجوال..."
                        className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-xl">
                        <LuFilter className="w-3.5 h-3.5 text-body" />
                        <select
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            className="bg-transparent text-xs font-bold text-heading focus:outline-none cursor-pointer"
                        >
                            <option value="all">الحالة: الكل</option>
                            <option value="active">نشط فقط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>

                    <span className="text-xs font-bold text-body bg-surface-muted px-3 py-2 rounded-xl border border-border">
                        إجمالي: {stats.total} مستخدم
                    </span>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-surface-muted/60 border-b border-border text-xs text-body font-bold">
                            <tr>
                                <th className="py-3.5 px-5">المستخدم</th>
                                <th className="py-3.5 px-4">البريد الإلكتروني</th>
                                <th className="py-3.5 px-4 font-latin">الجوال</th>
                                <th className="py-3.5 px-4">الصلاحية (Role)</th>
                                <th className="py-3.5 px-4">الحالة</th>
                                <th className="py-3.5 px-5 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                                            </div>
                                        </td>
                                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36" /></td>
                                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" /></td>
                                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>
                                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>
                                        <td className="py-4 px-5 text-center"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : usersList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <EmptyData message="لا يوجد مستخدمون يطابقون خيارات البحث الحالية." />
                                    </td>
                                </tr>
                            ) : (
                                usersList.map((user) => (
                                    <tr key={user._id} className="hover:bg-surface-muted/30 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent font-bold flex items-center justify-center shrink-0">
                                                    {user.name ? user.name.charAt(0) : "U"}
                                                </div>
                                                <div>
                                                    <b className="text-heading block">{user.name}</b>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-latin text-xs text-heading">
                                            {user.email}
                                        </td>
                                        <td className="py-4 px-4 font-latin text-xs text-heading">
                                            {user.phone}
                                        </td>
                                        <td className="py-4 px-4 text-xs font-bold text-heading">
                                            <span className="inline-flex items-center gap-1">
                                                <LuShieldCheck className="w-3.5 h-3.5 text-accent" />
                                                {user.role === "super" ? "سوبر أدمن" : "مدير (Admin)"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            {user.status === "active" ? (
                                                <span className="inline-flex items-center gap-1.5 font-bold text-success text-[11px] bg-success-soft px-2.5 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                                    نشط
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 font-bold text-body text-[11px] bg-surface-muted px-2.5 py-0.5 rounded-full border border-border">
                                                    غير نشط
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDetailsOpen(true);
                                                    }}
                                                    title="عرض التفاصيل"
                                                    className="p-2 rounded-xl hover:bg-surface-muted text-body hover:text-accent border border-transparent hover:border-border transition-colors cursor-pointer"
                                                >
                                                    <LuEye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditOpen(true);
                                                    }}
                                                    title="تعديل المستخدم"
                                                    className="p-2 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-colors cursor-pointer"
                                                >
                                                    <LuPencil className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setUserToDeleteId(user._id)}
                                                    title="حذف المستخدم"
                                                    className="p-2 rounded-xl hover:bg-rose-500/10 text-body hover:text-rose-500 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                                                >
                                                    <LuTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between">
                        <span className="text-xs font-bold text-body font-latin">
                            صفحة {page} من {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <LuChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page >= totalPages}
                                className="p-2 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <LuChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddUsers
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditUsers
                isOpen={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedUser(null);
                }}
                userData={selectedUser}
            />

            <DetailsUsers
                user={selectedUser}
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedUser(null);
                }}
            />

            <ConfirmDeletePopup
                isOpen={!!userToDeleteId}
                onClose={() => setUserToDeleteId(null)}
                onConfirm={handleDeleteConfirm}
                isDeleting={isDeleting}
                title="تأكيد حذف المستخدم"
                description="هل أنت تأكد من رغبتك في حذف هذا المستخدم نهائياً؟ لن يتمكن من تسجيل الدخول أو استخدام النظام بعد الآن."
            />
        </section>
    );
}
