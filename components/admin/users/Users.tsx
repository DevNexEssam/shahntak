"use client";

import React, { useState, useMemo } from "react";
import { useUsers, useDeleteUser } from "@/hooks/users/useUsers";
import { User } from "@/types/data";
import AddUsers from "./AddUsers";
import EditUsers from "./EditUsers";
import DetailsUsers from "./DetailsUsers";
import ConfirmDeletePopup from "@/components/ui/ConfirmDeletePopup";
import EmptyData from "@/components/ui/EmptyData";
import Loading from "@/components/ui/loading";
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

    // Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

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
    const stats = {
        total: res?.total ?? (res?.data || []).length,
        active: res?.stats?.active ?? (res?.data || []).filter((u) => u.status === "active").length,
        inactive: res?.stats?.inactive ?? (res?.data || []).filter((u) => u.status === "inactive").length,
    };

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
        <section className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuUser className="w-5 h-5" />
                        </span>
                        إدارة المستخدمين والمدراء
                    </h1>
                    <p className="text-xs text-body mt-1">إدارة فريق عمل منصة شحنتك وتخصيص صلاحيات الوصول والمستويات القيادية</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="تحديث البيانات"
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-accent" : ""}`} />
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إضافة مستخدم جديد</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center justify-between">
                    <span>حدث خطأ في تحميل بيانات المستخدمين: {(error as Error)?.message || "خطأ في الاتصال بالخادم"}</span>
                    <button onClick={() => refetch()} className="underline text-xs cursor-pointer">إعادة المحاولة</button>
                </div>
            )}

            {/* KPI Stats Grid - Matching Companies.tsx Design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي المستخدمين</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>المسجلين بالنظام</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuUser className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">المستخدمون النشطون</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.active}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>حسابات مفعلة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuUserCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">غير النشطين</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.inactive}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>حسابات موقوفة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuUserX className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث بالاسم، البريد، أو رقم الجوال..."
                        className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
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
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط فقط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {usersList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا يوجد مستخدمون يطابقون خيارات البحث الحالية" icon={LuUser} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">المستخدم</th>
                                    <th className="py-3.5 px-4">البريد الإلكتروني</th>
                                    <th className="py-3.5 px-4">الجوال</th>
                                    <th className="py-3.5 px-4">الصلاحية (Role)</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {usersList.map((user) => (
                                    <tr key={user._id} className="hover:bg-surface-muted/40 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-md bg-accent-soft text-accent font-extrabold flex items-center justify-center shrink-0 border border-accent/20">
                                                    {user.name ? user.name.charAt(0) : "U"}
                                                </div>
                                                <div>
                                                    <b className="text-heading block">{user.name}</b>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 font-latin text-xs font-semibold text-heading">
                                            {user.email}
                                        </td>

                                        <td className="py-3.5 px-4 font-latin text-xs font-semibold text-heading">
                                            {user.phone}
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-bold text-heading">
                                            <span className="inline-flex items-center gap-1">
                                                <LuShieldCheck className="w-3.5 h-3.5 text-accent" />
                                                {user.role === "super" ? "سوبر أدمن" : "مدير (Admin)"}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            {user.status === "active" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    نشط
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-200">
                                                    غير نشط
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDetailsOpen(true);
                                                    }}
                                                    title="عرض التفاصيل"
                                                    className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                >
                                                    <LuEye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditOpen(true);
                                                    }}
                                                    title="تعديل المستخدم"
                                                    className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                >
                                                    <LuPencil className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setUserToDeleteId(user._id)}
                                                    title="حذف المستخدم"
                                                    className="p-2 rounded-md bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
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
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs font-bold text-body">
                        <span className="text-body font-medium">
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {stats.total} مستخدم)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronRight className="w-4 h-4" />
                                <span>السابق</span>
                            </button>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page >= totalPages}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <span>التالي</span>
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
