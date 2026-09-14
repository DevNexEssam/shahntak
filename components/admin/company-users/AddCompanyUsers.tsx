"use client";

import React, { useState } from 'react';
import AdminCompanySelect from '@/components/admin/common/AdminCompanySelect';
import AdminCompanySubscriptionWidget from '@/components/admin/common/AdminCompanySubscriptionWidget';
import { useCreateCompanyUser } from '@/hooks/companyUsers/useCompanyUsers';
import { useAllCompanies } from '@/hooks/companies/useCompanies';
import { companyUserCreateValidationSchema } from '@/lib/validations/companyUser.schema';
import toast from 'react-hot-toast';
import {
    LuUser,
    LuX,
    LuMail,
    LuPhone,
    LuShieldCheck,
    LuKey,
    LuBuilding2
} from 'react-icons/lu';

interface AddCompanyUsersProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddCompanyUsers({ isOpen = true, onClose }: AddCompanyUsersProps) {
    const [formValues, setFormValues] = useState({
        companyId: '',
        userName: '',
        userEmail: '',
        password: '',
        phone: '',
        userRole: 'staff' as 'owner' | 'manager' | 'staff',
        userIsActive: true,
        permissions: [] as string[],
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createCompanyUser, isPending: isSubmitting } = useCreateCompanyUser();
    const { data: companiesRes, isLoading: isLoadingCompanies } = useAllCompanies();

    if (!isOpen) return null;

    const companies = companiesRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Zod Validation Check
        const validation = companyUserCreateValidationSchema.safeParse(formValues);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("Please correct the errors highlighted in the form");
            return;
        }

        // Trigger Mutation
        createCompanyUser(formValues, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="ltr">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuUser className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Add New Company Staff</h2>
                            <p className="text-xs text-body mt-0.5">Register a new employee and specify their company, role, and permissions</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-50"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">

                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                Employee & Company Information
                            </h3>

                            {/* Company Selection with Live Subscription Quota */}
                            <div className="space-y-2">
                                <AdminCompanySelect
                                    value={formValues.companyId}
                                    onChange={(companyId: string) => {
                                        setFormValues((prev) => ({ ...prev, companyId }));
                                        if (fieldErrors.companyId) {
                                            setFieldErrors((prev) => ({ ...prev, companyId: '' }));
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    error={fieldErrors.companyId}
                                />

                                {/* Live Subscription Quota Widget */}
                                {formValues.companyId && (
                                    <AdminCompanySubscriptionWidget
                                        companyId={formValues.companyId}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuUser className="w-3.5 h-3.5 text-body" />
                                        Employee Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.userName}
                                        onChange={(e) => setFormValues({ ...formValues, userName: e.target.value })}
                                        placeholder="e.g., Khalid Al-Otaibi"
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
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        disabled={isSubmitting}
                                        value={formValues.userEmail}
                                        onChange={(e) => setFormValues({ ...formValues, userEmail: e.target.value })}
                                        placeholder="employee@company.com"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.userEmail ? 'border-rose-500' : 'border-border'
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
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.phone}
                                        onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                                        placeholder="0551234567"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.phone ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.phone && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.phone}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuKey className="w-3.5 h-3.5 text-body" />
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        disabled={isSubmitting}
                                        value={formValues.password}
                                        onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                                        placeholder="••••••••"
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
                                        Employee Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={isSubmitting}
                                        value={formValues.userRole}
                                        onChange={(e) => setFormValues({ ...formValues, userRole: e.target.value as 'owner' | 'manager' | 'staff' })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="manager">Operations Manager</option>
                                        <option value="owner">Company Owner</option>
                                    </select>
                                    {fieldErrors.userRole && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.userRole}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        Employee Status
                                    </label>
                                    <select
                                        disabled={isSubmitting}
                                        value={formValues.userIsActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormValues({ ...formValues, userIsActive: e.target.value === 'active' })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
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
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "Adding..." : "Save Data"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}