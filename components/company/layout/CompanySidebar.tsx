'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    LuLayoutDashboard,
    LuPackage,
    LuReceipt,
    LuFileSpreadsheet,
    LuSettings,
    LuBox,
    LuLogOut,
    LuBuilding2,
    LuUsers,
    LuTruck,
    LuCrown,
} from 'react-icons/lu';

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}

const navItems: NavItem[] = [
    {
        title: 'لوحة التحكم',
        href: '/company/dashboard',
        icon: <LuLayoutDashboard className="w-5 h-5" />,
    },
    {
        title: 'إدارة الطلبات',
        href: '/company/dashboard/orders',
        icon: <LuPackage className="w-5 h-5" />,
    },
    {
        title: 'الشحنات وتعيين الموارد',
        href: '/company/dashboard/shipments',
        icon: <LuTruck className="w-5 h-5" />,
    },
    {
        title: 'البوالص والفواتير',
        href: '/company/dashboard/invoices',
        icon: <LuReceipt className="w-5 h-5" />,
    },
    {
        title: 'فريق العمل والموظفين',
        href: '/company/dashboard/employees',
        icon: <LuUsers className="w-5 h-5" />,
    },
    {
        title: 'الأسطول والشاحنات',
        href: '/company/dashboard/vehicles',
        icon: <LuBox className="w-5 h-5" />,
    },
    {
        title: 'التقارير والإحصائيات',
        href: '/company/dashboard/reports',
        icon: <LuFileSpreadsheet className="w-5 h-5" />,
    },
    {
        title: 'إعدادات الشركة والاشتراك',
        href: '/company/dashboard/settings',
        icon: <LuSettings className="w-5 h-5" />,
    },
];

export const CompanySidebar: React.FC = () => {
    const pathname = usePathname();
    const { data: session } = useSession();

    const userName = session?.user?.name || 'مستخدم الشركة';
    const userEmail = session?.user?.email || '';
    const userRole = (session?.user as any)?.role === 'company' ? 'إدارة الشركة' : 'موظف';
    const companyName = (session?.user as any)?.companyName || 'شركة شحن partner';

    return (
        <aside className="w-72 bg-heading text-white flex flex-col justify-between border-l border-white/10 shrink-0 h-screen sticky top-0 font-arabic">
            {/* Brand Header */}
            <div>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <Link href="/company/dashboard" className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shrink-0 shadow-md shadow-accent/20">
                            <LuBuilding2 className="w-6 h-6" />
                        </span>
                        <div>
                            <span className="font-extrabold text-lg block leading-tight text-white">شحنتك</span>
                            <span className="text-[11px] font-semibold text-accent flex items-center gap-1 mt-0.5">
                                <LuCrown className="w-3 h-3" />
                                بوابة الشركات
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <span className="px-3 text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-2">
                        قائمة بوابة الشركة
                    </span>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-accent text-white shadow-accent/30'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={isActive ? 'text-white' : 'text-white/60'}>
                                        {item.icon}
                                    </span>
                                    <span>{item.title}</span>
                                </div>
                                {item.badge && (
                                    <span
                                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Profile & Logout */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {userName.charAt(0) || 'ش'}
                        </div>
                        <div className="text-right truncate">
                            <span className="block text-xs font-bold text-white truncate">{userName}</span>
                            <span className="block text-[10px] text-white/50 truncate">{companyName} ({userRole})</span>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/company/login' })}
                        title="تسجيل الخروج"
                        className="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                    >
                        <LuLogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};
