"use client";

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-surface-muted text-body font-arabic selection:bg-accent selection:text-white" dir="rtl">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
                <main className="p-8 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
