"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import Loading from '@/components/ui/loading';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const role = (session?.user as any)?.role;

    useEffect(() => {
        if (status === 'authenticated') {
            if (role !== 'super' && role !== 'admin') {
                router.replace('/company/dashboard');
            }
        } else if (status === 'unauthenticated') {
            router.replace('/admin/login');
        }
    }, [status, role, router]);

    if (status === 'loading') {
        return <Loading />;
    }

    if (role !== 'super' && role !== 'admin') {
        return <Loading />;
    }

    return (
        <div className="flex min-h-screen bg-surface-muted text-body font-arabic selection:bg-accent selection:text-white" dir="rtl">
            {/* Sidebar */}
            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <main className="p-8 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
