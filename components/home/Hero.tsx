import React from 'react';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { HiPlay } from 'react-icons/hi2';
import { FaStar, FaTruckFast } from 'react-icons/fa6';

export const Hero: React.FC = () => {
    return (
        <section className="pt-[70px] bg-[radial-gradient(600px_300px_at_85%_-10%,rgba(116,68,253,0.10),transparent_60%)]">
            <div className="max-w-[1240px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-[50px] items-center pb-[70px]">

                    {/* Right Column: Hero Content & CTAs */}
                    <div>
                        <div className="inline-flex items-center gap-2 bg-accent-soft text-accent font-bold text-[13.5px] px-[18px] py-2 rounded-full mb-[22px]">
                            <span className="w-[7px] h-[7px] rounded-full bg-success shrink-0" />
                            <span>منصة سعودية لإدارة شركات الشحن</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-heading tracking-[-0.5px] leading-[1.25] mb-[22px]">
                            كل عمليات <span className="text-accent relative whitespace-nowrap">شركة الشحن</span> بتاعتك، في لوحة تحكم واحدة
                        </h1>

                        <p className="text-lg text-body max-w-[520px] mb-[34px] leading-relaxed">
                            شَحنتك منصة متعددة المستأجرين تمنح كل شركة شحن لوحة تحكم مستقلة لإدارة الطلبات والسائقين والفروع، مع تتبع لحظي وفوترة تلقائية — بدون أي تعقيد.
                        </p>

                        <div className="flex flex-wrap gap-3.5 mb-[38px]">
                            <Link
                                href="#"
                                className="inline-flex items-center justify-center gap-2 px-[30px] py-3.5 rounded-full bg-accent text-accent-foreground font-bold text-[15px] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(116,68,253,0.4)] transition-all"
                            >
                                <span>ابدأ الآن مجاناً</span>
                                <HiArrowLeft className="w-4 h-4" />
                            </Link>
                            <Link
                                href="#"
                                className="inline-flex items-center justify-center gap-2 px-[30px] py-3.5 rounded-full bg-transparent text-heading border-[1.5px] border-border hover:border-heading font-bold text-[15px] transition-colors"
                            >
                                <HiPlay className="w-4 h-4 text-heading" />
                                <span>شاهد العرض التوضيحي</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="flex -space-x-2.5 space-x-reverse">
                                <span className="w-[34px] h-[34px] rounded-full border-[2.5px] border-surface flex items-center justify-center text-xs font-bold text-white bg-accent">ش</span>
                                <span className="w-[34px] h-[34px] rounded-full border-[2.5px] border-surface flex items-center justify-center text-xs font-bold text-white bg-heading">ن</span>
                                <span className="w-[34px] h-[34px] rounded-full border-[2.5px] border-surface flex items-center justify-center text-xs font-bold text-heading bg-warning">ت</span>
                                <span className="w-[34px] h-[34px] rounded-full border-[2.5px] border-surface flex items-center justify-center text-xs font-bold text-heading bg-success">ك</span>
                            </div>
                            <small className="text-[13.5px] text-body font-semibold">
                                موثوقة من +٢٠٠ شركة شحن في المملكة
                            </small>
                        </div>
                    </div>

                    {/* Left Column: Interactive Mockup Visual */}
                    <div className="relative order-first lg:order-last">
                        <svg
                            className="absolute -top-10 -right-5 w-[120%] pointer-events-none z-0 opacity-90"
                            viewBox="0 0 500 400"
                            fill="none"
                        >
                            <path
                                d="M20 350 C 120 350, 100 200, 220 200 S 320 60, 460 60"
                                stroke="var(--color-accent)"
                                strokeWidth="2"
                                strokeDasharray="2 10"
                                strokeLinecap="round"
                                opacity="0.5"
                            />
                            <circle cx="20" cy="350" r="5" fill="var(--color-success)" />
                            <circle cx="220" cy="200" r="5" fill="var(--color-warning)" />
                            <circle cx="460" cy="60" r="6" fill="var(--color-accent)" />
                        </svg>

                        {/* Dashboard Card Container */}
                        <div className="relative z-10 bg-heading rounded-[32px] p-[22px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] text-white">
                            <div className="flex items-center justify-between mb-[18px]">
                                <div className="flex gap-1.5">
                                    <span className="w-[9px] h-[9px] rounded-full bg-white/25" />
                                    <span className="w-[9px] h-[9px] rounded-full bg-white/25" />
                                    <span className="w-[9px] h-[9px] rounded-full bg-white/25" />
                                </div>
                                <span className="text-[13px] font-bold text-white/60">لوحة تحكم شركة الرياض السريع</span>
                            </div>

                            {/* Map Route Animation Canvas */}
                            <div className="bg-gradient-to-br from-[#171717] to-[#0c0c0c] rounded-[20px] h-[230px] relative overflow-hidden mb-4">
                                <svg className="w-full h-full" viewBox="0 0 400 230" fill="none" preserveAspectRatio="none">
                                    <path
                                        d="M-10 190 C 60 190, 70 120, 140 120 S 220 60, 300 55 S 360 40, 420 20"
                                        stroke="var(--color-accent)"
                                        strokeWidth="2.5"
                                        strokeDasharray="1 9"
                                        strokeLinecap="round"
                                    />
                                    <circle cx="140" cy="120" r="4" fill="var(--color-warning)" />
                                    <circle cx="300" cy="55" r="4" fill="var(--color-success)" />
                                    <circle cx="35" cy="182" r="6" fill="var(--color-accent)">
                                        <animate attributeName="cx" values="35;150;300;35" dur="6s" repeatCount="indefinite" />
                                        <animate attributeName="cy" values="182;118;56;182" dur="6s" repeatCount="indefinite" />
                                    </circle>
                                </svg>
                            </div>

                            {/* Mockup Analytics Counters */}
                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="bg-white/6 rounded-[14px] p-3.5">
                                    <b className="block text-xl font-bold font-latin">١٬٢٤٠</b>
                                    <span className="text-xs text-white/55">طلب اليوم</span>
                                </div>
                                <div className="bg-white/6 rounded-[14px] p-3.5">
                                    <b className="block text-xl font-bold font-latin">٨٩</b>
                                    <span className="text-xs text-white/55">سائق نشط</span>
                                </div>
                                <div className="bg-white/6 rounded-[14px] p-3.5">
                                    <b className="block text-xl font-bold font-latin">٪٩٨</b>
                                    <span className="text-xs text-white/55">وصول بالوقت</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Status Badges */}
                        <div className="hidden sm:flex absolute top-[8%] -left-[8%] bg-surface text-heading rounded-[16px] px-4 py-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)] items-center gap-2.5 text-[13px] font-bold z-20">
                            <span className="w-8 h-8 rounded-[10px] bg-accent-soft text-accent flex items-center justify-center shrink-0">
                                <FaStar className="w-4 h-4" />
                            </span>
                            <span>تم تسليم الطلب #٤٤٢١</span>
                        </div>

                        <div className="hidden sm:flex absolute bottom-[6%] left-[2%] bg-surface text-heading rounded-[16px] px-4 py-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)] items-center gap-2.5 text-[13px] font-bold z-20">
                            <span className="w-8 h-8 rounded-[10px] bg-warning-soft text-warning flex items-center justify-center shrink-0">
                                <FaTruckFast className="w-4 h-4" />
                            </span>
                            <span>فاتورة جديدة ٣٬٢٠٠ ر.س</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Partner Logo Strip */}
            <div className="border-t border-b border-border bg-surface-muted">
                <div className="max-w-[1240px] mx-auto px-6 py-[26px] flex items-center justify-between gap-[30px] flex-wrap">
                    <small className="font-bold text-body text-[13px] shrink-0">
                        تثق بها أبرز شركات الشحن في المملكة
                    </small>
                    <div className="flex gap-[34px] flex-wrap opacity-75">
                        {['الرياض السريع', 'درب الشرق', 'نجم للنقل', 'توصيل بلس', 'مسار'].map((chip, i) => (
                            <span key={i} className="font-extrabold text-base text-heading opacity-55">
                                {chip}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};