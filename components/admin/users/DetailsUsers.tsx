"use client";

import React from 'react';
import { User } from '@/types/data';
import { LuUser, LuX, LuMail, LuPhone, LuShieldCheck, LuCalendar, LuHash } from 'react-icons/lu';

interface DetailsUsersProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailsUsers: React.FC<DetailsUsersProps> = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuUser className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل المستخدم</h2>
                            <p className="text-xs text-body mt-0.5">معلومات الحساب الكاملة والصلاحيات</p>
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

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4 text-sm text-right">
                    <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-xs text-body font-semibold flex items-center gap-1.5">
                                <LuHash className="w-3.5 h-3.5 text-accent" />
                                المعرف (ID)
                            </span>
                            <span className="font-latin text-xs font-bold text-heading">{user._id}</span>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-xs text-body font-semibold flex items-center gap-1.5">
                                <LuUser className="w-3.5 h-3.5 text-accent" />
                                الاسم الكامل
                            </span>
                            <span className="font-bold text-heading">{user.name}</span>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-xs text-body font-semibold flex items-center gap-1.5">
                                <LuMail className="w-3.5 h-3.5 text-accent" />
                                البريد الإلكتروني
                            </span>
                            <span className="font-latin font-semibold text-heading">{user.email}</span>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-xs text-body font-semibold flex items-center gap-1.5">
                                <LuPhone className="w-3.5 h-3.5 text-accent" />
                                رقم الهاتف
                            </span>
                            <span className="font-latin font-semibold text-heading">{user.phone}</span>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-xs text-body font-semibold flex items-center gap-1.5">
                                <LuShieldCheck className="w-3.5 h-3.5 text-accent" />
                                الدور (Role)
                            </span>
                            <span className="font-bold text-accent">
                                {user.role === 'super' ? 'سوبر أدمن (Super Admin)' : 'مدير (Admin)'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="text-xs text-body font-semibold flex items-center gap-1.5">
                                الحالة
                            </span>
                            {user.status === 'active' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    نشط
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-200">
                                    غير نشط
                                </span>
                            )}
                        </div>

                        {user.createdAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-body font-semibold flex items-center gap-1.5">
                                    <LuCalendar className="w-3.5 h-3.5 text-body" />
                                    تاريخ الإنشاء
                                </span>
                                <span className="font-latin text-xs text-body">
                                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted/40 flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailsUsers;
