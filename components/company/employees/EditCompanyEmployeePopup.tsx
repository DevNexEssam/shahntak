"use client";

import React, { useState, useEffect } from 'react';
import { useUpdateCompanyEmployee } from '@/hooks/company/useCompanyEmployee';
import toast from 'react-hot-toast';
import {
    LuUsers,
    LuX,
    LuUser,
    LuMail,
    LuPhone,
    LuShieldCheck
} from 'react-icons/lu';

interface EditCompanyEmployeePopupProps {
    isOpen?: boolean;
    onClose: () => void;
    employeeData: any;
}

export default function EditCompanyEmployeePopup({ isOpen = true, onClose, employeeData }: EditCompanyEmployeePopupProps) {
    const [formValues, setFormValues] = useState({
        userName: '',
        userEmail: '',
        phone: '',
        userRole: 'staff' as 'owner' | 'manager' | 'staff',
        userIsActive: true,
    });

    useEffect(() => {
        if (employeeData) {
            setFormValues({
                userName: employeeData.userName || '',
                userEmail: employeeData.userEmail || '',
                phone: employeeData.phone || '',
                userRole: employeeData.userRole || 'staff',
                userIsActive: employeeData.userIsActive !== undefined ? employeeData.userIsActive : true,
            });
        }
    }, [employeeData]);

    const { mutate: updateEmployee, isPending: isSubmitting } = useUpdateCompanyEmployee();

    if (!isOpen || !employeeData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        updateEmployee(
            { id: employeeData._id, updates: formValues },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuUsers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات الموظف</h2>
                            <p className="text-xs text-body mt-0.5">تحديث الاسم والدور وحالة الحساب</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-50"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-5 flex-1">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuUser className="w-3.5 h-3.5 text-body" />
                                    اسم الموظف
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.userName}
                                    onChange={(e) => setFormValues({ ...formValues, userName: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMail className="w-3.5 h-3.5 text-body" />
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    disabled={isSubmitting}
                                    value={formValues.userEmail}
                                    onChange={(e) => setFormValues({ ...formValues, userEmail: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuPhone className="w-3.5 h-3.5 text-body" />
                                    رقم الهاتف
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.phone}
                                    onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading">حالة الحساب</label>
                                <select
                                    value={formValues.userIsActive ? 'active' : 'inactive'}
                                    onChange={(e) => setFormValues({ ...formValues, userIsActive: e.target.value === 'active' })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer font-bold"
                                >
                                    <option value="active">نشط ومفعل</option>
                                    <option value="inactive">مجمد وغير نشط</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuShieldCheck className="w-3.5 h-3.5 text-body" />
                                دور الموظف
                            </label>
                            <select
                                value={formValues.userRole}
                                onChange={(e) => setFormValues({ ...formValues, userRole: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer font-bold"
                            >
                                <option value="staff">موظف</option>
                                <option value="manager">مدير تشغيل</option>
                                <option value="owner">مالك الشركة</option>
                            </select>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "جاري التحديث..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
