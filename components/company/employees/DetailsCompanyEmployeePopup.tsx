"use client";

import React from 'react';
import {
    LuUsers,
    LuX,
    LuUser
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
            case 'owner': return 'مالك الشركة';
            case 'manager': return 'مدير تشغيل';
            default: return 'موظف';
        }
    };

    const isActive = employeeData.userIsActive !== false && employeeData.status !== 'inactive';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150">
            <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuUsers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-foreground">{employeeData.userName}</h2>
                                {isActive ? (
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">
                                        نشط ومفعل
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                                        مجمد
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-latin">{employeeData.userEmail}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">

                    {/* Summary Info Row */}
                    <div className="p-4 rounded-md bg-surface-muted border border-border flex items-center justify-between text-xs">
                        <div>
                            <span className="text-muted-foreground block">تاريخ الإضافة للحساب</span>
                            <span className="font-bold text-foreground font-latin text-sm">
                                {new Date(employeeData.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                            </span>
                        </div>
                        <div className="text-left">
                            <span className="text-muted-foreground block">معرف الموظف</span>
                            <span className="font-bold text-foreground font-latin text-xs">
                                {employeeData._id}
                            </span>
                        </div>
                    </div>

                    {/* Profile Information Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuUser className="w-4 h-4 text-accent" />
                            <span>بيانات الملف الشخصي والحساب</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">اسم الموظف</span>
                                <span className="font-semibold text-foreground">{employeeData.userName}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">البريد الإلكتروني</span>
                                <span className="font-semibold text-foreground font-latin">{employeeData.userEmail}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">رقم الهاتف والجوال</span>
                                <span className="font-semibold text-foreground font-latin dir-ltr">{employeeData.phone}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-muted-foreground">الدور الوظيفي في النظام</span>
                                <span className="font-semibold text-accent">{getRoleLabel(employeeData.userRole)}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-border/20 transition-colors text-foreground cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
