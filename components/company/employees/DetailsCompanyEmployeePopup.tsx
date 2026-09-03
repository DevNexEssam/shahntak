"use client";

import React from 'react';
import {
    LuUsers,
    LuX,
    LuUser,
    LuMail,
    LuPhone,
    LuShieldCheck,
    LuCalendar,
    LuCheck,
    LuLock
} from 'react-icons/lu';

interface DetailsCompanyEmployeePopupProps {
    isOpen?: boolean;
    onClose: () => void;
    employeeData: any;
}

export default function DetailsCompanyEmployeePopup({ isOpen = true, onClose, employeeData }: DetailsCompanyEmployeePopupProps) {
    if (!isOpen || !employeeData) return null;

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'owner': return 'مالك الشركة (Owner)';
            case 'manager': return 'مدير (Manager)';
            default: return 'موظف (Staff)';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuUsers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-extrabold text-heading">{employeeData.userName}</h2>
                                {employeeData.userIsActive !== false ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        <LuCheck className="w-3.5 h-3.5" />
                                        نشط
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                        <LuLock className="w-3.5 h-3.5" />
                                        مجمد
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-body mt-0.5 font-latin">{employeeData.userEmail}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Profile Summary Card */}
                    <div className="p-5 rounded-2xl bg-surface-muted/60 border border-border space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <LuUser className="w-4 h-4" />
                            بيانات الملف الشخصي والحساب
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-body block font-medium">اسم الموظف</span>
                                <span className="font-extrabold text-heading">{employeeData.userName}</span>
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">البريد الإلكتروني</span>
                                <span className="font-bold text-heading font-latin">{employeeData.userEmail}</span>
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">رقم الهاتف</span>
                                <span className="font-bold text-heading font-latin dir-ltr inline-block">{employeeData.phone}</span>
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">الدور في النظام</span>
                                <span className="font-bold text-accent">{getRoleLabel(employeeData.userRole)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Metadata */}
                    <div className="flex items-center justify-between text-xs text-body border-t border-border pt-4">
                        <span className="flex items-center gap-1.5 font-latin">
                            <LuCalendar className="w-4 h-4 text-accent" />
                            تاريخ الإضافة: {new Date(employeeData.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-surface-muted font-bold text-heading font-latin">
                            ID: {employeeData._id}
                        </span>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
