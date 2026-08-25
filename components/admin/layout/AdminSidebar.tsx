'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LuLayoutDashboard,
    LuBuilding2,
    LuPackage,
    LuRoute,
    LuReceipt,
    LuFileSpreadsheet,
    LuSettings,
    LuBox,
    LuLogOut,
    LuShieldAlert,
    LuUser,
    LuUsers
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
        href: '/admin',
        icon: <LuLayoutDashboard className="w-5 h-5" />,
    },
    {
        title: 'الشركات المشتركة',
        href: '/admin/companies',
        icon: <LuBuilding2 className="w-5 h-5" />,
        badge: '٢٤ شركة',
    },
    {
        title: 'موظفو الشركات',
        href: '/admin/company-users',
        icon: <LuUsers className="w-5 h-5" />,
    },
    {
        title: 'الطلبات والشحنات',
        href: '/admin/orders',
        icon: <LuPackage className="w-5 h-5" />,
    },
    {
        title: 'المسارات والخطوط',
        href: '/admin/routes',
        icon: <LuRoute className="w-5 h-5" />,
    },
    {
        title: 'الأسطول والشاحنات',
        href: '/admin/vehicles',
        icon: <LuBox className="w-5 h-5" />,
    },
    {
        title: 'البوالص والفواتير',
        href: '/admin/invoices',
        icon: <LuReceipt className="w-5 h-5" />,
    },
    {
        title: 'التقارير والإحصائيات',
        href: '/admin/reports',
        icon: <LuFileSpreadsheet className="w-5 h-5" />,
    },
    {
        title: 'المستخدمون والمدراء',
        href: '/admin/users',
        icon: <LuUser className="w-5 h-5" />,
    },
    {
        title: 'إعدادات المنصة',
        href: '/admin/settings',
        icon: <LuSettings className="w-5 h-5" />,
    },
];

export const AdminSidebar: React.FC = () => {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-heading text-white flex flex-col justify-between border-l border-white/10 shrink-0 h-screen sticky top-0 font-arabic">

            {/* Brand Header */}
            <div>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shrink-0 shadow-md shadow-accent/20">
                            <LuBox className="w-6 h-6" />
                        </span>
                        <div>
                            <span className="font-extrabold text-lg block leading-tight text-white">شحنتك</span>
                            <span className="text-[11px] font-semibold text-accent flex items-center gap-1 mt-0.5">
                                <LuShieldAlert className="w-3 h-3" />
                                لوحة السوبر أدمن
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <span className="px-3 text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-2">
                        إدارة المنصة
                    </span>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${isActive
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
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
                                        }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Super Admin Profile & Logout */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-sm">
                            أ
                        </div>
                        <div className="text-right">
                            <span className="block text-xs font-bold text-white">أحمد المنشاوي</span>
                            <span className="block text-[10px] text-white/50">مدير عام المنصة</span>
                        </div>
                    </div>
                    <button
                        title="تسجيل الخروج"
                        className="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                        <LuLogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </aside>
    );
};