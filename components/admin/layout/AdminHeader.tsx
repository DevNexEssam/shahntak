'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuSearch, LuPlus, LuShieldCheck, LuPanelLeft } from 'react-icons/lu';

interface AdminHeaderProps {
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
    isSidebarCollapsed = false,
    onToggleSidebar,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/admin/dashboard/orders?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/admin/dashboard/orders');
        }
    };

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
                        placeholder="Search for a company, waybill, shipment, user..."
                        className="w-full pr-4 pl-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </form>
            </div>

            {/* Quick Actions & System Status Indicator */}
            <div className="flex items-center gap-4">

                {/* Platform System Health Indicator */}
                <div
                    className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-bold bg-accent/10 text-accent border-accent/20"
                    title="Status of servers and core systems"
                >
                    <LuShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <span>System Status: Servers Active (99.9%)</span>
                </div>

                {/* Add New Company Quick Button */}
                <Link
                    href="/admin/dashboard/companies?action=new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all cursor-pointer"
                >
                    <LuPlus className="w-4 h-4" />
                    <span>Add New Company</span>
                </Link>

            </div>

        </header>
    );
};