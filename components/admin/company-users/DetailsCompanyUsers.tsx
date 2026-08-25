"use client";

import React from 'react';
import { CompanyUser, Company } from '@/types/data';
import {
    LuUser,
    LuX,
    LuMail,
    LuPhone,
    LuShieldCheck,
    LuBuilding2,
    LuCalendar,
    LuCheck,
    LuKey
} from 'react-icons/lu';

interface DetailsCompanyUsersProps {
    isOpen?: boolean;
    user: CompanyUser | null;
    onClose: () => void;
}

export default function DetailsCompanyUsers({ isOpen = true, user, onClose }: DetailsCompanyUsersProps) {
    if (!isOpen || !user) return null;

    const companyName = typeof user.companyId === 'object' && user.companyId !== null
        ? (user.companyId as Company).companyName
        : 'غير محددة';

    const companyEmail = typeof user.companyId === 'object' && user.companyId !== null
        ? (user.companyId as Company).email
        : null;

    const roleBadge = {
        owner: { label: 'مالك الشركة (Owner)', bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
        manager: { label: 'مدير تشغيلي (Manager)', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        staff: { label: 'موظف (Staff)', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
    }[user.userRole || 'staff'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuUser className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل بيانات الموظف</h2>
                            <p className="text-xs text-body mt-0.5">عرض بطاقة الموظف والشركة التابع لها والصلاحيات</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Top Identity Card */}
                    <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent font-extrabold text-lg flex items-center justify-center border border-accent/20">
                                {user.userName?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-heading">{user.userName}</h3>
                                <p className="text-xs text-body font-latin">{user.userEmail}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.bg}`}>
                                {roleBadge.label}
                            </span>
                            {user.userIsActive ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                                    <LuCheck className="w-3.5 h-3.5" />
                                    نشط
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-200">
                                    <LuX className="w-3.5 h-3.5" />
                                    غير نشط
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Company Card */}
                    <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <LuBuilding2 className="w-4 h-4" />
                            بيانات الشركة التابع لها
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-1">
                            <div>
                                <span className="text-xs text-body block font-medium">اسم الشركة:</span>
                                <span className="font-bold text-heading">{companyName}</span>
                            </div>
                            {companyEmail && (
                                <div>
                                    <span className="text-xs text-body block font-medium">بريد الشركة:</span>
                                    <span className="font-bold text-heading font-latin">{companyEmail}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Properties Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border space-y-1">
                            <span className="text-xs text-body flex items-center gap-1.5 font-medium">
                                <LuPhone className="w-3.5 h-3.5 text-accent" />
                                رقم الجوال
                            </span>
                            <span className="text-sm font-bold text-heading font-latin block">{user.phone || 'غير مسجل'}</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border space-y-1">
                            <span className="text-xs text-body flex items-center gap-1.5 font-medium">
                                <LuMail className="w-3.5 h-3.5 text-accent" />
                                البريد الشخصي
                            </span>
                            <span className="text-sm font-bold text-heading font-latin block">{user.userEmail}</span>
                        </div>
                    </div>

                    {/* Permissions list */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-heading flex items-center gap-2">
                            <LuShieldCheck className="w-4 h-4 text-accent" />
                            الصلاحيات الممنوحة
                        </h4>
                        {user.permissions && user.permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {user.permissions.map((perm, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-xl bg-surface-muted border border-border text-xs font-bold text-heading">
                                        {perm}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-body italic">لا توجد صلاحيات مخصصة إضافية (تطبق صلاحيات الدور الافتراضية)</p>
                        )}
                    </div>

                    {/* Dates Footer */}
                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-body">
                        <div className="flex items-center gap-1.5">
                            <LuCalendar className="w-3.5 h-3.5 text-body/60" />
                            <span>تاريخ الإنشاء: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-latin">
                            <LuKey className="w-3.5 h-3.5 text-body/60" />
                            <span>ID: {user._id}</span>
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-border bg-surface-muted/40 flex justify-end shrink-0">
                    <button
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
