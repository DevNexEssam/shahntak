"use client";

import React from 'react';
import Link from 'next/link';
import { CompanyUser, Company } from '@/types/data';
import { useCompanyUser, useToggleCompanyUserStatus } from '@/hooks/companyUsers/useCompanyUsers';
import {
    LuUser,
    LuX,
    LuMail,
    LuPhone,
    LuShieldCheck,
    LuBuilding2,
    LuCalendar,
    LuCheck,
    LuPackage,
    LuExternalLink,
    LuRefreshCw,
    LuPower
} from 'react-icons/lu';

interface DetailsCompanyUsersProps {
    isOpen?: boolean;
    user: CompanyUser | null;
    userId?: string | null;
    onClose: () => void;
}

export default function DetailsCompanyUsers({
    isOpen = true,
    user: initialUser,
    userId: propUserId,
    onClose
}: DetailsCompanyUsersProps) {
    const targetId = propUserId || initialUser?._id || '';

    // Fetch live user data & ordersCount from GET /api/admin/company-users/[id]
    const { data: userRes, isLoading, isFetching } = useCompanyUser(targetId);
    const { mutate: toggleStatus, isPending: isToggling } = useToggleCompanyUserStatus();

    if (!isOpen || (!initialUser && !propUserId)) return null;

    const user = userRes?.data || initialUser;
    const ordersCount = userRes?.ordersCount ?? 0;

    const companyName = typeof user?.companyId === 'object' && user?.companyId !== null
        ? (user.companyId as Company).companyName
        : 'غير محددة';

    const roleBadge = {
        owner: { label: 'مالك الشركة (Owner)', bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
        manager: { label: 'مدير تشغيلي (Manager)', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        staff: { label: 'موظف ', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
    }[(user?.userRole || 'staff') as "owner" | "manager" | "staff"];

    const handleToggleActive = () => {
        if (!user) return;
        toggleStatus({
            id: user._id,
            userIsActive: !user.userIsActive,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
                            <LuUser className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-extrabold text-heading">
                                    {user?.userName || "تفاصيل الموظف"}
                                </h2>
                                {isFetching && (
                                    <LuRefreshCw className="w-3.5 h-3.5 animate-spin text-accent" title="جاري تحديث البيانات..." />
                                )}
                            </div>
                            <p className="text-xs text-body mt-0.5">معاينة سريعة لبيانات الموظف والطلبات المسجلة</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1 text-right">

                    {isLoading && !user ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                            <LuRefreshCw className="w-8 h-8 animate-spin text-accent" />
                            <p className="text-xs font-bold text-body">جاري جلب تفاصيل الموظف...</p>
                        </div>
                    ) : user ? (
                        <>
                            {/* Top Identity & Action Card */}
                            <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent font-extrabold text-lg flex items-center justify-center border border-accent/20 shrink-0">
                                        {user.userName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-heading">{user.userName}</h3>
                                        <p className="text-xs text-body font-latin">{user.userEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.bg}`}>
                                        {roleBadge.label}
                                    </span>

                                    {/* Quick Toggle Active Status Button */}
                                    <button
                                        onClick={handleToggleActive}
                                        disabled={isToggling}
                                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${user.userIsActive
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-200"
                                                : "bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-200"
                                            }`}
                                        title={user.userIsActive ? "اضغط لتعطيل الحساب" : "اضغط لتفعيل الحساب"}
                                    >
                                        <LuPower className={`w-3.5 h-3.5 ${isToggling ? "animate-spin" : ""}`} />
                                        <span>{user.userIsActive ? "نشط (تعطيل؟)" : "غير نشط (تفعيل؟)"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Orders Count & Core Metrics Card */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Orders Count Card */}
                                <div className="p-4 bg-surface rounded-2xl border border-border flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold text-body block mb-1">الطلبات المرفوعة بواسطة الموظف</span>
                                        <h4 className="text-2xl font-bold text-heading font-latin">{ordersCount} <span className="text-xs font-normal text-body">طلب</span></h4>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                        <LuPackage className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Phone Card */}
                                <div className="p-4 bg-surface rounded-2xl border border-border flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold text-body block mb-1">رقم الهاتف التواصل</span>
                                        <h4 className="text-sm font-bold text-heading font-latin dir-ltr text-right">{user.phone || 'غير مسجل'}</h4>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                        <LuPhone className="w-5 h-5" />
                                    </div>
                                </div>

                            </div>

                            {/* Company Card */}
                            <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                    <LuBuilding2 className="w-4 h-4" />
                                    الشركة التابع لها الموظف
                                </h4>
                                <div className="flex items-center justify-between text-sm pt-1">
                                    <div>
                                        <span className="text-xs text-body block font-medium">اسم الشركة:</span>
                                        <span className="font-bold text-heading">{companyName}</span>
                                    </div>
                                    {typeof user.companyId === 'object' && user.companyId?._id && (
                                        <Link
                                            href={`/admin/dashboard/companies/${(user.companyId as Company)._id}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline cursor-pointer"
                                        >
                                            <span>صفحة الشركة</span>
                                            <LuExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Permissions Summary */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-heading flex items-center gap-2">
                                    <LuShieldCheck className="w-4 h-4 text-accent" />
                                    الصلاحيات المخصصة ({user.permissions?.length || 0})
                                </h4>
                                {user.permissions && user.permissions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {user.permissions.map((perm, idx) => (
                                            <span key={idx} className="px-3 py-1 rounded-md bg-surface-muted border border-border text-xs font-bold text-heading">
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-body italic">لا توجد صلاحيات مخصصة إضافية (تطبق صلاحيات الدور الافتراضية)</p>
                                )}
                            </div>

                            {/* Dates Footer */}
                            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-body">
                                <div className="flex items-center gap-1.5">
                                    <LuCalendar className="w-3.5 h-3.5 text-body/60" />
                                    <span>تاريخ الإضافة: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <LuMail className="w-3.5 h-3.5 text-body/60" />
                                    <span className="font-latin">{user.userEmail}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center text-rose-600 font-bold text-xs">
                            تعذر تحميل بيانات الموظف.
                        </div>
                    )}

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-border bg-surface-muted/40 flex items-center justify-between shrink-0">
                    {user ? (
                        <Link
                            href={`/admin/dashboard/company-users/${user._id}`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline cursor-pointer"
                        >
                            <LuExternalLink className="w-4 h-4" />
                            <span>عرض الصفحة التفصيلية الكاملة</span>
                        </Link>
                    ) : <div />}

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
