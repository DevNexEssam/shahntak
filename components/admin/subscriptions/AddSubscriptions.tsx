"use client";

import React, { useState } from 'react';
import { useCreateSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { useAllCompanies } from '@/hooks/companies/useCompanies';
import { useAllPlans } from '@/hooks/plans/usePlans';
import { subscriptionCreateValidationSchema } from '@/lib/validations/subscription.schema';
import toast from 'react-hot-toast';
import {
    LuCrown,
    LuX,
    LuBuilding2,
    LuCreditCard,
    LuCalendar
} from 'react-icons/lu';

interface AddSubscriptionsProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddSubscriptions({ isOpen = true, onClose }: AddSubscriptionsProps) {
    const [formValues, setFormValues] = useState({
        companyId: '',
        planId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active' as const,
        autoRenew: true,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createSubscription, isPending: isSubmitting } = useCreateSubscription();
    const { data: companiesRes, isLoading: isLoadingCompanies } = useAllCompanies();
    const { data: plansRes, isLoading: isLoadingPlans } = useAllPlans();

    if (!isOpen) return null;

    const companies = companiesRes?.data || [];
    const plans = plansRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const validation = subscriptionCreateValidationSchema.safeParse(formValues);
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

        createSubscription(formValues, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuCrown className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Activate New Company Subscription</h2>
                            <p className="text-xs text-body mt-0.5">Assign a cloud plan to a company and define validity period and quotas</p>
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
                    <div className="p-6 overflow-y-auto space-y-5 flex-1 text-left">

                        {/* Company Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                Subscribed Company <span className="text-red-500">*</span>
                            </label>
                            <select
                                disabled={isSubmitting || isLoadingCompanies}
                                value={formValues.companyId}
                                onChange={(e) => setFormValues({ ...formValues, companyId: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 ${fieldErrors.companyId ? 'border-rose-500' : 'border-border'
                                    }`}
                            >
                                <option value="">Select company...</option>
                                {companies.map((comp) => (
                                    <option key={comp._id} value={comp._id}>
                                        {comp.companyName} ({comp.city})
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.companyId && (
                                <span className="text-xs text-rose-500 font-medium block">{fieldErrors.companyId}</span>
                            )}
                        </div>

                        {/* Plan Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCreditCard className="w-3.5 h-3.5 text-body" />
                                Requested Cloud Plan <span className="text-red-500">*</span>
                            </label>
                            <select
                                disabled={isSubmitting || isLoadingPlans}
                                value={formValues.planId}
                                onChange={(e) => setFormValues({ ...formValues, planId: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 ${fieldErrors.planId ? 'border-rose-500' : 'border-border'
                                    }`}
                            >
                                <option value="">Select cloud plan...</option>
                                {plans.map((pl) => (
                                    <option key={pl._id} value={pl._id}>
                                        {pl.name} - SAR {pl.price} / {pl.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.planId && (
                                <span className="text-xs text-rose-500 font-medium block">{fieldErrors.planId}</span>
                            )}
                        </div>

                        {/* Start and End Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCalendar className="w-3.5 h-3.5 text-body" />
                                    Subscription Start Date
                                </label>
                                <input
                                    type="date"
                                    disabled={isSubmitting}
                                    value={formValues.startDate}
                                    onChange={(e) => setFormValues({ ...formValues, startDate: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent cursor-pointer"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCalendar className="w-3.5 h-3.5 text-body" />
                                    Subscription End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    disabled={isSubmitting}
                                    value={formValues.endDate}
                                    onChange={(e) => setFormValues({ ...formValues, endDate: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent cursor-pointer ${fieldErrors.endDate ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {fieldErrors.endDate && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.endDate}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading block">
                                Subscription Status
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.status}
                                onChange={(e) => setFormValues({ ...formValues, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="active">Active</option>
                                <option value="pending_payment">Pending Payment</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
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
                            {isSubmitting ? "Activating..." : "Confirm Subscription"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
