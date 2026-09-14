"use client";

import React from 'react';
import { Subscription, Company, Plan } from '@/types/data';
import {
    LuCrown,
    LuX,
    LuBuilding2,
    LuCreditCard,
    LuCalendar,
    LuBox,
    LuLayers,
    LuCheck,
    LuTriangleAlert
} from 'react-icons/lu';

interface DetailsSubscriptionsProps {
    isOpen?: boolean;
    subscription: Subscription | null;
    onClose: () => void;
}

export default function DetailsSubscriptions({ isOpen = true, subscription, onClose }: DetailsSubscriptionsProps) {
    if (!isOpen || !subscription) return null;

    const company = typeof subscription.companyId === 'object' && subscription.companyId !== null ? (subscription.companyId as Company) : null;
    const plan = typeof subscription.planId === 'object' && subscription.planId !== null ? (subscription.planId as Plan) : null;

    const statusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>;
            case 'pending_payment':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">Pending Payment</span>;
            case 'expired':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">Expired</span>;
            case 'cancelled':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">Cancelled</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600">{status}</span>;
        }
    };

    const maxOrders = plan?.maxOrdersPerMonth ?? -1;
    const ordersUsed = subscription.ordersUsedThisMonth || 0;
    const ordersPercent = maxOrders === -1 ? 0 : Math.min(100, Math.round((ordersUsed / maxOrders) * 100));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuCrown className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Company Subscription Details</h2>
                            <p className="text-xs text-body mt-0.5">Plan info, renewal period, and usage balance</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Details Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-left">

                    {/* Company and Status Header */}
                    <div className="p-4 rounded-2xl bg-surface-muted/80 border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                <LuBuilding2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-heading">{company?.companyName || 'Subscribed Company'}</h3>
                                <span className="text-xs text-body block">{company?.email} | {company?.city}</span>
                            </div>
                        </div>
                        {statusBadge(subscription.status)}
                    </div>

                    {/* Plan Summary */}
                    <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-body">Assigned Plan:</span>
                            <span className="text-sm font-black text-accent">{plan?.name || 'Unspecified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-body">Subscription Price:</span>
                            <span className="text-sm font-extrabold text-heading font-latin">SAR {plan?.price?.toLocaleString('en-US')} / {plan?.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                        </div>
                    </div>

                    {/* Usage Progress Bar */}
                    <div className="space-y-2 p-4 rounded-2xl bg-surface-muted border border-border">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-heading flex items-center gap-1.5">
                                <LuBox className="w-4 h-4 text-accent" />
                                Monthly Orders Usage
                            </span>
                            <span className="text-accent font-latin font-extrabold">
                                {ordersUsed} / {maxOrders === -1 ? 'Unlimited' : maxOrders}
                            </span>
                        </div>

                        {maxOrders !== -1 && (
                            <div className="w-full bg-surface-muted border border-border rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${ordersPercent >= 90 ? 'bg-rose-500' : ordersPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${ordersPercent}%` }}
                                />
                            </div>
                        )}

                        {ordersPercent >= 90 && maxOrders !== -1 && (
                            <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                                <LuTriangleAlert className="w-3.5 h-3.5 shrink-0" />
                                Warning: Company is close to reaching the plan order limit.
                            </p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-surface-muted border border-border">
                            <LuCalendar className="w-4 h-4 text-body mx-auto mb-1" />
                            <span className="text-[11px] text-body block font-bold">Start Date</span>
                            <span className="text-xs font-extrabold text-heading font-latin">
                                {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('en-US') : '-'}
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-surface-muted border border-border">
                            <LuCalendar className="w-4 h-4 text-body mx-auto mb-1" />
                            <span className="text-[11px] text-body block font-bold">End Date</span>
                            <span className="text-xs font-extrabold text-heading font-latin">
                                {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('en-US') : '-'}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border bg-surface-muted/40 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
