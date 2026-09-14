'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuSearch, LuPlus, LuCrown, LuPanelLeft } from 'react-icons/lu';
import { useCompanySubscriptionStatus } from '@/hooks/company/useCompanySubscriptionStatus';

interface CompanyHeaderProps {
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({
    isSidebarCollapsed = false,
    onToggleSidebar,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { planName, status, isLoading } = useCompanySubscriptionStatus();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/company/dashboard/orders?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/company/dashboard/orders');
        }
    };

    const getSubscriptionBadge = () => {
        if (isLoading) {
            return {
                label: 'Loading...',
                className: 'bg-surface-muted text-body border-border',
            };
        }

        switch (status) {
            case 'active':
                return {
                    label: `Active Plan: ${planName} (Active)`,
                    className: 'bg-accent-soft text-accent border-accent/20',
                };
            case 'expired':
                return {
                    label: `Plan: ${planName} (Expired)`,
                    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                };
            case 'cancelled':
                return {
                    label: `Plan: ${planName} (Cancelled)`,
                    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                };
            case 'pending_payment':
                return {
                    label: `Plan: ${planName} (Pending Payment)`,
                    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                };
            case 'no_subscription':
            default:
                return {
                    label: 'No Active Subscription',
                    className: 'bg-surface-muted text-body border-border',
                };
        }
    };

    const badge = getSubscriptionBadge();

    return (
        <header className="h-[76px] bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-30">

            {/* Sidebar Toggle & Search Form */}
            <div className="flex items-center gap-3">
                {onToggleSidebar && (
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer"
                        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <LuPanelLeft className="w-5 h-5" />
                    </button>
                )}

                <form onSubmit={handleSearchSubmit} className="relative w-72 sm:w-80">
                    <button
                        type="submit"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body hover:text-accent transition-colors"
                        title="Search"
                    >
                        <LuSearch className="w-4 h-4" />
                    </button>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for order, shipment, invoice, employee..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </form>
            </div>

            {/* Quick Actions & Subscription Status */}
            <div className="flex items-center gap-4">

                {/* Active Plan Indicator */}
                <Link
                    href="/company/dashboard/settings"
                    className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-bold transition-colors hover:opacity-80 ${badge.className}`}
                    title="View plan and subscription details"
                >
                    <LuCrown className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                </Link>

                {/* Create Order Quick Button */}
                <Link
                    href="/company/dashboard/orders?action=new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all cursor-pointer"
                >
                    <LuPlus className="w-4 h-4" />
                    <span>Add New Order</span>
                </Link>

            </div>

        </header>
    );
};
