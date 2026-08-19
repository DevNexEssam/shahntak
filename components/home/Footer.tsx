import React from 'react';
import Link from 'next/link';
import { FaXTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { LuBox } from 'react-icons/lu';

export const Footer: React.FC = () => {
    return (
        <footer id="contact" className="pt-20 pb-[30px]">
            <div className="max-w-[1240px] mx-auto px-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] gap-10 pb-14 border-b border-border">
                    {/* Brand Info & Socials */}
                    <div>
                        <Link href="#" className="flex items-center gap-2.5 font-extrabold text-[22px] text-heading">
                            <span className="w-[38px] h-[38px] rounded-[11px] bg-accent flex items-center justify-center text-white shrink-0">
                                <LuBox className="w-5 h-5" />
                            </span>
                            شَحنتك
                        </Link>
                        <p className="text-[14.5px] text-body max-w-[280px] my-5 leading-relaxed">
                            منصة سعودية متعددة المستأجرين تساعد شركات الشحن والتوصيل على إدارة عملياتها من مكان واحد.
                        </p>

                        <div className="flex gap-2.5">
                            <Link href="#" aria-label="Twitter" className="w-[38px] h-[38px] rounded-full bg-surface-muted border border-border flex items-center justify-center text-body hover:bg-heading hover:border-heading hover:text-white transition-all">
                                <FaXTwitter className="w-4 h-4" />
                            </Link>
                            <Link href="#" aria-label="Instagram" className="w-[38px] h-[38px] rounded-full bg-surface-muted border border-border flex items-center justify-center text-body hover:bg-heading hover:border-heading hover:text-white transition-all">
                                <FaInstagram className="w-4 h-4" />
                            </Link>
                            <Link href="#" aria-label="LinkedIn" className="w-[38px] h-[38px] rounded-full bg-surface-muted border border-border flex items-center justify-center text-body hover:bg-heading hover:border-heading hover:text-white transition-all">
                                <FaLinkedinIn className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-[14.5px] font-bold text-heading mb-5">المنتج</h4>
                        <ul className="space-y-3">
                            <li><Link href="#features" className="text-[14.5px] text-body hover:text-accent transition-colors">المميزات</Link></li>
                            <li><Link href="#pricing" className="text-[14.5px] text-body hover:text-accent transition-colors">الأسعار</Link></li>
                            <li><Link href="#" className="text-[14.5px] text-body hover:text-accent transition-colors">لوحة التحكم</Link></li>
                            <li><Link href="#" className="text-[14.5px] text-body hover:text-accent transition-colors">تطبيق السائقين</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-[14.5px] font-bold text-heading mb-5">الشركة</h4>
                        <ul className="space-y-3">
                            <li><Link href="#" className="text-[14.5px] text-body hover:text-accent transition-colors">من نحن</Link></li>
                            <li><Link href="#" className="text-[14.5px] text-body hover:text-accent transition-colors">المدونة</Link></li>
                            <li><Link href="#" className="text-[14.5px] text-body hover:text-accent transition-colors">وظائف</Link></li>
                            <li><Link href="#" className="text-[14.5px] text-body hover:text-accent transition-colors">تواصل معنا</Link></li>
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h4 className="text-[14.5px] font-bold text-heading mb-5">تواصل معنا</h4>
                        <ul className="space-y-3">
                            <li><a href="tel:+966920000000" className="text-[14.5px] text-body hover:text-accent transition-colors font-latin">920000000</a></li>
                            <li><a href="mailto:hello@shahnetak.sa" className="text-[14.5px] text-body hover:text-accent transition-colors font-latin">hello@shahnetak.sa</a></li>
                            <li><span className="text-[14.5px] text-body">الرياض، المملكة العربية السعودية</span></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-[26px] flex flex-col sm:flex-row justify-between items-center gap-3.5 text-[13px] text-body">
                    <p>© ٢٠٢٦ شَحنتك. جميع الحقوق محفوظة.</p>
                    <p>سياسة الخصوصية · الشروط والأحكام</p>
                </div>

            </div>
        </footer>
    );
};