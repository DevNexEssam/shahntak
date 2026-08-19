'use client';

import React from 'react';
import { LuSearch, LuBell, LuPlus, LuServer } from 'react-icons/lu';

export const AdminHeader: React.FC = () => {
    return (
        <header className="h-[76px] bg-surface border-b border-border px-8 flex items-center justify-between sticky top-0 z-30 font-arabic">

            {/* Search Input */}
            <div className="relative w-80">
                <LuSearch className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
                <input
                    type="text"
                    placeholder="ابحث عن شركة، بوليصة، شحنة، مستخدم..."
                    className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                />
            </div>

            {/* Quick Actions & System Status */}
            <div className="flex items-center gap-4">

                {/* System Health Indicator */}
                {/* <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/80 border text-white text-xs font-bold">
                    <LuServer className="w-3.5 h-3.5" />
                    <span>الخوادم تعمل بكفاءة ٩٩.٩٪</span>
                </div> */}

                {/* Create Company Quick Button */}
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all">
                    <LuPlus className="w-4 h-4" />
                    <span>إضافة شركة جديدة</span>
                </button>

                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-heading hover:bg-surface-muted transition-colors">
                    <LuBell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-warning rounded-full ring-2 ring-surface" />
                </button>

            </div>

        </header>
    );
};