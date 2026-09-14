"use client";

import React, { useState } from 'react';
import { useCreateCompanyEmployee } from '@/hooks/company/useCompanyEmployee';
import toast from 'react-hot-toast';
import {
    LuUsers,
    LuX,
    LuUser,
    LuMail,
    LuPhone,
    LuLock,
    LuShieldCheck
} from 'react-icons/lu';

interface AddCompanyEmployeePopupProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddCompanyEmployeePopup({ isOpen = true, onClose }: AddCompanyEmployeePopupProps) {
    const [formValues, setFormValues] = useState({
        userName: '',
        userEmail: '',
        phone: '',
        password: '',
        userRole: 'staff' as 'owner' | 'manager' | 'staff',
        userIsActive: true,
    });

    const { mutate: createEmployee, isPending: isSubmitting } = useCreateCompanyEmployee();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formValues.userName || !formValues.userEmail || !formValues.phone || !formValues.password) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        createEmployee({ data: formValues }, {
            onSuccess: () => {
                setFormValues({
                    userName: '',
                    userEmail: '',
                    phone: '',
                    password: '',
                    userRole: 'staff',
                    userIsActive: true,
                });
                onClose();
            },
        });
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
                            <h2 className="text-xl font-extrabold text-heading">إضافة موظف جديد للشركة</h2>
                            <p className="text-xs text-body mt-0.5">إنشاء حساب جديد لموظف وتأطير دوره وصلاحياته</p>
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
                                    اسم الموظف <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.userName}
                                    onChange={(e) => setFormValues({ ...formValues, userName: e.target.value })}
                                    placeholder="اسم الموظف الثلاثي"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMail className="w-3.5 h-3.5 text-body" />
                                    البريد الإلكتروني <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    disabled={isSubmitting}
                                    value={formValues.userEmail}
                                    onChange={(e) => setFormValues({ ...formValues, userEmail: e.target.value })}
                                    placeholder="employee@company.com"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuPhone className="w-3.5 h-3.5 text-body" />
                                    رقم الهاتف <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.phone}
                                    onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                                    placeholder="0501234567"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuLock className="w-3.5 h-3.5 text-body" />
                                    كلمة المرور <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    disabled={isSubmitting}
                                    value={formValues.password}
                                    onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuShieldCheck className="w-3.5 h-3.5 text-body" />
                                دور الموظف في النظام
                            </label>
                            <select
                                value={formValues.userRole}
                                onChange={(e) => setFormValues({ ...formValues, userRole: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer font-bold"
                            >
                                <option value="staff">موظف (Staff) - متابعة وإدخال العمليات</option>
                                <option value="manager">مدير فرع / تشغيل (Manager) - إشراف وإمكانيات كاملة</option>
                                <option value="owner">مالك شركة (Owner) - صلاحيات إدارة الحساب بالكامل</option>
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
                            {isSubmitting ? "جاري الإضافة..." : "حفظ الموظف"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
