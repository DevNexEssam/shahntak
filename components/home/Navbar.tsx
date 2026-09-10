'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
    FaBars,
    FaTimes,
    FaTruck,
    FaChevronDown,
    FaGithub,
    FaStar,
    FaTachometerAlt,
    FaSignOutAlt,
} from 'react-icons/fa';
import Image from 'next/image';

const navLinks = [
    { label: 'الميزات', href: '#features' },
    { label: 'الأسعار', href: '#pricing' },
    { label: 'آراء العملاء', href: '#testimonials' },
    { label: 'اتصل بنا', href: '#cta' },
];

const resourcesLinks = [
    { label: 'مستودع GitHub', href: 'https://github.com/DevNexEssam/shahntak', icon: FaGithub, description: 'الكود المصدري والمشكلات' },
    { label: 'نجمة على GitHub', href: 'https://github.com/DevNexEssam/shahntak', icon: FaStar, description: 'أظهر دعمك' },
];

export default function Navbar() {
    const { data: session, status } = useSession();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);

    const userDropdownRef = useRef<HTMLDivElement>(null);
    const resourcesRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target as Node)
            ) {
                setUserDropdownOpen(false);
            }
            if (
                resourcesRef.current &&
                !resourcesRef.current.contains(event.target as Node)
            ) {
                setResourcesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === 'super' || userRole === 'admin';
    const dashboardHref = isAdmin ? '/admin/dashboard' : '/company/dashboard';
    const userName = session?.user?.name || session?.user?.email || 'المستخدم';

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'super':
            case 'admin':
                return 'مدير المنصة';
            case 'company':
                return 'حساب شركة';
            case 'owner':
                return 'مالك الحساب';
            case 'manager':
                return 'مدير تشغيلي';
            case 'staff':
                return 'موظف';
            default:
                return 'مستخدم مسجّل';
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-surface/90 backdrop-blur-md border-b border-border shadow-sm'
                    : 'bg-surface/80 backdrop-blur-md border-b border-border/50'
            }`}
        >
            <nav className="container-narrow flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                {/* Logo */}
                <Link href="#" className="flex items-center gap-2.5 shrink-0">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                        <FaTruck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold text-heading tracking-tight">
                        شحنَتك
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="text-sm font-medium text-body hover:text-heading transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}

                    {/* Resources Dropdown */}
                    <li ref={resourcesRef} className="relative">
                        <button
                            onClick={() => setResourcesOpen(!resourcesOpen)}
                            className="flex items-center gap-1.5 text-sm font-medium text-body hover:text-heading transition-colors duration-200 cursor-pointer"
                        >
                            <span>الموارد</span>
                            <FaChevronDown
                                className={`w-3 h-3 transition-transform duration-200 ${
                                    resourcesOpen ? 'rotate-180 text-primary' : ''
                                }`}
                            />
                        </button>

                        {resourcesOpen && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50">
                                {resourcesLinks.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            target={item.href.startsWith('http') ? '_blank' : undefined}
                                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            onClick={() => setResourcesOpen(false)}
                                            className="flex items-start gap-3 px-4 py-3 hover:bg-surface-muted transition-colors duration-150 group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-surface-muted group-hover:bg-accent/10 flex items-center justify-center shrink-0 transition-colors">
                                                <Icon className="w-4.5 h-4.5 text-body group-hover:text-accent transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-heading">{item.label}</p>
                                                <p className="text-xs text-body-muted">{item.description}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </li>
                </ul>

                {/* Desktop Action Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="https://github.com/DevNexEssam/shahntak"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-body hover:text-heading hover:bg-surface-muted transition-colors"
                        aria-label="GitHub"
                    >
                        <FaGithub className="w-5 h-5" />
                    </Link>

                    {status === 'authenticated' && session?.user ? (
                        <div className="relative" ref={userDropdownRef}>
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-muted/50 transition-all text-right shadow-xs cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                                    {session.user.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={userName}
                                            className="w-8 h-8 rounded-lg object-cover"
                                        />
                                    ) : (
                                        userName[0]?.toUpperCase() || 'ش'
                                    )}
                                </div>
                                <div className="flex flex-col text-right leading-tight min-w-0">
                                    <span className="text-sm font-bold text-heading truncate max-w-[120px]">
                                        {userName}
                                    </span>
                                    <span className="text-[10px] font-medium text-body-muted truncate">
                                        {getRoleLabel(userRole)}
                                    </span>
                                </div>
                                <FaChevronDown
                                    className={`w-3 h-3 text-body-muted transition-transform duration-200 shrink-0 ${
                                        userDropdownOpen ? 'rotate-180 text-primary' : ''
                                    }`}
                                />
                            </button>

                            {userDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-surface border border-border shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-4 py-3 border-b border-border/80 text-right bg-surface-muted/30">
                                        <p className="text-sm font-bold text-heading truncate">{userName}</p>
                                        <p className="text-xs text-body-muted truncate mt-0.5" dir="ltr">
                                            {session.user.email}
                                        </p>
                                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20">
                                            {getRoleLabel(userRole)}
                                        </span>
                                    </div>

                                    <div className="py-1 px-1">
                                        <Link
                                            href={dashboardHref}
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-body hover:text-heading hover:bg-surface-muted transition-colors text-right"
                                        >
                                            <FaTachometerAlt className="w-4 h-4 text-accent shrink-0" />
                                            <span>لوحة التحكم</span>
                                        </Link>
                                    </div>

                                    <div className="pt-1 border-t border-border/80 px-1">
                                        <button
                                            onClick={() => {
                                                setUserDropdownOpen(false);
                                                signOut({ callbackUrl: '/' });
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors text-right cursor-pointer"
                                        >
                                            <FaSignOutAlt className="w-4 h-4 shrink-0" />
                                            <span>تسجيل الخروج</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/company/login"
                                className="text-sm font-medium text-body hover:text-heading transition-colors"
                            >
                                تسجيل الدخول
                            </Link>
                            <Link href="#pricing" className="btn-accent">
                                ابدأ الآن
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-muted transition-colors cursor-pointer"
                    aria-label="القائمة"
                >
                    {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            {mobileOpen && (
                <div className="md:hidden bg-surface border-b border-border shadow-lg">
                    <div className="px-4 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-2.5 text-sm font-medium text-body hover:text-heading hover:bg-surface-muted rounded-lg transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-3 border-t border-border mt-3">
                            <p className="px-4 pb-2 text-xs font-secondary font-medium text-body-muted uppercase tracking-wider">
                                الموارد
                            </p>
                            {resourcesLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        target={item.href.startsWith('http') ? '_blank' : undefined}
                                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-body hover:text-heading hover:bg-surface-muted rounded-lg transition-colors"
                                    >
                                        <Icon className="w-4 h-4 text-accent" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-3 border-t border-border mt-3 space-y-2">
                            {status === 'authenticated' && session?.user ? (
                                <div className="p-3 bg-surface-muted/50 rounded-xl border border-border/80 space-y-3">
                                    <div className="flex items-center gap-3 text-right">
                                        <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-base">
                                            {session.user.image ? (
                                                <Image
                                                    src={session.user.image}
                                                    alt={userName}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                userName[0]?.toUpperCase() || 'ش'
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-heading truncate">
                                                {userName}
                                            </span>
                                            <span className="text-xs text-body-muted truncate" dir="ltr">
                                                {session.user.email}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-border/60 space-y-1">
                                        <Link
                                            href={dashboardHref}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-colors"
                                        >
                                            <FaTachometerAlt className="w-4 h-4 shrink-0" />
                                            <span>لوحة التحكم</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setMobileOpen(false);
                                                signOut({ callbackUrl: '/' });
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-right cursor-pointer"
                                        >
                                            <FaSignOutAlt className="w-4 h-4 shrink-0" />
                                            <span>تسجيل الخروج</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/company/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="block w-full px-4 py-2.5 text-sm font-medium text-body hover:text-heading transition-colors text-center border border-border rounded-xl"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        onClick={() => setMobileOpen(false)}
                                        className="btn-accent w-full text-center block"
                                    >
                                        ابدأ الآن
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}