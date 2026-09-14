"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CompanySidebar } from './CompanySidebar';
import { CompanyHeader } from './CompanyHeader';
import { SubscriptionAlertBanner } from './SubscriptionAlertBanner';
import Loading from '@/components/ui/loading';

export default function CompanyClientLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const role = (session?.user as any)?.role;

    useEffect(() => {
        if (status === 'authenticated') {
            if (role === 'super' || role === 'admin') {
                router.replace('/admin/dashboard');
            }
        } else if (status === 'unauthenticated') {
            router.replace('/company/login');
        }
    }, [status, role, router]);

    if (status === 'loading') {
        return <Loading />;
    }

    if (role === 'super' || role === 'admin' || !session) {
        return <Loading />;
    }

    return (
        <div className="flex min-h-screen bg-surface-muted text-body selection:bg-accent selection:text-white">
            {/* Sidebar */}
            <CompanySidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <CompanyHeader
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <SubscriptionAlertBanner />
                <main className="p-8 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
