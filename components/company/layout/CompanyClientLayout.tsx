"use client";

import React from 'react';
import { CompanySidebar } from './CompanySidebar';
import { CompanyHeader } from './CompanyHeader';

export default function CompanyClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-surface-muted text-body font-arabic selection:bg-accent selection:text-white" dir="rtl">
            {/* Sidebar */}
            <CompanySidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <CompanyHeader />
                <main className="p-8 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
