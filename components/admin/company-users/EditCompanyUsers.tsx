"use client";

import React, { useState, useEffect } from 'react';
import { CompanyUser, Company } from '@/types/data';
import { useUpdateCompanyUser, useUpdateCompanyUserRoleAndPermissions } from '@/hooks/companyUsers/useCompanyUsers';
import { companyUserUpdateValidationSchema } from '@/lib/validations/companyUser.schema';
import toast from 'react-hot-toast';
import {
    LuUser,
    LuX,
    LuMail,
    LuPhone,
    LuShieldCheck,
    LuKey,
    LuBuilding2,
    LuPencil
} from 'react-icons/lu';

interface EditCompanyUsersProps {
    isOpen?: boolean;
    user: CompanyUser | null;
    onClose: () => void;
}

export default function EditCompanyUsers({ isOpen = true, user, onClose }: EditCompanyUsersProps) {
    const [formValues, setFormValues] = useState({
        userName: '',
        userEmail: '',
        password: '',
        phone: '',
        userRole: 'staff' as 'owner' | 'manager' | 'staff',
        userIsActive: true,
        permissions: [] as string[],
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: updateCompanyUser, isPending: isUpdatingUser } = useUpdateCompanyUser();
    const { mutate: updateRoleAndPerms, isPending: isUpdatingRole } = useUpdateCompanyUserRoleAndPermissions();

    const isSubmitting = isUpdatingUser || isUpdatingRole;

    useEffect(() => {
        if (user) {
            setFormValues({
                userName: user.userName || '',
                userEmail: user.userEmail || '',
                password: '',
                phone: user.phone || '',
                userRole: user.userRole || 'staff',
                userIsActive: user.userIsActive ?? true,
                permissions: user.permissions || [],
            });
            setFieldErrors({});
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const companyName = typeof user.companyId === 'object' && user.companyId !== null
        ? (user.companyId as Company).companyName
        : 'شركة غير محددة';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Payload with clean properties
        const payload: Record<string, any> = {
            userName: formValues.userName,
            userEmail: formValues.userEmail,
            phone: formValues.phone,
            userRole: formValues.userRole,
            userIsActive: formValues.userIsActive,
            permissions: formValues.permissions,
        };

        if (formValues.password && formValues.password.trim() !== '') {
            payload.password = formValues.password;
        }

        // 1. Zod Validation Check
        const validation = companyUserUpdateValidationSchema.safeParse(payload);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("يرجى تصحيح الأخطاء الموضحة في النموذج");
            return;
        }

        // 2. Trigger Update Mutations
        updateCompanyUser(
            { id: user._id, updates: payload },
            {
                onSuccess: () => {
                    // Update Role and Permissions if changed
                    if (formValues.userRole !== user.userRole || JSON.stringify(formValues.permissions) !== JSON.stringify(user.permissions)) {
                        updateRoleAndPerms(
                            { id: user._id, userRole: formValues.userRole, permissions: formValues.permissions },
                            {
                                onSuccess: () => onClose(),
                            }
                        );
                    } else {
                        onClose();
                    }
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header - Identical to Add Modal Theme */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات الموظف</h2>
                            <p className="text-xs text-body mt-0.5">تعديل الحساب والصلاحيات لموظف: <span className="font-bold text-accent">{user.userName}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">

                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                بيانات الموظف والشركة
                            </h3>

                            {/* Company Info (Read-only display) */}
                            <div className="p-3.5 rounded-md bg-surface-muted border border-border flex items-center gap-3">
                                <div className="w-9 h-9 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                    <LuBuilding2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs text-body block font-medium">الشركة المرتبط بها</span>
                                    <span className="text-sm font-bold text-heading">{companyName}</span>
                                </div>
                            </div>

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
                                        placeholder="اسم الموظف"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.userName ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.userName && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.userName}</span>
                                    )}
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
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.userEmail ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.userEmail && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.userEmail}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuPhone className="w-3.5 h-3.5 text-body" />
                                        رقم الجوال <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.phone}
                                        onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                                        placeholder="0551234567"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.phone ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.phone && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.phone}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuKey className="w-3.5 h-3.5 text-body" />
                                        كلمة المرور الجديدة (اختياري)
                                    </label>
                                    <input
                                        type="password"
                                        disabled={isSubmitting}
                                        value={formValues.password}
                                        onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                                        placeholder="اتركها فارغة للتخطي"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.password ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.password && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.password}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuShieldCheck className="w-3.5 h-3.5 text-body" />
                                        دور الموظف  <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={isSubmitting}
                                        value={formValues.userRole}
                                        onChange={(e) => setFormValues({ ...formValues, userRole: e.target.value as 'owner' | 'manager' | 'staff' })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="staff">موظف</option>
                                        <option value="manager">مدير تشغيلي</option>
                                        <option value="owner">مالك شركة</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        حالة الموظف
                                    </label>
                                    <select
                                        disabled={isSubmitting}
                                        value={formValues.userIsActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormValues({ ...formValues, userIsActive: e.target.value === 'active' })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Modal Footer */}
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
                            {isSubmitting ? "جاري التعديل..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
