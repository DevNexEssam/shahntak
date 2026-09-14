"use client";

import React, { useState } from 'react';
import { useCreateUser } from '@/hooks/users/useUsers';
import { userCreateValidationSchema } from '@/lib/validations/user.schema';
import toast from 'react-hot-toast';
import {
    LuUser,
    LuX,
    LuMail,
    LuPhone,
    LuShieldCheck,
    LuKey
} from 'react-icons/lu';

interface AddUsersProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddUsers({ isOpen = true, onClose }: AddUsersProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'admin' as 'admin' | 'super',
        status: 'active' as 'active' | 'inactive',
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createUser, isPending } = useCreateUser();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Zod Validation Check
        const validation = userCreateValidationSchema.safeParse(formData);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("Please correct the errors in the form");
            return;
        }

        // Trigger Mutation
        createUser(formData, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuUser className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Add New User</h2>
                            <p className="text-xs text-body mt-0.5">Create a new user account and set role and permissions</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
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
                                Personal User Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuUser className="w-3.5 h-3.5 text-body" />
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isPending}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.name ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.name && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.name}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMail className="w-3.5 h-3.5 text-body" />
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        disabled={isPending}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="admin@shahnetak.sa"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.email ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.email && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.email}</span>
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
                                        disabled={isPending}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0501234567"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.phone ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.phone && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.phone}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuShieldCheck className="w-3.5 h-3.5 text-body" />
                                        Role & Permissions <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={isPending}
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'super' })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="admin">System Admin</option>
                                        <option value="super">Super Admin</option>
                                    </select>
                                    {fieldErrors.role && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.role}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuKey className="w-3.5 h-3.5 text-body" />
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        disabled={isPending}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.password ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.password && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.password}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        Status
                                    </label>
                                    <select
                                        disabled={isPending}
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {fieldErrors.status && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.status}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Modal Footer */}
                    <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-5 py-2.5 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isPending ? "Adding..." : "Save User"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
