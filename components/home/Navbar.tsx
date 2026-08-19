'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import { LuBox } from 'react-icons/lu';

export const Navbar: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-md border-b border-border">
            <div className="max-w-[1240px] mx-auto px-6 h-[76px] flex items-center justify-between">

                {/* Brand Logo */}
                <Link href="#" className="flex items-center gap-2.5 font-extrabold text-[22px] text-heading">
                    <span className="w-[38px] h-[38px] rounded-[11px] bg-accent flex items-center justify-center text-white shrink-0">
                        <LuBox className="w-5 h-5" />
                    </span>
                    شَحنتك
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-9">
                    <Link href="#features" className="font-semibold text-[15px] text-body hover:text-heading transition-colors">
                        المميزات
                    </Link>
                    <Link href="#how" className="font-semibold text-[15px] text-body hover:text-heading transition-colors">
                        كيف يعمل
                    </Link>
                    <Link href="#pricing" className="font-semibold text-[15px] text-body hover:text-heading transition-colors">
                        الأسعار
                    </Link>
                    <Link href="#testimonials" className="font-semibold text-[15px] text-body hover:text-heading transition-colors">
                        آراء العملاء
                    </Link>
                    <Link href="#contact" className="font-semibold text-[15px] text-body hover:text-heading transition-colors">
                        تواصل معنا
                    </Link>
                </nav>

                {/* Action Buttons */}
                <div className="flex items-center gap-3.5">
                    <Link
                        href="#"
                        className="hidden sm:inline-flex items-center justify-center px-[22px] py-[10px] rounded-full border-[1.5px] border-border text-heading hover:border-heading font-bold text-sm transition-colors"
                    >
                        تسجيل الدخول
                    </Link>
                    <Link
                        href="#"
                        className="inline-flex items-center justify-center px-[22px] py-[10px] rounded-full bg-primary hover:bg-heading text-primary-foreground font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
                    >
                        ابدأ مجاناً
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-1.5 text-heading"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? <HiOutlineX className="w-7 h-7" /> : <HiOutlineMenuAlt3 className="w-7 h-7" />}
                    </button>
                </div>

            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-surface border-b border-border px-6 py-5 flex flex-col gap-4">
                    <Link
                        href="#features"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base text-body hover:text-heading"
                    >
                        المميزات
                    </Link>
                    <Link
                        href="#how"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base text-body hover:text-heading"
                    >
                        كيف يعمل
                    </Link>
                    <Link
                        href="#pricing"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base text-body hover:text-heading"
                    >
                        الأسعار
                    </Link>
                    <Link
                        href="#testimonials"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base text-body hover:text-heading"
                    >
                        آراء العملاء
                    </Link>
                    <Link
                        href="#contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-semibold text-base text-body hover:text-heading"
                    >
                        تواصل معنا
                    </Link>
                    <div className="pt-2 border-t border-border flex flex-col gap-2.5">
                        <Link
                            href="#"
                            className="text-center py-2.5 rounded-full border border-border text-heading font-bold text-sm"
                        >
                            تسجيل الدخول
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};