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
                label: 'جاري التحميل...',
                className: 'bg-surface-muted text-body border-border',
            };
        }

        switch (status) {
            case 'active':
                return {
                    label: `الباقة النشطة: ${planName} (نشط)`,
                    className: 'bg-accent-soft text-accent border-accent/20',
                };
            case 'expired':
                return {
                    label: `الباقة: ${planName} (منتهي)`,
                    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                };
            case 'cancelled':
                return {
                    label: `الباقة: ${planName} (ملغى)`,
                    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                };
            case 'pending_payment':
                return {
                    label: `الباقة: ${planName} (في انتظار الدفع)`,
                    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                };
            case 'no_subscription':
            default:
                return {
                    label: 'لا يوجد اشتراك نشط',
                    className: 'bg-surface-muted text-body border-border',
                };
        }
    };

    const badge = getSubscriptionBadge();

    return (
        <header className="h-[76px] bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-30 font-arabic">

            {/* Sidebar Toggle & Search Form */}
            <div className="flex items-center gap-3">
                {onToggleSidebar && (
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer"
                        title={isSidebarCollapsed ? "فتح وتكبير القائمة الجانبية" : "طي القائمة الجانبية"}
                    >
                        <LuPanelLeft className="w-5 h-5" />
                    </button>
                )}

                <form onSubmit={handleSearchSubmit} className="relative w-72 sm:w-80">
                    <button
                        type="submit"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-body hover:text-accent transition-colors"
                        title="بحث"
                    >
                        <LuSearch className="w-4 h-4" />
                    </button>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن طلب، شحنة، فاتورة، موظف..."
                        className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </form>
            </div>

            {/* Quick Actions & Subscription Status */}
            <div className="flex items-center gap-4">

                {/* Active Plan Indicator */}
                <Link
                    href="/company/dashboard/settings"
                    className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-bold transition-colors hover:opacity-80 ${badge.className}`}
                    title="عرض تفاصيل الباقة والاشتراك"
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
                    <span>إضافة طلب جديد</span>
                </Link>

            </div>

        </header>
    );
};
